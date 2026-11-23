"use client";

import { useEffect } from "react";

// A product page can mount more than one trigger. One cleanup must not disable its siblings.
let owners = 0;

/**
 * Starts every page's dealt moments (taste skill motion.md: "scrolling moves nothing but the dealt
 * moment"): each `[data-moment]` section gets `data-played` once, when a third of it is on screen, and
 * its CSS sequence runs to the end. Nothing else reacts to scrolling. Without JS, or with reduced
 * motion, the root never gets `data-effects="on"`, so every moment shows its finished frame.
 */
export function MomentTrigger() {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    owners += 1;
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
    const setup = () => {
      observer.disconnect();
      if (preference.matches) {
        delete root.dataset.effects;
        return;
      }
      root.dataset.effects = "on";
      document
        .querySelectorAll('[data-moment]:not([data-moment="unlock"]):not([data-played])')
        .forEach((el) => observer.observe(el));
    };
    setup();
    preference.addEventListener("change", setup);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", setup);
      owners -= 1;
      if (owners === 0) delete root.dataset.effects;
    };
  }, []);
  return null;
}
