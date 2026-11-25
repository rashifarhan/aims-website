"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { HEADING_SELECTOR } from "./headingSelector";

/**
 * The one client leaf behind every section title's reveal (client approval of GSAP, 25 Nov 2026; CLAUDE.md §3 GSAP
 * rule), mounted once in the root layout so a page never holds one component per heading. After hydration, and again
 * after each client navigation, it looks for marked titles (SectionHeader, ClosePanel) and only then lazy-loads the
 * GSAP chunk (headingReveal.ts), so a page without one, or a visitor who prefers reduced motion, never downloads it.
 * The server render is the final, readable heading; until the chunk arrives, and if it never does, it stands.
 */
export function HeadingReveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!document.querySelector(HEADING_SELECTOR)) return;
    let cleanup: (() => void) | undefined;
    let live = true;
    import("./headingReveal")
      .then(({ revealHeadings }) => {
        if (live) cleanup = revealHeadings();
      })
      // A failed chunk leaves every heading at its server-rendered final state, which is the intended fallback.
      .catch(() => undefined);
    return () => {
      live = false;
      cleanup?.();
    };
  }, [pathname]);
  return null;
}
