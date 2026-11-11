import {
  PlayerController,
  playerContext,
  selectError,
  selectSource,
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

/** The space above a chapter's frame, its margin-top in skin.css. */
const FRAME_SPACE = 18;

function activeIndex(cues: readonly Cue[], time: number): number {
  for (let i = cues.length - 1; i >= 0; i--) {
    if (time >= cues[i]!.startTime - 0.05) return i;
  }
  return -1;
}

/**
 * The chapter index beside the video: one numbered button per chapter cue, the current one marked, and a click
 * jumps there. Video.js has no chapter navigation control yet, so this reads the chapter cues from the player store.
 * Hidden when the media has fewer than two chapters. In fullscreen the index is a panel: the Index key in the row
 * opens it, and its close key, a chapter, Escape or leaving fullscreen close it.
 */
class ChaptersElement extends UIElement {
  #tracks = new PlayerController(this, playerContext, selectTextTrack);
  #time = new PlayerController(this, playerContext, selectTime);
  #signature = '';
  #current = -2;
  #list: HTMLOListElement | null = null;
  #resize: ResizeObserver | null = null;
  #disconnect: AbortController | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = new AbortController();
    const { signal } = this.#disconnect;

    // The hotkey coordinator already leaves Space and Enter on a focused button alone.
    this.addEventListener('click', this.#onClick, { signal });
    this.#wirePanel(signal);
  }

  /** The index, its Index key in the row and its close key, for the fullscreen panel. */
  #panel() {
    const index = this.closest<HTMLElement>('.pl-index');
    const container = this.closest<HTMLElement>('.pl');
    return {
      index,
      container,
      toggle: container?.querySelector<HTMLButtonElement>('.pl-btn-index') ?? null,
      close: index?.querySelector<HTMLButtonElement>('.pl-index-close') ?? null,
    };
  }

  #wirePanel(signal: AbortSignal): void {
    const { index, container, toggle, close } = this.#panel();
    if (!index || !container) return;
    index.id ||= `pl-index-${Math.random().toString(36).slice(2, 8)}`;
    toggle?.setAttribute('aria-controls', index.id);
    toggle?.addEventListener('click', () => this.#setOpen(index.dataset.open === undefined), { signal });
    close?.addEventListener('click', () => this.#setOpen(false), { signal });
    // Escape reaches the page only where the browser doesn't spend it on leaving fullscreen.
    index.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Escape' || index.dataset.open === undefined) return;
        event.stopPropagation();
        this.#setOpen(false);
      },
      { signal }
    );
    // Leaving fullscreen folds the panel away, so it isn't open next time.
    const onFullscreen = () =>
      requestAnimationFrame(() => {
        if (!container.matches(':fullscreen, [data-fullscreen]')) this.#setOpen(false, false);
      });
    document.addEventListener('fullscreenchange', onFullscreen, { signal });
    document.addEventListener('webkitfullscreenchange', onFullscreen, { signal });
    const watch = new MutationObserver(onFullscreen);
    watch.observe(container, { attributes: true, attributeFilter: ['data-fullscreen'] });
    signal.addEventListener('abort', () => watch.disconnect());
  }

  /** Open or close the fullscreen panel. Focus goes in with it, and back to the Index key when it closes. */
  #setOpen(open: boolean, moveFocus = true): void {
    const { index, toggle } = this.#panel();
    if (!index) return;
    if (open === (index.dataset.open !== undefined)) return;
    const hadFocus = index.contains(document.activeElement);
    index.toggleAttribute('data-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    if (!moveFocus) return;
    if (open) {
      requestAnimationFrame(() => {
        const target =
          index.querySelector<HTMLButtonElement>('.pl-chapter[data-active]') ??
          index.querySelector<HTMLButtonElement>('.pl-chapter');
        if (!target) return;
        target.focus({ preventScroll: true });
        // Scroll the panel only: scrollIntoView would also scroll the player sideways to reach a panel
        // still sliding in, and the picture would jump.
        const t = target.getBoundingClientRect();
        const i = index.getBoundingClientRect();
        if (t.top < i.top) index.scrollTop += t.top - i.top;
        else if (t.bottom > i.bottom) index.scrollTop += t.bottom - i.bottom;
      });
    } else if (hadFocus) {
      toggle?.focus();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
    this.#resize?.disconnect();
    this.#resize = null;
    // Rebuild the list (and its listeners) when the element comes back.
    this.#signature = '';
  }

  override update(changed: PropertyValues): void {
    super.update(changed);
    const cues = (this.#tracks.value?.chaptersCues ?? []) as readonly Cue[];
    this.hidden = cues.length < 2;
    if (this.hidden) return;

    const signature = cues.map((c) => `${c.startTime}|${c.text}`).join('\n');
    if (signature !== this.#signature) {
      this.#signature = signature;
      this.#current = -2;
      this.#render(cues);
    }

    // Time updates arrive many times a second; touch the DOM only when the chapter changes.
    const current = activeIndex(cues, this.#time.value?.currentTime ?? 0);
    if (current === this.#current) return;
    this.#current = current;

    const buttons = this.#list?.querySelectorAll<HTMLButtonElement>('.pl-chapter') ?? [];
    buttons.forEach((button, i) => {
      const active = i === current;
      button.toggleAttribute('data-active', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });

    // In the horizontal strip on small players, keep the playing chapter in view.
    // Measured on screen, so it holds in right-to-left too, and it never scrolls the page.
    const active = buttons[current];
    const list = this.#list;
    if (active && list && list.scrollWidth > list.clientWidth) {
      const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      const a = active.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      if (a.left < l.left) list.scrollBy({ left: a.left - l.left - 16, behavior });
      else if (a.right > l.right) list.scrollBy({ left: a.right - l.right + 16, behavior });
    }
  }

  /**
   * In the index column, frames for every chapter may not fit beside the picture. Then only the playing
   * chapter keeps its frame (data-tight on the index), so no chapter is cut off out of sight.
   */
  #fit = (): void => {
    const index = this.closest<HTMLElement>('.pl-index');
    const list = this.#list;
    if (!index || !list) return;
    if (getComputedStyle(list).display === 'flex') {
      delete index.dataset.tight;
      return;
    }
    // Frames open and fold with a transition, so measure the index as it will be once they settle:
    // its content without any frame, plus every frame at full size. A frame still waiting for the
    // storyboard counts too, so the index doesn't open them all and fold them again when it arrives.
    const thumbs = [...list.querySelectorAll<HTMLElement>('.pl-chapter-thumb')].filter(
      (t) => getComputedStyle(t).display !== 'none'
    );
    const now = thumbs.reduce((sum, t) => sum + t.offsetHeight + parseFloat(getComputedStyle(t).marginTop), 0);
    // Video.js writes each frame's size on the element; 52px is the box the skin holds until then.
    const sized = thumbs.find((t) => parseFloat(t.style.height) > 0);
    const block = (sized ? parseFloat(sized.style.height) : 52) + FRAME_SPACE;
    const indexBox = index.getBoundingClientRect();
    const content =
      list.getBoundingClientRect().bottom - indexBox.top + index.scrollTop + parseFloat(getComputedStyle(index).paddingBottom);
    const full = content - now + thumbs.length * block;
    if (full > index.clientHeight + 1) index.dataset.tight = '';
    else delete index.dataset.tight;
    // Frames animate only once the index has its first layout; measuring above would otherwise
    // make the frames of a new list fold away on screen.
    if (index.dataset.settled === undefined) requestAnimationFrame(() => (index.dataset.settled = ''));
  };

  /** Marks the strip while chips wait past its end, for the fade. */
  #markMore = (): void => {
    const list = this.#list;
    if (!list) return;
    const end = list.scrollWidth - list.clientWidth;
    list.toggleAttribute('data-more', end > 1 && Math.abs(list.scrollLeft) < end - 1);
  };

  #render(cues: readonly Cue[]): void {
    const list = document.createElement('ol');
    list.className = 'pl-chapter-list';
    // Named by the visible "Index" label beside it.
    // The nav carries the name; the list inside it only says how many chapters there are.
    const label = this.parentElement?.querySelector('.pl-index-label');
    if (label) {
      label.id ||= `pl-index-${Math.random().toString(36).slice(2, 8)}`;
      this.closest('nav')?.setAttribute('aria-labelledby', label.id);
    }

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
      // A Latin name on an Arabic page keeps its own direction.
      title.dir = 'auto';
      // A domain breaks after its dots, never inside a word.
      cue.text.split(/(?<=\.)/).forEach((part, n, parts) => {
        title.append(part);
        if (n < parts.length - 1) title.append(document.createElement('wbr'));
      });

      // The chapter's frame from the storyboard, well in so it is past any title card.
      const next = cues[i + 1]?.startTime ?? cue.startTime + 14;
      const thumb = document.createElement('media-thumbnail');
      thumb.className = 'pl-chapter-thumb';
      thumb.setAttribute('time', String(cue.startTime + Math.min(7, (next - cue.startTime) / 2)));
      thumb.setAttribute('loading', 'lazy');
      thumb.setAttribute('aria-hidden', 'true');

      button.append(num, title, thumb);
      item.append(button);
      list.append(item);
    });

    // A new set of cues replaces the list; keep the keyboard on the same chapter.
    const focused = this.#list?.contains(document.activeElement)
      ? [...this.#list.querySelectorAll('.pl-chapter')].indexOf(document.activeElement as Element)
      : -1;

    this.#list?.remove();
    this.#list = list;
    this.append(list);

    const signal = this.#disconnect?.signal;
    list.addEventListener('scroll', this.#markMore, { passive: true, signal });
    // Size changes (fullscreen, a turned phone, fonts arriving) move the end too.
    this.#resize?.disconnect();
    this.#resize = new ResizeObserver(() => {
      this.#markMore();
      this.#fit();
    });
    this.#resize.observe(list);
    const index = this.closest<HTMLElement>('.pl-index');
    if (index) {
      this.#resize.observe(index);
      // A new list lays out still, like the first one.
      delete index.dataset.settled;
    }
    this.#markMore();
    this.#fit();
    if (focused >= 0) list.querySelectorAll<HTMLButtonElement>('.pl-chapter')[Math.min(focused, cues.length - 1)]?.focus();
  }

  #onClick = (event: MouseEvent): void => {
    const button = (event.target as Element).closest<HTMLButtonElement>('.pl-chapter');
    if (!button || !this.contains(button)) return;
    const start = Number(button.dataset.start);
    if (Number.isFinite(start)) void this.#time.value?.seek(start + 0.01);
    // In fullscreen the panel has done its job once a chapter is chosen.
    this.#setOpen(false);
  };
}

/**
 * Numbered chapter markers on the ruler: 01, 02, 03 above the tick where each chapter starts.
 * Decorative (the slider and the index carry the meaning), so it is aria-hidden.
 *
 * It also marks the player data-failed while the source that failed is still the source. Closing the
 * error dialog clears the store's error, but the video still won't play, so the head keeps saying so.
 */
class RulerMarksElement extends UIElement {
  #tracks = new PlayerController(this, playerContext, selectTextTrack);
  #time = new PlayerController(this, playerContext, selectTime);
  #error = new PlayerController(this, playerContext, selectError);
  #source = new PlayerController(this, playerContext, selectSource);
  #failedSrc: string | null = null;
  #hadError = false;
  #signature = '';
  #current = -2;

  override update(changed: PropertyValues): void {
    super.update(changed);
    this.#markFailed();
    const cues = (this.#tracks.value?.chaptersCues ?? []) as readonly Cue[];
    // Live streams report an infinite duration: no fixed positions to mark.
    const raw = this.#time.value?.duration ?? 0;
    const duration = Number.isFinite(raw) ? raw : 0;
    const signature = `${duration}|${cues.map((c) => c.startTime).join(',')}`;
    if (signature === this.#signature) {
      this.#markActive(cues);
      return;
    }
    this.#signature = signature;
    this.#current = -2;

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

  #markFailed(): void {
    const player = this.closest<HTMLElement>('.pl');
    const src = this.#source.value?.currentSrc ?? '';
    const hasError = Boolean(this.#error.value?.error);
    if (hasError) this.#failedSrc = src;
    else if (this.#failedSrc !== src) this.#failedSrc = null;
    player?.toggleAttribute('data-failed', this.#failedSrc !== null);
    // The dialog was dismissed. Video.js returns focus to what had it before the error; when nothing
    // had, focus would land on the page, so it goes to Play once the dialog lets go of the player
    // (inert until its closing transition ends).
    const play = player?.querySelector<HTMLElement>('.pl-controls > .pl-btn-play');
    if (this.#hadError && !hasError && play) {
      let frames = 60;
      const settle = (): void => {
        const active = document.activeElement;
        if (active !== document.body && !active?.closest('.pl-dialog')) return;
        if (play.closest('[inert]') && --frames > 0) requestAnimationFrame(settle);
        else play.focus();
      };
      requestAnimationFrame(settle);
    }
    this.#hadError = hasError;
  }

  #markActive(cues: readonly Cue[]): void {
    const current = activeIndex(cues, this.#time.value?.currentTime ?? 0);
    if (current === this.#current) return;
    this.#current = current;
    [...this.children].forEach((mark, i) => mark.toggleAttribute('data-active', i === current));
  }
}

/**
 * Wraps the More key and its Video.js menu. Gives each setting item and its page an id of their
 * own (commandfor needs one, and two players on a page must not share it), and closes the menu
 * when the player grows past the small layout, where the More key is hidden.
 */
class OverflowElement extends HTMLElement {
  #resize: ResizeObserver | null = null;

  connectedCallback(): void {
    this.#link();
    // Defined before its children are parsed, the element links them a moment later.
    queueMicrotask(() => this.#link());
    this.#watch();
  }

  #uid = Math.random().toString(36).slice(2, 8);

  #link(): void {
    const uid = this.#uid;
    for (const item of this.querySelectorAll<HTMLElement>('[data-page]')) {
      const page = this.querySelector<HTMLElement>(`[data-page-for="${item.dataset.page}"]`);
      if (!page) continue;
      page.id ||= `pl-more-${item.dataset.page}-${uid}`;
      item.setAttribute('commandfor', page.id);
    }
  }

  #watch(): void {
    this.#resize?.disconnect();

    const menu = this.querySelector('media-menu') as (HTMLElement & { open?: boolean }) | null;
    const key = this.querySelector<HTMLElement>('.pl-btn-more');
    const player = this.closest('.pl');
    if (!menu || !key || !player) return;
    // When the player resizes past the widths where More shows (a turned phone, fullscreen), its key
    // hides: close the menu, and keep the keyboard on the play key.
    this.#resize = new ResizeObserver(() => {
      if (!menu.open || getComputedStyle(key).display !== 'none') return;
      if (this.contains(document.activeElement)) {
        player.querySelector<HTMLElement>('.pl-controls > .pl-btn-play')?.focus();
      }
      menu.open = false;
    });
    this.#resize.observe(player);
  }

  disconnectedCallback(): void {
    this.#resize?.disconnect();
    this.#resize = null;
  }
}

if (!customElements.get('pl-overflow')) customElements.define('pl-overflow', OverflowElement);
if (!customElements.get('pl-chapters')) customElements.define('pl-chapters', ChaptersElement);
if (!customElements.get('pl-ruler-marks')) customElements.define('pl-ruler-marks', RulerMarksElement);
