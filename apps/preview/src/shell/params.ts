import { defaultWidth, locales, skin } from './config';

/** Audio skins have no picture, so the aspect ratio only applies to video. */
export const hasAspectRatio = !skin.preset.endsWith('audio');

export const COLOR_SCHEMES = ['auto', 'light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/** `auto` follows the language, as a page with that `lang` would. */
export const TEXT_DIRECTIONS = ['auto', 'ltr', 'rtl'] as const;
export type TextDirection = (typeof TEXT_DIRECTIONS)[number];

export const ASPECT_RATIOS = ['intrinsic', '16:9', '4:3', '1:1', '9:16', '21:9'] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

/** Plate's themes, set as data-plate-theme on the page as a site would. */
export const THEMES = ['night', 'blueprint', 'signal', 'auto'] as const;
export type Theme = (typeof THEMES)[number];

/** What the preview plays: the trailer with chapters, the edge cases, and a stream that fails. */
export const SOURCES = ['chapters', 'one-chapter', 'no-chapters', 'error', 'custom'] as const;
export type Source = (typeof SOURCES)[number];

export const INDEX_PLACES = ['end', 'start', 'none'] as const;
export type IndexPlace = (typeof INDEX_PLACES)[number];

export const RULERS = ['dense', 'sparse'] as const;
export type Ruler = (typeof RULERS)[number];

/** Widths where Plate's layout changes: phone keys, chapter strip, the full row with Quality. */
export const WIDTH_PRESETS = [
  { label: 'Phone', width: 375 },
  { label: 'Tablet', width: 768 },
  { label: 'Laptop', width: 1120 },
  { label: 'Wide', width: 1360 },
] as const;

export const PRELOAD_VALUES = ['auto', 'metadata', 'none'] as const;
export type PreloadValue = (typeof PRELOAD_VALUES)[number];

export type Locale = (typeof locales)[number];

export const PLAYER_WIDTH = { min: 240, max: 1360, stops: [384, 512, 672, 960, 1360] } as const;

/** What the shell controls and the preview frame applies. Both read and write it as URL parameters. */
export interface WorkbenchParams {
  width: number;
  ratio: AspectRatio;
  scheme: ColorScheme;
  dir: TextDirection;
  locale: Locale;
  theme: Theme;
  source: Source;
  /** Your own media for the `custom` source: an HLS or MP4 URL, and a WebVTT chapters URL. */
  customSrc: string;
  customChapters: string;
  /** Plate's public properties; empty means the theme's own. */
  accent: string;
  playhead: string;
  radius: string;
  number: string;
  playingWord: string;
  index: IndexPlace;
  ruler: Ruler;
  head: boolean;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  preload: PreloadValue;
}

const HEX = /^#[0-9a-f]{6}$/i;
const hex = (value: string | null) => (value && HEX.test(value) ? value.toLowerCase() : '');
const text = (value: string | null, max: number) => (value ?? '').slice(0, max);
/** Only https links, so a shared URL can't point the preview anywhere else. */
const link = (value: string | null) => {
  try {
    const url = new URL(value ?? '');
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};

function oneOf<const Values extends readonly string[]>(values: Values, value: string | null, fallback: Values[number]) {
  return values.includes(value ?? '') ? (value as Values[number]) : fallback;
}

export function readParams(query: string): WorkbenchParams {
  const params = new URLSearchParams(query);
  const width = Number(params.get('width'));
  const flag = (name: string) => params.get(name) === '1';

  return {
    width: Number.isFinite(width) && width >= PLAYER_WIDTH.min ? Math.min(width, PLAYER_WIDTH.max) : defaultWidth,
    ratio: oneOf(ASPECT_RATIOS, params.get('ratio'), '16:9'),
    scheme: oneOf(COLOR_SCHEMES, params.get('scheme'), 'auto'),
    dir: oneOf(TEXT_DIRECTIONS, params.get('dir'), 'auto'),
    locale: oneOf(locales, params.get('locale'), 'en'),
    theme: oneOf(THEMES, params.get('theme'), 'night'),
    source: oneOf(SOURCES, params.get('source'), 'chapters'),
    customSrc: link(params.get('src')),
    customChapters: link(params.get('chapters')),
    accent: hex(params.get('accent')),
    playhead: hex(params.get('playhead')),
    radius: /^\d{1,2}$/.test(params.get('radius') ?? '') ? params.get('radius')! : '',
    number: text(params.get('number'), 4),
    playingWord: text(params.get('word'), 16),
    index: oneOf(INDEX_PLACES, params.get('index'), 'end'),
    ruler: oneOf(RULERS, params.get('ruler'), 'dense'),
    head: params.get('head') !== '0',
    autoplay: flag('autoplay'),
    muted: flag('muted'),
    loop: flag('loop'),
    preload: oneOf(PRELOAD_VALUES, params.get('preload'), 'metadata'),
  };
}

export function writeParams(value: WorkbenchParams): string {
  const flag = (on: boolean) => (on ? '1' : '0');

  return new URLSearchParams({
    width: String(value.width),
    ratio: value.ratio,
    scheme: value.scheme,
    dir: value.dir,
    locale: value.locale,
    theme: value.theme,
    source: value.source,
    src: value.customSrc,
    chapters: value.customChapters,
    accent: value.accent,
    playhead: value.playhead,
    radius: value.radius,
    number: value.number,
    word: value.playingWord,
    index: value.index,
    ruler: value.ruler,
    head: flag(value.head),
    autoplay: flag(value.autoplay),
    muted: flag(value.muted),
    loop: flag(value.loop),
    preload: value.preload,
  }).toString();
}

/** The inline styles the preview puts on the player's wrapper. */
export function playerStyles(value: WorkbenchParams): Record<string, string> {
  const styles: Record<string, string> = { '--preview-player-width': `${value.width}px` };

  // `auto` undoes the skin's own ratio, so the media's intrinsic size decides.
  if (hasAspectRatio)
    styles['--preview-player-ratio'] = value.ratio === 'intrinsic' ? 'auto' : value.ratio.replace(':', ' / ');

  return styles;
}

/** The playback options as media props, for React previews. */
export function playbackProps(value: WorkbenchParams) {
  return { autoPlay: value.autoplay, muted: value.muted, loop: value.loop, preload: value.preload };
}

export type PlaybackProps = ReturnType<typeof playbackProps>;

/** Languages written right to left, for `dir: 'auto'`. */
const RTL_LANGUAGES = new Set(['ar', 'fa', 'he', 'ps', 'sd', 'ug', 'ur', 'yi', 'ckb', 'dv']);

export function localeDirection(locale: string): 'ltr' | 'rtl' {
  return RTL_LANGUAGES.has(locale.split('-')[0]!) ? 'rtl' : 'ltr';
}

const LANGUAGE_NAMES = new Intl.DisplayNames('en', { type: 'language' });

export function localeLabel(locale: string): string {
  return LANGUAGE_NAMES.of(locale) ?? locale;
}

/**
 * Apply the document-level options in the preview frame. The player reads its language from the page's `lang` and loads
 * the matching built-in translations itself.
 */
export function applyDocumentParams(value: WorkbenchParams): void {
  const root = document.documentElement;

  root.style.colorScheme = value.scheme === 'auto' ? '' : value.scheme;
  root.lang = value.locale;
  root.dir = value.dir === 'auto' ? localeDirection(value.locale) : value.dir;
  if (value.theme === 'night') delete root.dataset.plateTheme;
  else root.dataset.plateTheme = value.theme;

  // The public properties, on the page as a site would set them; the player inherits them.
  const set = (name: string, v: string) => (v ? root.style.setProperty(name, v) : root.style.removeProperty(name));
  set('--plate-accent', value.accent);
  set('--plate-on-accent', value.accent ? onAccent(value.accent) : '');
  set('--plate-playhead', value.playhead);
  set('--plate-radius', value.radius ? `${value.radius}px` : '');
  set('--plate-number', value.number ? cssString(value.number) : '');
  set('--plate-word-playing', value.playingWord ? cssString(value.playingWord) : '');
}

/** The skin's layout switches, on its container. */
export function applySkinParams(container: HTMLElement, value: WorkbenchParams): void {
  if (value.index === 'end') delete container.dataset.index;
  else container.dataset.index = value.index;
  if (value.ruler === 'sparse') container.dataset.ruler = 'sparse';
  else delete container.dataset.ruler;
  if (value.head) delete container.dataset.head;
  else container.dataset.head = 'none';
}

/** A CSS string for `content`. */
export const cssString = (value: string) => `"${value.replace(/[\\"]/g, '\\$&').replace(/[\r\n]+/g, ' ')}"`;

/** Text on the accent: whichever of Plate's two inks reads better on it (WCAG contrast). */
export function onAccent(hexColor: string): string {
  const n = parseInt(hexColor.slice(1), 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  const dark = (l + 0.05) / (0.0094 + 0.05);
  const light = 1.05 / (l + 0.05);
  return dark >= light ? '#04171a' : '#ffffff';
}

/** The `mountPlate` call for the current settings, the way a site would write it. */
export function codeSnippet(value: WorkbenchParams): string {
  const custom = value.source === 'custom';
  const lines: string[] = [
    `  src: '${(custom && value.customSrc) || 'https://stream.mux.com/PLAYBACK_ID.m3u8'}',`,
    `  chapters: '${(custom && value.customChapters) || '/chapters.vtt'}',`,
  ];
  if (value.theme !== 'night') lines.push(`  theme: '${value.theme}',`);
  if (value.index !== 'end') lines.push(`  index: '${value.index}',`);
  if (value.ruler !== 'dense') lines.push(`  ruler: '${value.ruler}',`);
  if (!value.head) lines.push('  head: false,');
  if (value.number) lines.push(`  number: ${JSON.stringify(value.number)},`);
  if (value.playingWord) lines.push(`  words: { playing: ${JSON.stringify(value.playingWord)} },`);
  const style: string[] = [];
  if (value.accent) style.push(`'--plate-accent': '${value.accent}'`, `'--plate-on-accent': '${onAccent(value.accent)}'`);
  if (value.playhead) style.push(`'--plate-playhead': '${value.playhead}'`);
  if (value.radius) style.push(`'--plate-radius': '${value.radius}px'`);
  if (style.length) lines.push(`  style: { ${style.join(', ')} },`);
  return `const { mountPlate } = await import('/plate/plate-embed.js');\n\nmountPlate(document.querySelector('#reel'), {\n${lines.join('\n')}\n});`;
}

/** Where the deployed workbench serves the embed build (see apps/preview/stage-embed.mjs). */
export const EMBED_BASE = 'https://staging.plate-skin.pages.dev/embed/';

/** The whole block a site builder's HTML or Embed element takes: fonts, styles and the player. */
export function embedSnippet(value: WorkbenchParams): string {
  const custom = value.source === 'custom';
  const options = [
    `    src: '${(custom && value.customSrc) || 'YOUR_VIDEO_LINK'}',`,
    `    chapters: '${(custom && value.customChapters) || 'YOUR_CHAPTERS_LINK'}',`,
    `    title: 'My video',`,
  ];
  if (value.theme !== 'night') options.push(`    theme: '${value.theme}',`);
  if (value.index !== 'end') options.push(`    index: '${value.index}',`);
  if (value.ruler !== 'dense') options.push(`    ruler: '${value.ruler}',`);
  if (!value.head) options.push('    head: false,');
  if (value.number) options.push(`    number: ${JSON.stringify(value.number)},`);
  if (value.playingWord) options.push(`    words: { playing: ${JSON.stringify(value.playingWord)} },`);
  const style: string[] = [];
  if (value.accent) style.push(`'--plate-accent': '${value.accent}'`, `'--plate-on-accent': '${onAccent(value.accent)}'`);
  if (value.playhead) style.push(`'--plate-playhead': '${value.playhead}'`);
  if (value.radius) style.push(`'--plate-radius': '${value.radius}px'`);
  if (style.length) options.push(`    style: { ${style.join(', ')} },`);

  return [
    '<div id="plate-player"></div>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&display=swap">',
    `<link rel="stylesheet" href="${EMBED_BASE}plate-embed.css">`,
    '<script type="module">',
    `  import { mountPlate } from '${EMBED_BASE}plate-embed.js';`,
    "  mountPlate(document.getElementById('plate-player'), {",
    ...options,
    '  });',
    '</script>',
  ].join('\n');
}
