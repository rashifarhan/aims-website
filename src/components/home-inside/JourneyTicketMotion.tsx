"use client";

import { useEffect } from "react";
import { stepAt, stepCentre, stepSnap } from "@/lib/steps";
import { scrollToY } from "@/components/inside/scrollTo";

/**
 * The job ticket's motion (CLAUDE.md → Design rules, Motion): the section pins with CSS sticky and GSAP ScrollTrigger
 * reads its progress. Each step takes an equal stretch: its row is punched, its detail stands beside the ticket, the
 * counter rolls on, and a resting scroll settles on the nearest step. Focus on a step's link brings that step in
 * front. Under reduced motion or the rest switch the steps stand as a list (home-inside.css). GSAP loads lazily.
 */
export function JourneyTicketMotion({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const rows = [...section.querySelectorAll<HTMLElement>(".hj-row")];
    const details = [...section.querySelectorAll<HTMLElement>(".hj-step")];
    const count = section.querySelector<HTMLElement>(".hj-count-now");
    const n = details.length;
    let revert = () => {};
    let cancelled = false;
    const show = (active: number) => {
      rows.forEach((row, k) => (row.dataset.state = k < active ? "done" : k === active ? "now" : "next"));
      details.forEach((detail, k) => detail.toggleAttribute("data-active", k === active));
      if (count) count.textContent = String(active + 1).padStart(2, "0");
    };
    void import("@/components/motion/gsap").then(({ gsap, ScrollTrigger, REST_EVENT, restRequested }) => {
      if (cancelled || restRequested()) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        section.dataset.motion = "pinned";
        let shown = 0;
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: () => `top ${document.querySelector("header")?.offsetHeight ?? 0}px`,
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            section.style.setProperty("--jp", self.progress.toFixed(4));
            const active = stepAt(self.progress, n);
            if (active !== shown) show((shown = active));
          },
        });
        // As on the dive: a late "scroll ended" never snaps over a move still gliding (for 0.9 s) to a focused step.
        let movedAt = -Infinity;
        const toProgress = (p: number) => {
          movedAt = performance.now();
          scrollToY(trigger.start + p * (trigger.end - trigger.start), 0.9);
        };
        const onEnd = () => {
          if (!trigger.isActive || performance.now() - movedAt < 1100) return;
          const to = stepSnap(trigger.progress, n);
          if (to !== null) toProgress(to);
        };
        const onFocus = (event: FocusEvent) => {
          const step = (event.target as Element).closest<HTMLElement>(".hj-step");
          const k = step ? details.indexOf(step) : -1;
          if (k >= 0 && k !== shown) toProgress(stepCentre(k, n));
        };
        ScrollTrigger.addEventListener("scrollEnd", onEnd);
        section.addEventListener("focusin", onFocus);
        return () => {
          ScrollTrigger.removeEventListener("scrollEnd", onEnd);
          section.removeEventListener("focusin", onFocus);
          delete section.dataset.motion;
          section.style.removeProperty("--jp");
          show(0);
        };
      });
      const rest = () => mm.revert();
      document.addEventListener(REST_EVENT, rest);
      revert = () => {
        document.removeEventListener(REST_EVENT, rest);
        mm.revert();
      };
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, [sectionId]);
  return null;
}
