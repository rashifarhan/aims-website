"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animateHeroScreen } from "./animateHeroScreen";
import { animateHeroSignals } from "./animateHeroSignals";

/** Design Doc 8.1: the approved sequence, paused off-screen and static for reduced motion. */
export function HeroAnimation({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
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
      if (preference.matches) return;
      root.dataset.state = "animated";
      const animate = (el: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
        const animation = el.animate(frames, { fill: "both", ...options });
        animations.push(animation);
      };
      animateHeroSignals(root, animate, viewport.matches);
      animateHeroScreen(root, animate);
      animations.forEach((a) => {
        if (!visible || document.hidden) a.pause();
      });
    };
    const sync = () =>
      animations.forEach((a) => {
        if (a.playState === "finished") return;
        if (visible && !document.hidden) a.play();
        else a.pause();
      });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(root);
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
    </div>
  );
}
