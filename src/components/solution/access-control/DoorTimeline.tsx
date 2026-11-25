"use client";

import { useRef } from "react";
import { gsap, REST_EVENT, restRequested, useGSAP } from "@/components/motion/gsap";
import { flowDoor, pinnedDoor } from "./doorMotion";
import { doorScene, keepFrame } from "./doorScene";

/**
 * The door kit's motion (client request, 25 Nov 2026; CLAUDE.md §3 GSAP rule), loaded lazily after hydration by
 * DoorMotion. gsap.matchMedia picks the pinned, scrubbed walk-through from 1024px when the section fits the screen
 * below the header, the unpinned per-step flow otherwise, and nothing under reduced motion: there the server-rendered
 * finished frame stands, as it does without JS. Reverting restores that frame exactly (keepFrame, run after GSAP has
 * reverted its tweens). `data-motion` on the section reports the mode (tests/e2e).
 */
export function DoorTimeline() {
  const marker = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const section = marker.current?.closest("section");
    const scene = section ? doorScene(section) : null;
    if (!section || !scene || restRequested()) return;
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 1024px)" }, (context) => {
      const { motion, wide } = context.conditions ?? {};
      if (!motion) return;
      const header = document.querySelector("header")?.offsetHeight ?? 0;
      const pin = wide && scene.wrap.offsetHeight <= innerHeight - header;
      const restore = keepFrame(scene);
      section.dataset.motion = pin ? "pinned" : "flow";
      if (pin) pinnedDoor(scene);
      else flowDoor(scene);
      return () => {
        restore();
        delete section.dataset.motion;
        delete section.dataset.step;
        scene.items.forEach((item) => item.removeAttribute("aria-current"));
      };
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
