"use client";

import dynamic from "next/dynamic";
import { useState, type ComponentType, type ReactNode } from "react";

type TimelineProps = { paused: boolean; onMotion: (moving: boolean) => void };

/**
 * The hero's GSAP timeline, loaded only after hydration, as the journey's is (CLAUDE.md §3 GSAP rule, §5): the chunk
 * never blocks the first paint or the hero photo's LCP. If it cannot load, the frame must not wait hidden in its
 * pending state, so the verified frame is shown at once.
 */
const HeroTimeline = dynamic(
  () =>
    import("./HeroTimeline")
      .then((m) => m.HeroTimeline)
      .catch((): ComponentType<TimelineProps> => {
        document.querySelector("[data-hero-animation]")?.setAttribute("data-state", "verified");
        return () => null;
      }),
  { ssr: false },
);

type Props = { children: ReactNode; pauseLabel: string };

/**
 * Design Doc 8.1: the approved verification, now one GSAP timeline (HeroTimeline). It loops past 5 s, so it carries a
 * pause control (WCAG 2.2.2; taste skill motion.md, loop-pause), shown once the motion runs. `data-state` starts
 * "pending" (home.css: the screen at idle, the frame waiting) and the timeline sets "animated", or "verified" to rest.
 */
export function HeroAnimation({ children, pauseLabel }: Props) {
  const [paused, setPaused] = useState(false);
  const [moving, setMoving] = useState(false);
  return (
    <div data-hero-animation data-state="pending" className="home-hero-art">
      {children}
      <HeroTimeline paused={paused} onMotion={setMoving} />
      {moving && (
        <button
          type="button"
          className="home-button home-button-outline home-button-icon home-motion-toggle"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
            {paused ? <path d="M8 5v14l11-7Z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
          </svg>
          <span className="sr-only">{pauseLabel}</span>
        </button>
      )}
    </div>
  );
}
