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
export const SOURCES = ['chapters', 'many-chapters', 'long-titles', 'one-chapter', 'no-chapters', 'error', 'custom'] as const;
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

/** Plate's status words, plus the label on the ruler's preview. Empty keeps the skin's own, in every language. */
export const WORD_KEYS = ['ready', 'playing', 'paused', 'loading', 'ended', 'error', 'detail'] as const;
export type WordKey = (typeof WORD_KEYS)[number];

/** Google Fonts that suit the plate, under the SIL Open Font License. The first is Plate's own. */
export const SERIF_FONTS = ['Newsreader', 'Fraunces', 'Instrument Serif', 'Source Serif 4', 'Lora', 'Playfair Display'] as const;
export const MONO_FONTS = ['JetBrains Mono', 'IBM Plex Mono', 'DM Mono', 'Space Mono', 'Fira Code', 'Roboto Mono'] as const;
export type SerifFont = (typeof SERIF_FONTS)[number];
export type MonoFont = (typeof MONO_FONTS)[number];

/** The four colours of the plate itself, with Night's values for the colour wells. */
export const PALETTE = [
  { key: 'surface', label: 'Plate', property: '--plate-surface', night: '#0c1013' },
  { key: 'print', label: 'Text and lines', property: '--plate-print', night: '#e9f2f0' },
  { key: 'ink', label: 'Behind the plate', property: '--plate-ink', night: '#04080b' },
  { key: 'raised', label: 'Menus and dialog', property: '--plate-raised', night: '#151a1c' },
] as const;
export type PaletteKey = (typeof PALETTE)[number]['key'];

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
  palette: Record<PaletteKey, string>;
  serif: SerifFont;
  mono: MonoFont;
  radius: string;
  number: string;
  words: Record<WordKey, string>;
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
    palette: Object.fromEntries(PALETTE.map(({ key }) => [key, hex(params.get(key))])) as Record<PaletteKey, string>,
    serif: oneOf(SERIF_FONTS, params.get('serif'), 'Newsreader'),
    mono: oneOf(MONO_FONTS, params.get('mono'), 'JetBrains Mono'),
    radius: /^\d{1,2}$/.test(params.get('radius') ?? '') ? params.get('radius')! : '',
    number: text(params.get('number'), 4),
    words: Object.fromEntries(
      WORD_KEYS.map((key) => [key, text(params.get(`w-${key}`) ?? (key === 'playing' ? params.get('word') : null), 16)])
    ) as Record<WordKey, string>,
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
    ...Object.fromEntries(PALETTE.map(({ key }) => [key, value.palette[key]])),
    serif: value.serif,
    mono: value.mono,
    radius: value.radius,
    number: value.number,
    ...Object.fromEntries(WORD_KEYS.map((key) => [`w-${key}`, value.words[key]])),
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
  for (const name of [...root.style]) if (name.startsWith('--plate-')) root.style.removeProperty(name);
  for (const [name, v] of plateProperties(value)) root.style.setProperty(name, v);
  loadFonts(value);
}

const FONT_CATEGORY = { serif: 'serif', mono: 'monospace' } as const;

/** Every public property the current settings set, as a site would write them, colours and fonts first. */
export function plateProperties(value: WorkbenchParams, { withWords = true } = {}): [string, string][] {
  const out: [string, string][] = [];
  if (value.accent) out.push(['--plate-accent', value.accent], ['--plate-on-accent', onAccent(value.accent)]);
  if (value.playhead) out.push(['--plate-playhead', value.playhead]);
  for (const { key, property } of PALETTE) if (value.palette[key]) out.push([property, value.palette[key]]);
  if (value.serif !== 'Newsreader') out.push(['--plate-font-serif', `"${value.serif}", ${FONT_CATEGORY.serif}`]);
  if (value.mono !== 'JetBrains Mono') out.push(['--plate-font-mono', `"${value.mono}", ${FONT_CATEGORY.mono}`]);
  if (value.radius) out.push(['--plate-radius', `${value.radius}px`]);
  if (value.number) out.push(['--plate-number', cssString(value.number)]);
  if (withWords) for (const key of WORD_KEYS) if (value.words[key]) out.push([`--plate-word-${key}`, cssString(value.words[key])]);
  return out;
}

/** The Google Fonts stylesheet for the chosen faces. */
export function fontsUrl(value: WorkbenchParams): string {
  const family = (name: string, axes: string) => `family=${name.replace(/ /g, '+')}${axes}`;
  const serifAxes = value.serif === 'Instrument Serif' ? ':ital@0;1' : ':ital,wght@0,300;0,400;1,300;1,400';
  return `https://fonts.googleapis.com/css2?${family(value.serif, serifAxes)}&${family(value.mono, ':wght@400;500')}&display=swap`;
}

/** In the preview: load the chosen faces once each, from Google Fonts. */
function loadFonts(value: WorkbenchParams): void {
  if (value.serif === 'Newsreader' && value.mono === 'JetBrains Mono') return;
  const href = fontsUrl(value);
  if (document.querySelector(`link[data-plate-fonts][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.plateFonts = '';
  document.head.append(link);
}

/** The words as a mountPlate option, or nothing. */
function wordsOption(value: WorkbenchParams, indent: string): string[] {
  const set = WORD_KEYS.filter((key) => value.words[key]);
  if (!set.length) return [];
  return [`${indent}words: { ${set.map((key) => `${key}: ${JSON.stringify(value.words[key])}`).join(', ')} },`];
}

/** The style option: every property but the number and the words, which have options of their own. */
function styleOption(value: WorkbenchParams, indent: string): string[] {
  const entries = plateProperties(value, { withWords: false }).filter(([name]) => name !== '--plate-number');
  if (!entries.length) return [];
  return [`${indent}style: {`, ...entries.map(([n, v]) => `${indent}  '${n}': ${JSON.stringify(v)},`), `${indent}},`];
}

/** Your theme as a stylesheet: the properties on the player, and the theme it starts from. */
export function themeCss(value: WorkbenchParams): string {
  const entries = plateProperties(value);
  const lines = [
    '/* A Plate theme from the workbench. */',
    value.theme === 'night'
      ? '/* Starts from Night, the default. */'
      : `/* Starts from ${value.theme}: put data-plate-theme="${value.theme}" on the player or the page. */`,
    'video-player {',
    ...(entries.length ? entries.map(([n, v]) => `  ${n}: ${v};`) : ['  /* No changes yet: pick colours, fonts or words in Customise. */']),
    '}',
  ];
  if (value.index !== 'end' || value.ruler !== 'dense' || !value.head) {
    lines.push(
      '',
      '/* Layout switches go on the skin\'s container, <media-container class="media-skin pl">: */',
      `/* ${[value.index !== 'end' && `data-index="${value.index}"`, value.ruler !== 'dense' && 'data-ruler="sparse"', !value.head && 'data-head="none"'].filter(Boolean).join(' ')} */`
    );
  }
  return lines.join('\n') + '\n';
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

export { cssString } from '@/css-string';
import { cssString } from '@/css-string';

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
    `  src: ${JSON.stringify((custom && value.customSrc) || 'https://stream.mux.com/PLAYBACK_ID.m3u8')},`,
    `  chapters: ${JSON.stringify((custom && value.customChapters) || '/chapters.vtt')},`,
  ];
  if (value.theme !== 'night') lines.push(`  theme: '${value.theme}',`);
  if (value.index !== 'end') lines.push(`  index: '${value.index}',`);
  if (value.ruler !== 'dense') lines.push(`  ruler: '${value.ruler}',`);
  if (!value.head) lines.push('  head: false,');
  if (value.number) lines.push(`  number: ${JSON.stringify(value.number)},`);
  lines.push(...wordsOption(value, '  '), ...styleOption(value, '  '));
  return `const { mountPlate } = await import('${EMBED_BASE}plate-embed.js');\n\nmountPlate(document.querySelector('#reel'), {\n${lines.join('\n')}\n});`;
}

/** Where the deployed workbench serves the embed build (see apps/preview/stage-embed.mjs). */
export const EMBED_BASE = 'https://staging.plate-skin.pages.dev/embed/';

/** The whole block a site builder's HTML or Embed element takes: fonts, styles and the player. */
export function embedSnippet(value: WorkbenchParams): string {
  const custom = value.source === 'custom';
  const options = [
    `    src: ${JSON.stringify((custom && value.customSrc) || 'YOUR_VIDEO_LINK')},`,
    `    chapters: ${JSON.stringify((custom && value.customChapters) || 'YOUR_CHAPTERS_LINK')},`,
    `    title: "My video",`,
  ];
  if (value.theme !== 'night') options.push(`    theme: '${value.theme}',`);
  if (value.index !== 'end') options.push(`    index: '${value.index}',`);
  if (value.ruler !== 'dense') options.push(`    ruler: '${value.ruler}',`);
  if (!value.head) options.push('    head: false,');
  if (value.number) options.push(`    number: ${JSON.stringify(value.number)},`);
  options.push(...wordsOption(value, '    '), ...styleOption(value, '    '));

  return [
    '<div id="plate-player"></div>',
    `<link rel="stylesheet" href="${fontsUrl(value)}">`,
    `<link rel="stylesheet" href="${EMBED_BASE}plate-embed.css">`,
    '<script type="module">',
    `  import { mountPlate } from '${EMBED_BASE}plate-embed.js';`,
    "  mountPlate(document.getElementById('plate-player'), {",
    ...options,
    '  });',
    '</script>',
  ].join('\n');
}
