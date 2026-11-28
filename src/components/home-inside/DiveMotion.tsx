"use client";

import { useEffect } from "react";
import { familyProgress, snapProgress } from "@/lib/dive";
import { keyIntent } from "@/lib/keyScroll";
import { pageOwnsKey, scrollToY } from "@/components/inside/scrollTo";

/** Where the dive pins and scrubs: a desktop screen, a mouse or trackpad, motion allowed (home-dive.css, same query). */
export const DIVE_QUERY =
  "(min-width: 1024px) and (min-height: 600px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
/** Phones and tablets swipe the families instead (diveCarousel; owner review, 28 Nov 2026). */
const SWIPE_QUERY = "(max-width: 1023px), (pointer: coarse), (pointer: none)";

/**
 * The home dive's motion (CLAUDE.md → Design rules, Motion and scroll engine). On a desktop screen the stage pins with
 * CSS sticky; GSAP ScrollTrigger scrubs one progress value through it (smoothed by Lenis) and, when the scroll rests,
 * settles it softly on the hero or the nearest family. The arrows, chips, keyboard focus and the scroll keys move the
 * scroll to a family, so the scroll and the screen never disagree. On phones and tablets nothing pins or scrubs: the
 * hero stands and the families are a swiped row (diveCarousel), so a thumb scrolls the page natively. Under reduced
 * motion on a desktop, or on the motion rest switch, nothing is written and the stacked layout stands.
 */
export function DiveMotion({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const dive = matchMedia(DIVE_QUERY);
    const swipe = matchMedia(SWIPE_QUERY);
    let stopDive: (() => void) | null = null;
    let stopSwipe: (() => void) | null = null;
    let cancelled = false;

    const startSwipe = () => {
      if (!swipe.matches || stopSwipe) return;
      stopSwipe = () => {};
      void import("./diveCarousel").then(({ createDiveCarousel }) => {
        if (cancelled || !swipe.matches || !stopSwipe) return;
        stopSwipe = createDiveCarousel(section);
      });
    };
    const endSwipe = () => {
      stopSwipe?.();
      stopSwipe = null;
    };

    // GSAP loads only for a desktop screen; gsap.matchMedia then follows the query both ways.
    const startDive = () => {
      if (!dive.matches || stopDive) return;
      stopDive = () => {};
      void Promise.all([import("@/components/motion/gsap"), import("./diveStage")]).then(
        ([{ gsap, ScrollTrigger, REST_EVENT, restRequested }, { createDiveStage }]) => {
          if (cancelled || restRequested()) return;
          const stage = createDiveStage(section);
          if (!stage) return;
          const n = section.querySelectorAll(".dv-slide").length;
          const mm = gsap.matchMedia();
          mm.add(DIVE_QUERY, () => {
            const header = () => document.querySelector("header")?.offsetHeight ?? 0;
            const state = { p: 0 };
            const tween = gsap.to(state, {
              p: 1,
              ease: "none",
              onUpdate: () => stage.render(state.p),
              scrollTrigger: {
                trigger: section,
                start: () => `top ${header()}px`,
                end: "bottom bottom",
                scrub: 0.3,
                invalidateOnRefresh: true,
                onRefresh: () => {
                  stage.measure();
                  stage.render(state.p);
                },
              },
            });
            const trigger = tween.scrollTrigger;
            if (!trigger) return;
            // When the arrows, chips, keys, focus or the snap itself last moved the scroll: a late "scroll ended"
            // from the wheel must not snap over a move still gliding (for 1.1 s) to where the visitor asked.
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
              go(step ? stage.active() + Number(step) : Number(button.dataset.diveGo));
            };
            // Focus and the screen agree: tabbing into the families before the screen has opened brings the first
            // one in front; tabbing back into the hero's links (Shift+Tab) returns to the hero.
            const onFocus = (event: FocusEvent) => {
              const target = event.target as Element;
              if (target.closest(".dv-inside") && trigger.progress < familyProgress(0, n) - 0.01) go(0);
              else if (target.closest(".dv-hero") && trigger.progress > 0.01) toProgress(0);
            };
            // The scroll keys step through the dive one place at a time (hero, each family, out), as the wheel's
            // snap does, instead of a line the snap would undo. Captured, so the page's own key glide stands aside.
            const onKey = (event: KeyboardEvent) => {
              const intent = keyIntent(event);
              // From the very top too, where the trigger starts and is not yet "active".
              const y = trigger.scroll();
              const inside = y >= trigger.start - 1 && y < trigger.end - 1;
              if (intent?.kind !== "by" || !inside || !pageOwnsKey(event)) return;
              const first = familyProgress(0, n);
              const opened = trigger.progress >= first - 0.01;
              const at = opened ? stage.active() : -1;
              const next = at + intent.direction;
              if (next < -1 || next >= n) return;
              event.preventDefault();
              if (next === -1) toProgress(0);
              else go(next);
            };
            ScrollTrigger.addEventListener("scrollEnd", onEnd);
            section.addEventListener("click", onClick);
            section.addEventListener("focusin", onFocus);
            addEventListener("keydown", onKey, { capture: true });
            stage.measure();
            stage.render(trigger.progress);
            return () => {
              ScrollTrigger.removeEventListener("scrollEnd", onEnd);
              section.removeEventListener("click", onClick);
              section.removeEventListener("focusin", onFocus);
              removeEventListener("keydown", onKey, { capture: true });
              stage.clear();
            };
          });
          const rest = () => mm.revert();
          document.addEventListener(REST_EVENT, rest);
          stopDive = () => {
            document.removeEventListener(REST_EVENT, rest);
            mm.revert();
          };
        },
      );
    };

    const sync = () => {
      startDive();
      if (swipe.matches) startSwipe();
      else endSwipe();
    };
    sync();
    dive.addEventListener("change", sync);
    swipe.addEventListener("change", sync);
    return () => {
      cancelled = true;
      dive.removeEventListener("change", sync);
      swipe.removeEventListener("change", sync);
      stopDive?.();
      endSwipe();
    };
  }, [sectionId]);
  return null;
}
