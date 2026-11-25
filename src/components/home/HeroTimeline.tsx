"use client";

import { useEffect, useRef } from "react";
import { gsap, REST_EVENT, restRequested, useGSAP } from "@/components/motion/gsap";
import { heroExit, heroParts, heroTimeline } from "./heroMotion";

type Props = { paused: boolean; onMotion: (moving: boolean) => void };

/**
 * The home hero's motion (client request, 25 Nov 2026; CLAUDE.md §3 GSAP rule), loaded lazily after hydration by
 * HeroAnimation. One master timeline closes the verified frame onto the terminal, plays the screen's verification and
 * then its loop; from 1024px a scrubbed exit follows the scroll. The loop pauses off-screen, while the tab is hidden
 * and by the keyboard-only button (WCAG 2.2.2). Under reduced motion, on the rest switch and if this never loads, the
 * server-rendered verified frame stands. `data-playing` on the art reports the loop's state (tests/e2e).
 */
export function HeroTimeline({ paused, onMotion }: Props) {
  const marker = useRef<HTMLSpanElement>(null);
  const userPaused = useRef(paused);
  const sync = useRef(() => {});
  useEffect(() => {
    userPaused.current = paused;
    sync.current();
  }, [paused]);
  useGSAP(() => {
    const art = marker.current?.closest<HTMLElement>("[data-hero-animation]");
    const hero = art?.closest<HTMLElement>(".home-hero");
    const parts = hero ? heroParts(hero) : null;
    if (!art || !hero || !parts) return;
    const rest = () => {
      art.dataset.state = "verified";
      delete art.dataset.playing;
      onMotion(false);
    };
    if (restRequested()) return rest();
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
      if (!context.conditions?.motion) return rest();
      const tl = heroTimeline(parts);
      // Same frame as the timeline's first: the pending CSS lets go as GSAP's inline styles take over.
      art.dataset.state = "animated";
      let visible = false;
      const update = () => {
        const play = visible && !document.hidden && !userPaused.current;
        if (play) tl.resume();
        else tl.pause();
        art.dataset.playing = String(play);
      };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
      });
      observer.observe(art);
      document.addEventListener("visibilitychange", update);
      sync.current = update;
      update();
      onMotion(true);
      return () => {
        observer.disconnect();
        document.removeEventListener("visibilitychange", update);
        sync.current = () => {};
        rest();
      };
    });
    // The exit reads on a desktop, where the frame stands beside the copy; on phones it would only shrink the device.
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => heroExit(parts, hero));
    const restAll = () => mm.revert();
    document.addEventListener(REST_EVENT, restAll);
    return () => {
      document.removeEventListener(REST_EVENT, restAll);
      mm.revert();
    };
  }, []);
  return <span ref={marker} hidden />;
}
