"use client";

import dynamic from "next/dynamic";

/**
 * The journey's GSAP motion, loaded only after hydration and only on the home page (CLAUDE.md §3 GSAP rule, §5): the
 * chunk with GSAP, ScrollTrigger, SplitText and DrawSVG never blocks the first paint or the hero's LCP. Until it
 * arrives, and if it never does, the section stands at its final frame.
 */
const JourneyTimeline = dynamic(() => import("./JourneyTimeline").then((m) => m.JourneyTimeline), { ssr: false });

export function JourneyMotion() {
  return <JourneyTimeline />;
}
