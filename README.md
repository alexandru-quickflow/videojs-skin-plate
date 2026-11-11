# Plate

A Video.js v10 skin drawn like a technical plate: a numbered head with a status word, the picture framed by corner marks, a chapter index beside it, a ruler for a timeline and text keys underneath. It was made for the Video.js Skins Design Challenge on Contra, and it plays the showreel on [quickflow.dev](https://quickflow.dev).

**[See it live](https://quickflow.dev/work/plate/)** · **[Try it in the workbench](https://plate.quickflow.dev/)**

![The Plate player playing the second chapter of a showreel: a numbered head, the picture in corner marks, a chapter index beside it, a ruler timeline and word keys underneath.](https://quickflow.dev/work/plate/playing.jpg)

## What it does

- **Chapter index.** One button per chapter cue, with its frame from the storyboard (`media-thumbnail`), the playing one in the accent colour. Click one and the video jumps there. Video.js has no chapter navigation control yet, so the `pl-chapters` element reads the chapter cues from the player store. It shows only when the media has two or more chapters. Below a 760px wide player it becomes a strip that scrolls with the video.
- **Ruler.** The time slider carries a numbered mark where each chapter starts (`pl-ruler-marks`) and a playhead.
- **Controls under the picture** outside fullscreen, so they read the same on any footage. Controls the media or browser can't use, such as captions without a track, are left out.
- **Fullscreen** is the picture edge to edge. The head, ruler and keys lie over it on a shade and fade while the video plays and nobody moves; a pointer, a key or a tap brings them back. An Index key opens the chapters as a side panel, or on an upright phone as a strip above the keys.
- **Menus from Video.js.** Speed, Quality, Captions and Audio open Video.js menus of rates, renditions and tracks; Audio only shows when there are two tracks or more. AirPlay and Cast keys appear where a device can be reached. Under 600px the keys are four icons: play, mute, fullscreen and More, a Video.js menu with a page each for speed, quality, captions and audio. Below 480px they take a row of their own under the timecode. Between 600 and 1680px More stays for what the row has no room for (Quality below 1120px, Audio below 1680px), and shows only when there is something to choose.
- **Labels that match their names.** Visible words come from Video.js translations, and the word on a key is part of its accessible name; the speed key's name starts with it. The skin's own words are translated into German, French, Spanish, Romanian, Russian and Arabic; those six and English are the languages it supports.
- **Keyboard.** Space and K play, M mutes, the arrows (and J, L) seek and set the volume, 0 to 9 jump to a tenth of the video, Home and End to the start and the end, < and > change the speed, F is fullscreen, C captions, I picture-in-picture. The media keys show their name and shortcut in a Video.js tooltip. Every control shows a focus ring.
- **Preferences.** Reduced motion, higher contrast, reduced transparency and forced colors, and right-to-left layouts.

## Use it

The skin is HTML, CSS and three small custom elements: two built on Video.js `UIElement` and `PlayerController`, and one that gives the More menu's pages their ids. It isn't published to npm; copy `src/video/` and `src/styles/` into your project, side by side:

- `skin.html`: the markup inside `<video-player>`
- `skin.css`: the styles, scoped to `.media-skin.pl`
- `chapters.ts`: `pl-chapters`, `pl-ruler-marks` and `pl-overflow`
- `i18n.ts`: the skin's strings and translation overrides
- `core.ts`: registers the UI elements, icons and strings; `skin.ts` adds the fonts
- `src/styles/`: the Video.js scaffold base and preferences the skin builds on, which `core.ts` imports

It needs `@videojs/html` 10.3.0 and `@phosphor-icons/core`, plus `@fontsource/newsreader` and `@fontsource/jetbrains-mono` for the fonts `skin.ts` loads. `core.ts` imports the icons as text with Vite's `?raw` suffix; with another bundler, give `.svg` files a raw-text loader.

## Customise it

### Themes

Put `data-plate-theme` on the player or any ancestor. The nearest one wins, so a player can set its own theme inside a themed page:

| Theme | Looks like |
|---|---|
| `night` (default) | the quickflow.dev plate: ink, teal accent, red playhead |
| `blueprint` | white drafting paper with a fine grid, blue ink, red playhead |
| `signal` | the night plate with an amber accent and a blue playhead |
| `auto` | night in a dark system theme, blueprint in a light one |

### Properties

Every colour of the plate, its fonts and its corners come from public custom properties, and they win over any theme, so a brand needs a few lines of CSS:

```css
video-player {
  --plate-accent: #ff6b00;      /* play key, playing chapter, status dot */
  --plate-on-accent: #1a0b00;   /* text on the accent */
  --plate-playhead: #00b3ff;    /* playhead and played bar */
  --plate-surface: #101114;     /* the plate */
  --plate-ink: #050506;         /* behind the plate in fullscreen */
  --plate-raised: #1a1b1f;      /* the More panel, the error dialog */
  --plate-print: #f2f2f2;       /* text; every hairline is mixed down from it */
  --plate-font-serif: "Fraunces", serif;
  --plate-font-mono: "IBM Plex Mono", monospace;
  --plate-radius: 12px;
  --plate-radius-sm: 6px;
  --plate-number: "02";         /* the plate's number in the head */
  --plate-word-playing: "On air"; /* also -ready, -paused, -loading, -ended, -error */
}
```

Muted text, lines and the blueprint grid are mixed from `--plate-print` and `--plate-accent`; check the contrast of muted text against `--plate-surface` when you change either. Two things stay fixed on purpose: captions are light text on a dark band, because they sit on the picture, and the video's letterbox is black.

### Layout switches

On the skin's container (`<media-container class="media-skin pl">`):

- `data-index="start"` puts the chapter index before the picture, `data-index="none"` leaves it out
- `data-ruler="sparse"` keeps only the tall tick every tenth of the ruler
- `data-head="none"` drops the head line

### Embed build

```sh
npm run build:embed
```

writes `dist-embed/plate-embed.js` and `plate-embed.css`, a single module with Video.js, the Mux media element and the skin, plus one small chunk per Video.js locale. The main module is about 270 KB gzipped, most of it hls.js, so load it on demand:

```js
const { mountPlate } = await import('/plate/plate-embed.js');

const player = mountPlate(document.querySelector('#reel'), {
  playbackId: 'PLAYBACK_ID', // or src: any HLS or MP4 URL; with an ID the poster comes from Mux
  chapters: '/chapters.vtt',
  title: 'Showreel',
  autoplay: true,
});
```

A signed Mux playback ID takes its JWTs as `tokens: { playback, thumbnail, storyboard }`, so the poster and the chapter frames load too. The same options are there in the embed: `theme`, `number`, `index`, `ruler`, `head: false`, `words: { playing: 'On air' }` (any status word, and `detail` for the ruler's preview) and `style: { '--plate-accent': '#ff6b00' }`.

Values that aren't one of the listed options are ignored, with a warning in the console. To remove the player, empty the host with `host.replaceChildren()`. To move it, mount a new one with `mountPlate`: a `<video-player>` taken out of the page and put back doesn't start again.

Leave out `src` and `playbackId` to mount the player first and set the source later with `player.querySelector('mux-video').setAttribute('src', url)`. quickflow.dev does this so streaming starts after its opening animation.

## Develop

```sh
npm install
npm run dev
```

The workbench plays NASA's Cosmic Dawn trailer from Mux, with chapters. Its options panel sets the width, aspect ratio, color scheme, text direction, theme and language; the settings live in the URL, such as `/?width=384&ratio=9:16&dir=rtl&locale=ar&theme=blueprint`. It's live at [plate.quickflow.dev](https://plate.quickflow.dev/), with test sources (and a field for your own video), every public property (colours, fonts, words) and the layout switches, a Download CSS button for your theme, a live accessibility readout (contrast and control names for the current settings), and a "Use it on your site" guide whose code loads the embed and Plate's fonts from `/embed/` there. `npm run build:site` builds the workbench with the embed beside it.

`npm run typecheck` checks the types, `npm test` checks what a shared workbench link can put into the player and the code it hands out, and `npm run deploy` deploys the workbench to Vercel, Netlify or Cloudflare Pages.

## License

Apache License 2.0, see [LICENSE](LICENSE). Newsreader and JetBrains Mono are under the SIL Open Font License 1.1, Phosphor Icons under MIT; see [NOTICE](NOTICE).

Made by Alexandru Trofaniuc at [Quick Flow](https://quickflow.dev).
