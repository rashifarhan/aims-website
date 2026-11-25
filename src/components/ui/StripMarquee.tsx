"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The moving part of the model-code strip (ui/ModelStrip.tsx): the client asked for it to run on its own, not with
 * the scroll (25 Nov 2026). It loops past 5 s, so it pauses off-screen and carries a pause button (WCAG 2.2.2,
 * CLAUDE.md §3), shown only on keyboard focus like the hero's, as the client wants no visible control; hovering or
 * focusing a code also holds it still. Reduced motion never starts it (model-strip.css).
 */
export function StripMarquee({ children, pauseLabel }: { children: ReactNode; pauseLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      el.dataset.offscreen = String(!entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="model-strip-marquee" data-paused={paused || undefined}>
      {children}
      <button
        type="button"
        className="home-button home-button-outline home-button-icon model-strip-toggle"
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          {paused ? <path d="M8 5v14l11-7Z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
        </svg>
        <span className="sr-only">{pauseLabel}</span>
      </button>
    </div>
  );
}
