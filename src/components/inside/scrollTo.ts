import type Lenis from "lenis";

/*
 * The page's one Lenis instance, when SmoothScroll has started one (fine pointers, motion allowed). Pieces that move
 * the scroll themselves (the dive's arrows and chips, its soft snap) go through scrollToY, so a jump glides with the
 * same engine as the wheel, or falls back to the browser's own smooth scroll on touch.
 */
let current: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  current = lenis;
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function scrollToY(y: number, duration = 1.1) {
  if (current) {
    current.scrollTo(y, { duration, easing: easeInOut });
    return;
  }
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: y, behavior: still ? "auto" : "smooth" });
}

/* A key that belongs to what has focus: typing, a control's own arrows or space, an open dialog or menu, or a box that
   scrolls itself. The page leaves those to the browser. */
const OWN_KEYS =
  "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='listbox'], [role='slider'], " +
  "[role='tablist'], [role='radiogroup'], [role='menu'], [role='grid'], dialog[open], [data-lenis-prevent]";
const SPACE_ACTS =
  "button, summary, label, [role='button'], [role='checkbox'], [role='switch'], [role='tab'], [role='radio']";

function scrollsItself(el: Element | null): boolean {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight + 1) return true;
  }
  return false;
}

/** Whether a page-scroll key may move the page from where focus is. */
export function pageOwnsKey(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || document.querySelector("dialog[open]")) return false;
  const target = event.target instanceof Element ? event.target : null;
  if (!target || target === document.body || target === document.documentElement) return true;
  if (target.closest(OWN_KEYS)) return false;
  if (event.key === " " && target.closest(SPACE_ACTS)) return false;
  return !scrollsItself(target);
}
