"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animateHeroScreen } from "./animateHeroScreen";
import { animateHeroSignals } from "./animateHeroSignals";

type Props = { children: ReactNode; pauseLabel: string };

/**
 * Design Doc 8.1: the approved sequence, paused off-screen and static for reduced motion. It loops
 * past 5 s, so it carries a pause control (WCAG 2.2.2; taste skill motion.md, loop-pause).
 */
export function HeroAnimation({ children, pauseLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(false);
  const [moving, setMoving] = useState(false);
  const resync = useRef<() => void>(() => {});
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const viewport = matchMedia("(max-width: 1023px)");
    let visible = false;
    let animations: Animation[] = [];
    const stop = () => {
      animations.forEach((a) => a.cancel());
      animations = [];
    };
    const setup = () => {
      stop();
      root.dataset.state = "verified";
      setMoving(!preference.matches);
      if (preference.matches) return;
      root.dataset.state = "animated";
      const animate = (el: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
        const animation = el.animate(frames, { fill: "both", ...options });
        animations.push(animation);
      };
      animateHeroSignals(root, animate, viewport.matches);
      animateHeroScreen(root, animate);
      animations.forEach((a) => {
        if (!visible || document.hidden || userPaused.current) a.pause();
      });
    };
    const sync = () =>
      animations.forEach((a) => {
        if (a.playState === "finished") return;
        if (visible && !document.hidden && !userPaused.current) a.play();
        else a.pause();
      });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(root);
    resync.current = sync;
    setup();
    preference.addEventListener("change", setup);
    viewport.addEventListener("change", setup);
    document.addEventListener("visibilitychange", sync);
    return () => {
      stop();
      observer.disconnect();
      preference.removeEventListener("change", setup);
      viewport.removeEventListener("change", setup);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <div ref={ref} data-hero-animation data-state="verified" className="home-hero-art">
      {children}
      {moving && (
        <button
          type="button"
          className="home-motion-toggle"
          aria-pressed={paused}
          onClick={() => {
            userPaused.current = !paused;
            setPaused(!paused);
            resync.current();
          }}
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
