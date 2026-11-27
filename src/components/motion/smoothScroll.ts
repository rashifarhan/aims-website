import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/*
 * Smooth wheel scrolling (CLAUDE.md → Design rules → Motion and scroll engine): one Lenis instance driven from GSAP's
 * ticker, so Lenis and ScrollTrigger read the same frame and never fight. Mouse and trackpad only: touch screens keep
 * their native scroll. Shared by every pinned sequence on a page and stopped when the last one unmounts. Only lazy
 * chunks import this module, so Lenis never reaches the first paint.
 */
let lenis: Lenis | null = null;
let users = 0;
const raf = (time: number) => lenis?.raf(time * 1000);

export function startSmoothScroll(): Lenis | null {
  if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  users += 1;
  if (!lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  }
  return lenis;
}

export function stopSmoothScroll() {
  users = Math.max(0, users - 1);
  if (users > 0 || !lenis) return;
  gsap.ticker.remove(raf);
  gsap.ticker.lagSmoothing(500, 33);
  lenis.destroy();
  lenis = null;
}
