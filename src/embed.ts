// A self-contained build of Plate for sites that are not a Vite app: one ES module and one stylesheet.
// It brings the player, the Mux media element and the skin, and leaves the fonts to the host page.
import '@videojs/html/video/player';
import '@videojs/html/media/mux-video';
import '@videojs/html/i18n';
import './video/core';
import './embed.css';
import template from './video/skin.html?raw';

export interface PlateOptions {
  /** A Mux stream URL (https://stream.mux.com/<playback-id>.m3u8) or any HLS/MP4 URL. */
  src: string;
  poster?: string;
  title?: string;
  /** A WebVTT chapters file; each cue becomes an entry in the index and a mark on the ruler. */
  chapters?: string;
  /** Start playing once mounted. Call this from a click so the browser allows it. */
  autoplay?: boolean;
  /** A built-in theme. `auto` follows the system: night when dark, blueprint when light. */
  theme?: 'night' | 'blueprint' | 'signal' | 'auto';
  /** The plate's number in the head, such as "02". */
  number?: string;
  /** Where the chapter index sits on wide players, or none. */
  index?: 'end' | 'start' | 'none';
  /** `sparse` keeps only the tall tick every tenth of the ruler. */
  ruler?: 'dense' | 'sparse';
  /** `false` drops the head line. */
  head?: boolean;
  /** Your own status words, such as { playing: 'On air' }. */
  words?: Partial<Record<'ready' | 'playing' | 'paused' | 'loading' | 'ended' | 'error', string>>;
  /** Any public property, such as { '--plate-accent': '#ff6b00' }. */
  style?: Record<`--plate-${string}`, string>;
}

const MEDIA_PLACEHOLDER = '<!-- Add a compatible media component here. -->';

const attr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Replace `host`'s content with a Plate player. Returns the `<video-player>` element. */
export function mountPlate(host: HTMLElement, options: PlateOptions): HTMLElement {
  const player = document.createElement('video-player');
  if (options.poster) player.setAttribute('poster', options.poster);
  if (options.title) player.setAttribute('content-title', options.title);

  const track = options.chapters
    ? `<track kind="chapters" label="Chapters" srclang="en" src="${attr(options.chapters)}" default>`
    : '';
  player.innerHTML = template.replace(
    MEDIA_PLACEHOLDER,
    // Without a src the media stays idle, so a page can mount first and set the source later.
    `<mux-video${options.src ? ` src="${attr(options.src)}"` : ''} playsinline crossorigin>${track}</mux-video>`
  );

  // Options: the theme and properties go on the player, the layout switches on the skin's container.
  if (options.theme && options.theme !== 'night') player.dataset.plateTheme = options.theme;
  const container = player.querySelector<HTMLElement>('.media-skin.pl');
  if (container) {
    if (options.index && options.index !== 'end') container.dataset.index = options.index;
    if (options.ruler === 'sparse') container.dataset.ruler = 'sparse';
    if (options.head === false) container.dataset.head = 'none';
  }
  // Strings in custom properties are read by `content`, so they go in quoted.
  if (options.number) player.style.setProperty('--plate-number', JSON.stringify(options.number));
  for (const [state, word] of Object.entries(options.words ?? {})) {
    if (word) player.style.setProperty(`--plate-word-${state}`, JSON.stringify(word));
  }
  for (const [name, value] of Object.entries(options.style ?? {})) {
    if (name.startsWith('--plate-')) player.style.setProperty(name, value);
  }

  // The i18n provider follows the page's lang, so the skin speaks the page's language.
  const i18n = document.createElement('media-i18n');
  i18n.append(player);
  host.replaceChildren(i18n);

  if (options.autoplay) {
    void customElements.whenDefined('mux-video').then(() => {
      const media = player.querySelector('mux-video') as (HTMLElement & { play?: () => Promise<void> }) | null;
      void media?.play?.().catch(() => undefined);
    });
  }

  return player;
}
