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

  // The More popover and its label need ids of their own on a page with several players.
  const uid = Math.random().toString(36).slice(2, 8);
  const popover = player.querySelector('.pl-more');
  const trigger = player.querySelector('.pl-btn-more');
  const label = player.querySelector('.pl-more-label');
  if (popover && trigger && label) {
    popover.id = `pl-more-${uid}`;
    label.id = `pl-more-label-${uid}`;
    trigger.setAttribute('commandfor', popover.id);
    popover.setAttribute('aria-labelledby', label.id);
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
