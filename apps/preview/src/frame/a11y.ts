// Measures the skin as it renders, for the workbench's Accessibility section: the accessible name of each control
// the player shows, and the contrast of its colours against the plate, for whatever theme and properties are set.
import { A11Y_MESSAGE } from '../shell/messages';

export interface ContrastRow {
  name: string;
  ratio: number;
  /** The WCAG minimum for this pairing: 4.5 for text, 3 for parts of controls. */
  minimum: number;
}

export interface A11yReport {
  controls: { name: string; role: string }[];
  contrast: ContrastRow[];
}

type Rgba = [number, number, number, number];

/** Reads a computed colour in any of the forms Chrome, Firefox and Safari return. */
function parse(value: string): Rgba | null {
  const rgb = value.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b, a = '1'] = rgb[1]!.split(/[ ,/]+/).filter(Boolean);
    return [Number(r), Number(g), Number(b), Number(a)];
  }
  const srgb = value.match(/color\(srgb ([^)]+)\)/);
  if (srgb) {
    const [r, g, b, a = '1'] = srgb[1]!.split(/[ /]+/).filter(Boolean);
    return [Number(r) * 255, Number(g) * 255, Number(b) * 255, Number(a)];
  }
  return null;
}

const over = ([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba => [
  r * a + br * (1 - a),
  g * a + bg * (1 - a),
  b * a + bb * (1 - a),
  1,
];

function luminance([r, g, b]: Rgba): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const ratio = (a: Rgba, b: Rgba) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

/** The colour a custom property resolves to inside the skin, through a probe element. */
function resolve(skin: HTMLElement, property: string): Rgba | null {
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${property})`;
  skin.append(probe);
  const value = parse(getComputedStyle(probe).color);
  probe.remove();
  return value;
}

function accessibleName(el: Element): string {
  const label = el.getAttribute('aria-label');
  if (label) return label.trim();
  const ids = el.getAttribute('aria-labelledby');
  if (ids) return ids.split(' ').map((id) => document.getElementById(id)?.textContent?.trim() ?? '').join(' ').trim();
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function measure(): A11yReport | null {
  const skin = document.querySelector<HTMLElement>('.media-skin.pl');
  if (!skin) return null;

  const surface = resolve(skin, '--pl-surface');
  const accent = resolve(skin, '--pl-teal');
  if (!surface || !accent) return null;

  const onSurface = (property: string) => {
    const color = resolve(skin, property);
    return color ? ratio(over(color, surface), surface) : 0;
  };
  const onAccent = resolve(skin, '--pl-on-teal');

  const contrast: ContrastRow[] = [
    { name: 'Text', ratio: onSurface('--pl-paper'), minimum: 4.5 },
    { name: 'Muted text', ratio: onSurface('--pl-mute'), minimum: 4.5 },
    { name: 'Labels', ratio: onSurface('--pl-faint'), minimum: 4.5 },
    { name: 'Accent (playing chapter, status)', ratio: onSurface('--pl-teal'), minimum: 4.5 },
    { name: 'Text on the Play key', ratio: onAccent ? ratio(onAccent, accent) : 0, minimum: 4.5 },
    { name: 'Slider track', ratio: onSurface('--pl-track'), minimum: 3 },
    { name: 'Playhead', ratio: onSurface('--pl-hot'), minimum: 3 },
    { name: 'Focus ring (accent)', ratio: onSurface('--pl-teal'), minimum: 3 },
  ];

  const controls = [
    ...skin.querySelectorAll<HTMLElement>('button, [role="button"], [role="slider"], media-time[tabindex]'),
  ]
    .filter((el) => el.offsetParent !== null && !el.closest('[hidden], media-menu:not([data-open]), media-popover'))
    .map((el) => ({ name: accessibleName(el), role: el.getAttribute('role') ?? el.localName }))
    .filter((row, i, all) => all.findIndex((other) => other.name === row.name && other.role === row.role) === i);

  return { controls, contrast };
}

/** Send a fresh report to the workbench now and whenever the player may have changed. */
export function startReporting(): void {
  // At most one measurement every half second: playback changes attributes many times a second.
  let pending = false;
  const send = () => {
    if (pending) return;
    pending = true;
    window.setTimeout(() => {
      pending = false;
      const report = measure();
      if (report) window.parent.postMessage({ type: A11Y_MESSAGE, report }, location.origin);
    }, 500);
  };
  send();
  new MutationObserver(send).observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-label', 'hidden', 'data-plate-theme', 'style', 'lang', 'data-availability'],
  });
}
