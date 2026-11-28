"use client";

import { useEffect } from "react";
import { keyDistance, keyIntent } from "@/lib/keyScroll";
import { pageOwnsKey, setLenis } from "./scrollTo";

/**
 * Smooth wheel scrolling for direction 2 (CLAUDE.md → Design rules, Motion and scroll engine; client allowance,
 * 27 Nov 2026). Lenis glides the wheel and drives ScrollTrigger from GSAP's ticker, so the scrubbed stages move as one.
 * Fine pointers only: touch keeps the browser's native scroll, which phones do best on their own (GSAP and Lenis both
 * advise against smoothing touch). Off under reduced motion. The keyboard glides too (owner request, 28 Nov 2026):
 * arrows, Page Up/Down, Space and Home/End go through Lenis like the wheel, unless the key belongs to what has focus
 * (pageOwnsKey). Both libraries load lazily, after hydration, so they never weigh on the first paint. Mounted per
 * page, never in a layout.
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
        // After the home dive's own handler (capture), which steps its families and marks the key as handled.
        const onKey = (event: KeyboardEvent) => {
          const intent = keyIntent(event);
          if (!intent || !pageOwnsKey(event)) return;
          event.preventDefault();
          // The page may have grown since Lenis last measured it (a pin, a late section): End must reach the foot.
          if (intent.kind === "to") lenis.resize();
          const header = document.querySelector("header")?.offsetHeight ?? 0;
          const to =
            intent.kind === "to"
              ? intent.edge === "start"
                ? 0
                : lenis.limit
              : lenis.targetScroll + intent.direction * keyDistance(intent.size, innerHeight, header);
          lenis.scrollTo(Math.min(lenis.limit, Math.max(0, to)), { lerp: 0.12 });
        };
        addEventListener("keydown", onKey);
        stop = () => {
          removeEventListener("keydown", onKey);
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
