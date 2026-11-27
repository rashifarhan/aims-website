"use client";

import { useEffect } from "react";
import { setLenis } from "./scrollTo";

/**
 * Smooth wheel scrolling for direction 2 (CLAUDE.md → Design rules, Motion and scroll engine; client allowance,
 * 27 Nov 2026). Lenis glides the wheel and drives ScrollTrigger from GSAP's ticker, so the scrubbed stages move as one.
 * Fine pointers only: touch keeps the browser's native scroll. Off under reduced motion. Both libraries load lazily,
 * after hydration, so they never weigh on the first paint. Mounted per page, never in a layout.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stop = () => {};
    let cancelled = false;
    void Promise.all([import("lenis"), import("@/components/motion/gsap")]).then(
      ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (cancelled) return;
        const lenis = new Lenis({ lerp: 0.1, autoRaf: false, anchors: true });
        const tick = (seconds: number) => lenis.raf(seconds * 1000);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        setLenis(lenis);
        stop = () => {
          gsap.ticker.remove(tick);
          gsap.ticker.lagSmoothing(500, 33);
          lenis.destroy();
          setLenis(null);
        };
      },
    );
    return () => {
      cancelled = true;
      stop();
    };
  }, []);
  return null;
}
