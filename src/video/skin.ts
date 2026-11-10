import '../styles/video/scaffold.css';
import '@fontsource/newsreader/300.css';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/300-italic.css';
import '@fontsource/newsreader/400-italic.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
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
import './chapters';

// The only icons in the skin: the play key's glyph. Everything else is a word.
registerIcons('pl', {
  play: playIcon,
  pause: pauseIcon,
  restart: restartIcon,
});
