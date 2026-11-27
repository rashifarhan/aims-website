"use client";

import { useEffect } from "react";
import { STAGE_OPEN, stageSnap, type Aperture } from "@/lib/stageDive";
import { scrollToY } from "@/components/inside/scrollTo";

/**
 * A page stage's dive (CLAUDE.md → Design rules, Motion and scroll engine; the home dive's engine, without its reel).
 * The stage pins with CSS sticky; GSAP ScrollTrigger scrubs one progress value through it (smoothed by Lenis on a
 * fine pointer) and, when the scroll rests mid-dive, finishes or undoes it. Focus moving into the inside opens it;
 * focus moving back to the stage's links returns to the stage. Under reduced motion, on the motion rest switch or
 * without JavaScript nothing is written and the stacked layout in products-inside.css stands.
 */
export function StageMotion({ sectionId, screen }: { sectionId: string; screen: Aperture }) {
  const { x, y, w, h } = screen;
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    let revert = () => {};
    let cancelled = false;
    void Promise.all([import("@/components/motion/gsap"), import("./stageWriter")]).then(
      ([{ gsap, ScrollTrigger, REST_EVENT, restRequested }, { createStageWriter }]) => {
        if (cancelled || restRequested()) return;
        const writer = createStageWriter(section, { x, y, w, h });
        if (!writer) return;
        const mm = gsap.matchMedia();
        // The same query as the pinned block in products-inside.css: phones and tablets keep the stacked layout.
        mm.add("(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)", () => {
          const header = () => document.querySelector("header")?.offsetHeight ?? 0;
          const state = { p: 0 };
          const tween = gsap.to(state, {
            p: 1,
            ease: "none",
            onUpdate: () => writer.render(state.p),
            scrollTrigger: {
              trigger: section,
              start: () => `top ${header()}px`,
              end: "bottom bottom",
              scrub: 0.3,
              invalidateOnRefresh: true,
              onRefresh: () => {
                writer.measure();
                writer.render(state.p);
              },
            },
          });
          const trigger = tween.scrollTrigger;
          if (!trigger) return;
          // A late "scroll ended" must not snap over a move still gliding to where the visitor asked (as on home).
          let movedAt = -Infinity;
          const toProgress = (p: number) => {
            movedAt = performance.now();
            scrollToY(trigger.start + p * (trigger.end - trigger.start));
          };
          const onEnd = () => {
            if (!trigger.isActive || performance.now() - movedAt < 1300) return;
            const to = stageSnap(trigger.progress);
            if (to !== null) toProgress(to);
          };
          const onFocus = (event: FocusEvent) => {
            const target = event.target as Element;
            if (target.closest(".ps-inside") && trigger.progress < STAGE_OPEN[1] - 0.01) toProgress(STAGE_OPEN[1]);
            else if (target.closest(".ps-hero") && trigger.progress > 0.01) toProgress(0);
          };
          ScrollTrigger.addEventListener("scrollEnd", onEnd);
          section.addEventListener("focusin", onFocus);
          writer.measure();
          writer.render(trigger.progress);
          return () => {
            ScrollTrigger.removeEventListener("scrollEnd", onEnd);
            section.removeEventListener("focusin", onFocus);
            writer.clear();
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
  }, [sectionId, x, y, w, h]);
  return null;
}
