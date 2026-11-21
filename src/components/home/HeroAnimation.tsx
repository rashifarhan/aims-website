"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Design Doc 8.1: the approved sequence, paused off-screen and static for reduced motion. */
export function HeroAnimation({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
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
      // Identical cubic curves and staggering to the prototype; separate responsive SVGs.
      root.querySelectorAll<SVGPathElement>("[data-signal]").forEach((path) => {
        const index = Number(path.dataset.signal);
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        animate(path, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
          duration: 1600,
          delay: 300 + index * 45,
          easing: "cubic-bezier(.2,.8,.2,1)",
        });
      });
      root.querySelectorAll<SVGPathElement>("[data-pulse]").forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `46 ${length + 46}`;
        animate(
          path,
          [
            { strokeDashoffset: 46, opacity: 0 },
            { opacity: 1, offset: 0.15 },
            { opacity: 1, offset: 0.85 },
            { strokeDashoffset: -length, opacity: 0 },
          ],
          {
            duration: 2600,
            delay: 1500 + Number(path.dataset.pulse) * 420,
            iterations: Infinity,
            easing: "cubic-bezier(.4,0,.2,1)",
          },
        );
      });
      const cycle = 5800;
      root.querySelectorAll<HTMLElement>("[data-screen]").forEach((screen) => {
        const state = screen.dataset.screen;
        const values =
          state === "idle" ? [1, 0, 0, 0, 0, 1, 1] : state === "scan" ? [0, 1, 1, 0, 0, 0, 0] : [0, 0, 0, 1, 1, 0, 0];
        const offsets = [0, 0.02, 0.24, 0.28, 4300 / cycle, 4750 / cycle, 1];
        animate(
          screen,
          values.map((opacity, i) => ({ opacity, offset: offsets[i] })),
          { duration: cycle, delay: 1900, iterations: Infinity },
        );
      });
      const beam = root.querySelector("[data-beam]");
      if (beam)
        animate(beam, [{ transform: "translateY(0)" }, { transform: "translateY(500%)" }], {
          duration: 1200,
          direction: "alternate",
          iterations: Infinity,
          easing: "ease-in-out",
        });
      const chip = root.querySelector("[data-granted]");
      if (chip)
        animate(
          chip,
          [
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: 0.24 },
            { opacity: 1, offset: 0.28 },
            { opacity: 1, offset: 0.73 },
            { opacity: 0, offset: 0.78 },
            { opacity: 0 },
          ],
          { duration: cycle, delay: 1900, iterations: Infinity },
        );
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
    document.addEventListener("visibilitychange", sync);
    return () => {
      stop();
      observer.disconnect();
      preference.removeEventListener("change", setup);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <div ref={ref} data-hero-animation data-state="verified" className="home-hero-art">
      {children}
    </div>
  );
}
