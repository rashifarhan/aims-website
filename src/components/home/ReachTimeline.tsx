"use client";

import { useRef } from "react";
import { gsap, REST_EVENT, restRequested, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { reachTimeline } from "./reachMotion";

/**
 * The reach map's motion, loaded lazily after hydration by ReachMotion (CLAUDE.md §3 GSAP rule). The sequence plays
 * once, unscrubbed and unpinned, when a third of the map is on screen. Under reduced motion, without JS, and while
 * the chunk loads, the server-rendered finished map stands: gsap.matchMedia only builds the timeline when motion is
 * welcome, and reverts to that frame on the test rest switch.
 */
export function ReachTimeline() {
  const marker = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const svg = marker.current?.parentElement?.querySelector<SVGSVGElement>("svg.reach-map");
    if (!svg || restRequested()) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = reachTimeline(svg);
      ScrollTrigger.create({
        trigger: svg,
        // A third of the map's height above the window's foot, so the draw never plays on a sliver.
        start: () => `top bottom-=${svg.getBoundingClientRect().height / 3}`,
        once: true,
        // After the home journey's pin has added its spacer, so the start is measured on the final layout.
        refreshPriority: -1,
        onEnter: () => void tl.play(),
      });
    });
    const rest = () => mm.revert();
    document.addEventListener(REST_EVENT, rest);
    return () => {
      document.removeEventListener(REST_EVENT, rest);
      mm.revert();
    };
  }, []);
  return <span ref={marker} hidden />;
}
