import '@videojs/html/i18n';
import '@/skin.css';
import './preview.css';
import { applySkinParams, playerStyles, type WorkbenchParams } from '../shell/params';
import { applyMediaParams, initialParams, onParamsChange } from './frame';
import { startReporting } from './a11y';
import { createPlayer } from './player';

// The i18n provider follows the page's `lang` and loads Video.js's built-in translations for it.
const i18n = document.createElement('media-i18n');
const wrapper = document.createElement('div');

wrapper.className = 'preview-player';
wrapper.append(i18n);
document.getElementById('root')!.append(wrapper);

let mounted = '';

function render(params: WorkbenchParams): void {
  // A new source is a new player, the way a page would mount one.
  const key = params.source === 'custom' ? `custom|${params.customSrc}|${params.customChapters}` : params.source;
  if (key !== mounted) {
    mounted = key;
    i18n.replaceChildren(createPlayer(params.source, { src: params.customSrc, chapters: params.customChapters }));
  }

  wrapper.removeAttribute('style');

  for (const [name, value] of Object.entries(playerStyles(params))) wrapper.style.setProperty(name, value);

  const container = wrapper.querySelector<HTMLElement>('.media-skin.pl');
  if (container) applySkinParams(container, params);

  applyMediaParams(params);
}

render(initialParams());
onParamsChange(render);
startReporting();
