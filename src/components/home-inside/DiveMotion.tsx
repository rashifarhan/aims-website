"use client";

import { useEffect } from "react";
import { familyProgress, snapProgress } from "@/lib/dive";
import { scrollToY } from "@/components/inside/scrollTo";

/**
 * The home dive's motion (CLAUDE.md → Design rules, Motion and scroll engine). The stage pins with CSS sticky; GSAP
 * ScrollTrigger scrubs one progress value through it (smoothed further by Lenis on a fine pointer) and, when the scroll
 * rests, settles it softly on the hero or the nearest family. The arrows, chips and keyboard focus move the scroll to a
 * family, so the scroll and the screen never disagree. Under reduced motion, or on the motion rest switch, nothing is
 * written and the stacked layout in home-dive.css stands. GSAP and the DOM writer load lazily.
 */
export function DiveMotion({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    let revert = () => {};
    let cancelled = false;
    void Promise.all([import("@/components/motion/gsap"), import("./diveStage")]).then(
      ([{ gsap, ScrollTrigger, REST_EVENT, restRequested }, { createDiveStage }]) => {
        if (cancelled || restRequested()) return;
        const dive = createDiveStage(section);
        if (!dive) return;
        const n = section.querySelectorAll(".dv-slide").length;
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const header = () => document.querySelector("header")?.offsetHeight ?? 0;
          const state = { p: 0 };
          const tween = gsap.to(state, {
            p: 1,
            ease: "none",
            onUpdate: () => dive.render(state.p),
            scrollTrigger: {
              trigger: section,
              start: () => `top ${header()}px`,
              end: "bottom bottom",
              scrub: 0.3,
              invalidateOnRefresh: true,
              onRefresh: () => {
                dive.measure();
                dive.render(state.p);
              },
            },
          });
          const trigger = tween.scrollTrigger;
          if (!trigger) return;
          // When the arrows, chips, focus or the snap itself last moved the scroll: a late "scroll ended" from the
          // wheel must not snap over a move still gliding (for 1.1 s) to where the visitor asked.
          let movedAt = -Infinity;
          const toProgress = (p: number) => {
            movedAt = performance.now();
            scrollToY(trigger.start + p * (trigger.end - trigger.start));
          };
          const go = (i: number) => toProgress(familyProgress(Math.min(n - 1, Math.max(0, i)), n));
          const onEnd = () => {
            if (!trigger.isActive || performance.now() - movedAt < 1300) return;
            const to = snapProgress(trigger.progress, n);
            if (to !== null) toProgress(to);
          };
          const onClick = (event: MouseEvent) => {
            const button = (event.target as Element).closest<HTMLElement>("[data-dive-go], [data-dive-step]");
            if (!button) return;
            const step = button.dataset.diveStep;
            go(step ? dive.active() + Number(step) : Number(button.dataset.diveGo));
          };
          // Focus and the screen agree: tabbing into the families before the screen has opened brings the first one
          // in front; tabbing back into the hero's links (Shift+Tab) returns to the hero.
          const onFocus = (event: FocusEvent) => {
            const target = event.target as Element;
            if (target.closest(".dv-inside") && trigger.progress < familyProgress(0, n) - 0.01) go(0);
            else if (target.closest(".dv-hero") && trigger.progress > 0.01) toProgress(0);
          };
          ScrollTrigger.addEventListener("scrollEnd", onEnd);
          section.addEventListener("click", onClick);
          section.addEventListener("focusin", onFocus);
          dive.measure();
          dive.render(trigger.progress);
          return () => {
            ScrollTrigger.removeEventListener("scrollEnd", onEnd);
            section.removeEventListener("click", onClick);
            section.removeEventListener("focusin", onFocus);
            dive.clear();
          };
        });
        const rest = () => mm.revert();
        document.addEventListener(REST_EVENT, rest);
        revert = () => {
          document.removeEventListener(REST_EVENT, rest);
          mm.revert();
        };
      },
    );
    return () => {
      cancelled = true;
      revert();
    };
  }, [sectionId]);
  return null;
}
