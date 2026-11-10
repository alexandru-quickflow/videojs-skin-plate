// The skin without its fonts: the parts every host needs. `skin.ts` adds the fonts for the preview; a site that
// already serves Newsreader and JetBrains Mono (quickflow.dev) imports this instead.
import '../styles/video/scaffold.css';
import './skin.css';
import '@videojs/html/i18n';
import './i18n';
import '@videojs/html/ui/container';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/title';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/seek-button';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/time-slider-chapters';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/time-slider-chapter-title';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/time';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/playback-rate-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/popover';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/playback-rate-radio-group';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/status-announcer';
import '@videojs/html/ui/volume-indicator';
import '@videojs/html/ui/volume-indicator-fill';
import '@videojs/html/ui/volume-indicator-value';
import '@videojs/html/ui/status-indicator';
import '@videojs/html/ui/status-indicator-value';
import '@videojs/html/ui/seek-indicator';
import '@videojs/html/ui/seek-indicator-value';
import { registerIcons } from '@videojs/html/icons';
import playIcon from '@phosphor-icons/core/assets/fill/play-fill.svg?raw';
import pauseIcon from '@phosphor-icons/core/assets/fill/pause-fill.svg?raw';
import restartIcon from '@phosphor-icons/core/assets/bold/arrow-counter-clockwise-bold.svg?raw';
import volumeIcon from '@phosphor-icons/core/assets/fill/speaker-high-fill.svg?raw';
import mutedIcon from '@phosphor-icons/core/assets/fill/speaker-slash-fill.svg?raw';
import expandIcon from '@phosphor-icons/core/assets/bold/corners-out-bold.svg?raw';
import collapseIcon from '@phosphor-icons/core/assets/bold/corners-in-bold.svg?raw';
import moreIcon from '@phosphor-icons/core/assets/bold/dots-three-bold.svg?raw';
import './chapters';

// The play key's glyph, and on small players the icons that stand in for the words of
// mute, fullscreen and the More key. Everything else is a word.
registerIcons('pl', {
  play: playIcon,
  pause: pauseIcon,
  restart: restartIcon,
  volume: volumeIcon,
  muted: mutedIcon,
  expand: expandIcon,
  collapse: collapseIcon,
  more: moreIcon,
});
