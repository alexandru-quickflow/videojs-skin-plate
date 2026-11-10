import '@videojs/html/video/player';
import '@videojs/html/media/mux-video';
import '@/video/skin';
import skinTemplate from '@/video/skin.html?raw';
import type { Source } from '../shell/params';

// What the preview plays. Change these to try the skin with your own media; any Mux or HLS URL works.
const SRC = 'https://stream.mux.com/83EzHOvVzVN01AsrD01BCpiH02Pj3S8mfzBOu101w2nHC5s.m3u8';
const POSTER = 'https://image.mux.com/83EzHOvVzVN01AsrD01BCpiH02Pj3S8mfzBOu101w2nHC5s/thumbnail.webp?time=69';
/** The Quick Flow showreel, which carries no chapters of its own (the trailer's come with its Mux asset). */
const PLAIN_SRC = 'https://stream.mux.com/aXI42UOoIwGj6KnF016x8K7QO5l6P01KqH4SHOiIGLMGA.m3u8';
const PLAIN_POSTER = 'https://image.mux.com/aXI42UOoIwGj6KnF016x8K7QO5l6P01KqH4SHOiIGLMGA/thumbnail.webp?time=9';
/** A playback id that does not exist, so the stream fails and the error dialog opens. */
const BROKEN_SRC = 'https://stream.mux.com/not-a-playback-id.m3u8';

// Tracks served from `apps/preview/public`.
const CHAPTERS = '<track kind="chapters" label="English" srclang="en" src="./cosmic-dawn-chapters.vtt" default>';
const ONE_CHAPTER = '<track kind="chapters" label="English" srclang="en" src="./one-chapter.vtt" default>';

const TRACKS: Record<Exclude<Source, 'custom'>, string> = {
  chapters: CHAPTERS,
  'one-chapter': ONE_CHAPTER,
  'no-chapters': '',
  error: CHAPTERS,
};

const attr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const MEDIA_PLACEHOLDER = '<!-- Add a compatible media component here. -->';

/** Your own media, for the `custom` source. */
export interface CustomMedia {
  src: string;
  chapters: string;
}

export function createPlayer(source: Source = 'chapters', custom?: CustomMedia): HTMLElement {
  const player = document.createElement('video-player');
  const plain = source === 'no-chapters';
  player.setAttribute('poster', plain ? PLAIN_POSTER : POSTER);
  player.setAttribute('content-title', plain ? 'Showreel' : 'Cosmic Dawn');

  if (source === 'custom') {
    player.removeAttribute('poster');
    player.setAttribute('content-title', 'Your video');
    const track = custom?.chapters
      ? `<track kind="chapters" label="Chapters" srclang="en" src="${attr(custom.chapters)}" default>`
      : '';
    player.innerHTML = skinTemplate.replace(
      MEDIA_PLACEHOLDER,
      custom?.src ? `<mux-video src="${attr(custom.src)}" playsinline crossorigin>${track}</mux-video>` : '<mux-video playsinline crossorigin></mux-video>'
    );
    return player;
  }

  const src = source === 'error' ? BROKEN_SRC : plain ? PLAIN_SRC : SRC;
  player.innerHTML = skinTemplate.replace(
    MEDIA_PLACEHOLDER,
    `<mux-video src="${src}" playsinline crossorigin>${TRACKS[source as Exclude<Source, 'custom'>]}</mux-video>`
  );

  return player;
}
