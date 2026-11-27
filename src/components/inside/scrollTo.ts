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
