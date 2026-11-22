"use client";

import { useEffect } from "react";

/**
 * Starts the homepage's dealt moments (taste skill motion.md: "scrolling moves nothing but the dealt
 * moment"): each `[data-moment]` section gets `data-played` once, when a third of it is on screen, and
 * its CSS sequence runs to the end. Nothing else reacts to scrolling. Without JS, or with reduced
 * motion, the root never gets `data-effects="on"`, so every moment shows its finished frame.
 */
export function MomentTrigger() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.dataset.effects = "on";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.played = "true";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.35 },
    );
    document.querySelectorAll("[data-moment]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      delete root.dataset.effects;
    };
  }, []);
  return null;
}
