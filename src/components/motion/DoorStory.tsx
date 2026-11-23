"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { doorTimeline } from "./doorTimeline";
import { storyProgress, storyStep } from "./storyProgress";
import "./doorStory.css";

type Props = { children: ReactNode; className: string; labelledBy: string };

/** Explanation, not decoration: native scroll assembles the approved kit; small screens play once. */
export function DoorStory({ children, className, labelledBy }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current;
    const layout = root?.querySelector<HTMLElement>(".door-story-layout");
    const stage = root?.querySelector<HTMLElement>(".home-door-stage");
    if (!root || !layout || !stage || !Element.prototype.animate) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 1024px) and (min-height: 700px)");
    const steps = [...root.querySelectorAll<HTMLElement>("[data-door-step]")];
    let animations: Animation[] = [];
    let frame = 0;
    let stageVisible = false;
    let played = false;
    let active = 0;
    let previous = -1;
    const mark = (progress: number) => {
      const next = storyStep(progress, steps.length);
      if (next === active) return;
      active = next;
      root.dataset.step = String(next);
      steps.forEach((item, i) => {
        if (i + 1 === next) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
    };
    const update = () => {
      frame = 0;
      if (root.dataset.mode !== "scroll" || !root.getClientRects().length) return;
      const box = root.getBoundingClientRect();
      const progress = storyProgress(box.top, box.height, innerHeight);
      if (progress === previous) return;
      previous = progress;
      animations.forEach((animation) => {
        animation.currentTime = progress * 1000;
      });
      mark(progress);
    };
    const schedule = () => {
      if (root.dataset.mode === "scroll" && !frame && !document.hidden) frame = requestAnimationFrame(update);
    };
    const playOnce = () => {
      if (root.dataset.mode !== "once" || played || !stageVisible || document.hidden) return;
      played = true;
      animations.forEach((animation) => {
        animation.playbackRate = 0.25;
        animation.play();
      });
      void Promise.all(animations.map((animation) => animation.finished))
        .then(() => mark(1))
        .catch(() => {});
    };
    const syncPlayback = () => {
      if (root.dataset.mode !== "once") return;
      if (!played) {
        playOnce();
        return;
      }
      animations.forEach((animation) => {
        if (animation.playState === "finished") return;
        if (!stageVisible || document.hidden) animation.pause();
        else animation.play();
      });
    };
    const setup = () => {
      const fits = layout.offsetHeight < innerHeight - 120;
      const mode = reduce.matches ? "still" : desktop.matches && fits ? "scroll" : "once";
      // Browser chrome changes a phone's height while scrolling. Keep its clock and completion.
      if (mode === root.dataset.mode && animations.length) {
        if (mode === "scroll") update();
        else syncPlayback();
        return;
      }
      cancelAnimationFrame(frame);
      frame = 0;
      animations.forEach((animation) => animation.cancel());
      animations = [];
      root.dataset.mode = "still";
      steps.forEach((step) => step.removeAttribute("aria-current"));
      active = 0;
      previous = -1;
      if (reduce.matches) return;
      root.dataset.mode = mode;
      animations = doorTimeline(root);
      played = false;
      if (root.dataset.mode === "scroll") update();
      else {
        mark(0);
        playOnce();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        stageVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        syncPlayback();
      },
      { threshold: 0.35 },
    );
    observer.observe(stage);
    const visibility = () => {
      syncPlayback();
      schedule();
    };
    setup();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", setup);
    reduce.addEventListener("change", setup);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      removeEventListener("scroll", schedule);
      removeEventListener("resize", setup);
      reduce.removeEventListener("change", setup);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <section
      ref={ref}
      className={`${className} door-story`}
      data-moment="unlock"
      data-mode="still"
      aria-labelledby={labelledBy}
    >
      <div className="door-story-layout">{children}</div>
    </section>
  );
}
