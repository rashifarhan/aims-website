"use client";

import { useRef } from "react";
import { gsap, REST_EVENT, restRequested, useGSAP } from "@/components/motion/gsap";
import { reachTimeline } from "./reachMotionCore";

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
      // The browser reports when a third of the map is really on screen, so the draw never plays on a sliver. An
      // IntersectionObserver, not a ScrollTrigger start: the home journey's pin and the section title reveals change
      // the page's height while it loads, and a start measured before they settle could fire at load, unseen.
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          tl.play();
          observer.disconnect();
        },
        { threshold: 1 / 3 },
      );
      observer.observe(svg);
      return () => observer.disconnect();
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
