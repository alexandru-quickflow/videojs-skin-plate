import {
  PlayerController,
  playerContext,
  selectTextTrack,
  selectTime,
  UIElement,
  type PropertyValues,
} from '@videojs/html';

interface Cue {
  startTime: number;
  endTime: number;
  text: string;
}

const pad = (n: number): string => String(n).padStart(2, '0');

function activeIndex(cues: readonly Cue[], time: number): number {
  for (let i = cues.length - 1; i >= 0; i--) {
    if (time >= cues[i]!.startTime - 0.05) return i;
  }
  return -1;
}

/**
 * The chapter index beside the video: one numbered button per chapter cue, the current one marked, and a click
 * jumps there. Video.js has no chapter navigation control yet, so this reads the chapter cues from the player store.
 * Hidden when the media has fewer than two chapters.
 */
class ChaptersElement extends UIElement {
  #tracks = new PlayerController(this, playerContext, selectTextTrack);
  #time = new PlayerController(this, playerContext, selectTime);
  #signature = '';
  #list: HTMLOListElement | null = null;
  #disconnect: AbortController | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = new AbortController();
    const { signal } = this.#disconnect;

    this.addEventListener('click', this.#onClick, { signal });
    // Space and Enter belong to the focused chapter button, not to the player's play/pause hotkey.
    for (const type of ['keydown', 'keyup'] as const) {
      this.addEventListener(
        type,
        (event) => {
          if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
        },
        { signal }
      );
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }

  override update(changed: PropertyValues): void {
    super.update(changed);
    const cues = (this.#tracks.value?.chaptersCues ?? []) as readonly Cue[];
    this.hidden = cues.length < 2;
    if (this.hidden) return;

    const signature = cues.map((c) => `${c.startTime}|${c.text}`).join('\n');
    if (signature !== this.#signature) {
      this.#signature = signature;
      this.#render(cues);
    }

    const current = activeIndex(cues, this.#time.value?.currentTime ?? 0);
    this.#list?.querySelectorAll<HTMLButtonElement>('.pl-chapter').forEach((button, i) => {
      const active = i === current;
      button.toggleAttribute('data-active', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  #render(cues: readonly Cue[]): void {
    const list = document.createElement('ol');
    list.className = 'pl-chapter-list';

    cues.forEach((cue, i) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pl-chapter';
      button.dataset.start = String(cue.startTime);

      const num = document.createElement('span');
      num.className = 'pl-chapter-num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = pad(i + 1);

      const title = document.createElement('span');
      title.className = 'pl-chapter-title';
      title.textContent = cue.text;

      button.append(num, title);
      item.append(button);
      list.append(item);
    });

    this.#list?.remove();
    this.#list = list;
    this.append(list);
  }

  #onClick = (event: MouseEvent): void => {
    const button = (event.target as Element).closest<HTMLButtonElement>('.pl-chapter');
    if (!button || !this.contains(button)) return;
    const start = Number(button.dataset.start);
    if (Number.isFinite(start)) void this.#time.value?.seek(start + 0.01);
  };
}

/**
 * Numbered chapter markers on the ruler: 01, 02, 03 above the tick where each chapter starts.
 * Decorative (the slider and the index carry the meaning), so it is aria-hidden.
 */
class RulerMarksElement extends UIElement {
  #tracks = new PlayerController(this, playerContext, selectTextTrack);
  #time = new PlayerController(this, playerContext, selectTime);
  #signature = '';

  override update(changed: PropertyValues): void {
    super.update(changed);
    const cues = (this.#tracks.value?.chaptersCues ?? []) as readonly Cue[];
    const duration = this.#time.value?.duration ?? 0;
    const signature = `${duration}|${cues.map((c) => c.startTime).join(',')}`;
    if (signature === this.#signature) {
      this.#markActive(cues);
      return;
    }
    this.#signature = signature;

    this.replaceChildren();
    if (cues.length < 2 || !(duration > 0)) return;

    cues.forEach((cue, i) => {
      const mark = document.createElement('span');
      mark.className = 'pl-ruler-mark';
      mark.style.setProperty('--pl-at', `${Math.min(100, (cue.startTime / duration) * 100)}%`);
      mark.textContent = pad(i + 1);
      this.append(mark);
    });
    this.#markActive(cues);
  }

  #markActive(cues: readonly Cue[]): void {
    const current = activeIndex(cues, this.#time.value?.currentTime ?? 0);
    [...this.children].forEach((mark, i) => mark.toggleAttribute('data-active', i === current));
  }
}

if (!customElements.get('pl-chapters')) customElements.define('pl-chapters', ChaptersElement);
if (!customElements.get('pl-ruler-marks')) customElements.define('pl-ruler-marks', RulerMarksElement);
