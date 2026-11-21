"use client";

import { useEffect } from "react";

const COUNT_MS = 1400;

/** Counts a number up from zero once, keeping the server-rendered final value as the target. */
function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / COUNT_MS);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * One controller for the homepage's scroll effects (premium direction; README → Decisions).
 * - `[data-reveal]` fades and rises once when it enters the viewport.
 * - `[data-scene]` gets `data-inview` (loops pause off-screen) and `data-played` once, which
 *   starts its one-shot sequence and any `[data-count]` numbers inside it.
 * Without JS, or with reduced motion, nothing is hidden: CSS only hides content after this
 * component sets `data-effects="on"` on the root.
 */
export function ScrollEffects() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.dataset.effects = "on";
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const scenes = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const scene = entry.target as HTMLElement;
          scene.dataset.inview = String(entry.isIntersecting);
          if (entry.isIntersecting && !scene.dataset.played) {
            scene.dataset.played = "true";
            scene.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          }
        }
      },
      { threshold: 0.2 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
    document.querySelectorAll("[data-scene]").forEach((el) => scenes.observe(el));
    return () => {
      reveal.disconnect();
      scenes.disconnect();
      delete root.dataset.effects;
    };
  }, []);
  return null;
}
