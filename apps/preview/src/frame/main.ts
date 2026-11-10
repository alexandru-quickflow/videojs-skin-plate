import '@videojs/html/i18n';
import '@/skin.css';
import './preview.css';
import { applySkinParams, playerStyles, type Source, type WorkbenchParams } from '../shell/params';
import { applyMediaParams, initialParams, onParamsChange } from './frame';
import { createPlayer } from './player';

// The i18n provider follows the page's `lang` and loads Video.js's built-in translations for it.
const i18n = document.createElement('media-i18n');
const wrapper = document.createElement('div');

wrapper.className = 'preview-player';
wrapper.append(i18n);
document.getElementById('root')!.append(wrapper);

let source: Source | null = null;

function render(params: WorkbenchParams): void {
  // A new source is a new player, the way a page would mount one.
  if (params.source !== source) {
    source = params.source;
    i18n.replaceChildren(createPlayer(source));
  }

  wrapper.removeAttribute('style');

  for (const [name, value] of Object.entries(playerStyles(params))) wrapper.style.setProperty(name, value);

  const container = wrapper.querySelector<HTMLElement>('.media-skin.pl');
  if (container) applySkinParams(container, params);

  applyMediaParams(params);
}

render(initialParams());
onParamsChange(render);
