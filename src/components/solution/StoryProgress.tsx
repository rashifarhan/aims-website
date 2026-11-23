"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { attendancePlayback } from "./attendancePlayback";

type Props = { steps: number; label: string; children: ReactNode };

/**
 * Scroll story controller (Design Doc 8 rules): the step in the middle of the viewport sets
 * `data-step`, and CSS draws that state with transform, opacity and stroke-dashoffset only.
 * It never pins or blocks scrolling. The server renders the final state, which is also what
 * reduced motion and no-JS visitors see. The finite transport runs only while the story is visible.
 */
export function StoryProgress({ steps, label, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 1024px)");
    const items = [...root.querySelectorAll<HTMLElement>("[data-story-step]")];
    const show = (step: number) => {
      root.dataset.step = String(step);
      for (const item of items) {
        if (item.dataset.storyStep === String(step)) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      }
    };
    let stepObserver: IntersectionObserver | undefined;
    let stopMobile: (() => void) | undefined;
    const setup = () => {
      stepObserver?.disconnect();
      stopMobile?.();
      if (reduce.matches) {
        root.dataset.motion = "off";
        show(steps);
        return;
      }
      root.dataset.motion = "on";
      show(1);
      if (!desktop.matches) {
        // A short explanation while its drawing is visible; phones never pin text under the art.
        const stage = root.querySelector(".story-stage");
        if (stage) stopMobile = attendancePlayback(stage, show);
        return;
      }
      // A thin band across the middle of the viewport decides the active step.
      stepObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) show(Number((entry.target as HTMLElement).dataset.storyStep));
        },
        { rootMargin: "-45% 0px -45% 0px" },
      );
      items.forEach((item) => stepObserver?.observe(item));
    };
    let inView = false;
    const visibility = () => {
      root.dataset.inview = inView && !document.hidden ? "true" : "false";
    };
    const viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      visibility();
    });
    viewObserver.observe(root);
    setup();
    reduce.addEventListener("change", setup);
    desktop.addEventListener("change", setup);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stepObserver?.disconnect();
      stopMobile?.();
      viewObserver.disconnect();
      reduce.removeEventListener("change", setup);
      desktop.removeEventListener("change", setup);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [steps]);
  return (
    <div
      ref={ref}
      className="story"
      data-step={steps}
      data-motion="off"
      data-inview="false"
      aria-label={label}
      role="group"
    >
      {children}
    </div>
  );
}
