"use client";

import { useEffect, useState } from "react";

/**
 * The punch loop runs past 5 s, so the story carries a pause control (WCAG 2.2.2; CLAUDE.md §3).
 * It sets `data-paused` on the enclosing `.story`; CSS holds the dots. Hidden under reduced motion,
 * where nothing loops.
 */
export function StoryPause({ label }: { label: string }) {
  const [moving, setMoving] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMoving(!reduce.matches);
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, []);
  if (!moving) return null;
  return (
    <button
      type="button"
      className="home-button home-button-outline home-button-icon story-pause"
      aria-pressed={paused}
      onClick={(event) => {
        const next = !paused;
        setPaused(next);
        event.currentTarget.closest(".story")?.setAttribute("data-paused", String(next));
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
        {paused ? <path d="M8 5v14l11-7Z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
      </svg>
      <span className="sr-only">{label}</span>
    </button>
  );
}
