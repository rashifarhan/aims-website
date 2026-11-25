"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { flowMotion, journeyParts, pinnedTimeline, revealIntro } from "./journeyMotion";

gsap.registerPlugin(useGSAP);

/** Set on <html> (or sent as an event) to put every GSAP sequence at its final, static frame: the e2e axe audit reads
 * resting text this way, as it cancels the CSS scroll reveals (tests/e2e/smoke.spec.ts). */
const REST_EVENT = "aims:motion-rest";
const restRequested = () => document.documentElement.dataset.motionRest === "true";

/**
 * The home journey's motion (client decision, 25 Nov 2026; CLAUDE.md §3 GSAP rule), loaded lazily after hydration by
 * JourneyMotion. gsap.matchMedia picks the pinned, scrubbed timeline from 1024px on a screen at least 640px tall, the
 * unpinned flow below, and nothing under reduced motion: there the server-rendered final frame stands (rail full,
 * every node ticked, every card whole), as it does without JS. Reverting restores that frame exactly, because the
 * CSS rests at it and GSAP only writes inline styles over it.
 */
export function JourneyTimeline() {
  const marker = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const section = marker.current?.closest("section");
    const parts = section ? journeyParts(section) : null;
    const wrap = section?.querySelector<HTMLElement>(":scope > .wrap");
    if (!section || !parts || !wrap || restRequested()) return;
    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        pin: "(min-width: 1024px) and (min-height: 640px)",
      },
      (context) => {
        const { motion, pin } = context.conditions ?? {};
        if (!motion) return;
        section.dataset.motion = pin ? "pinned" : "flow";
        revealIntro(parts);
        if (!pin) {
          flowMotion(parts);
          return () => delete section.dataset.motion;
        }
        parts.counter.dataset.live = "";
        const tl = pinnedTimeline(parts, wrap);
        // A card's link can take focus while the card waits below the window: scroll to the point where it is the
        // active step, so focus is never hidden (CLAUDE.md §4).
        const onFocus = (event: FocusEvent) => {
          const k = parts.cards.findIndex((card) => card.contains(event.target as Node));
          const st = tl.scrollTrigger;
          if (k < 0 || !st) return;
          const at = tl.labels[`step-${k}`] ?? 0;
          window.scrollTo({ top: st.start + (st.end - st.start) * (at / tl.duration()), behavior: "instant" });
        };
        section.addEventListener("focusin", onFocus);
        return () => {
          section.removeEventListener("focusin", onFocus);
          delete section.dataset.motion;
          delete parts.counter.dataset.live;
        };
      },
    );
    const rest = () => mm.revert();
    document.addEventListener(REST_EVENT, rest);
    return () => {
      document.removeEventListener(REST_EVENT, rest);
      mm.revert();
    };
  }, []);
  return <span ref={marker} hidden />;
}
