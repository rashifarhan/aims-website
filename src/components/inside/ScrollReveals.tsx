"use client";

import { useEffect } from "react";

/**
 * The page's scroll reveals (CLAUDE.md → Design rules, Motion): `[data-reveal]` blocks rise 24px and fade in once as
 * they enter; `[data-open]` screens open from a small rounded screen to full, scrubbed with the scroll, their photo
 * settling from 1.12 to 1. The server renders every final state, so without JavaScript, under reduced motion or on the
 * motion rest switch (e2e audits) everything simply stands. GSAP loads lazily after hydration.
 */
export function ScrollReveals() {
  useEffect(() => {
    let revert = () => {};
    let cancelled = false;
    void import("@/components/motion/gsap").then(({ gsap, ScrollTrigger, REST_EVENT, restRequested }) => {
      if (cancelled || restRequested()) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const below = (el: Element) => el.getBoundingClientRect().top > innerHeight * 0.92;
        const blocks = gsap.utils.toArray<HTMLElement>("main [data-reveal]").filter(below);
        // Opacity only, never visibility: a waiting block's links stay in the tab order, and focusing one scrolls it in.
        gsap.set(blocks, { opacity: 0, y: 24 });
        ScrollTrigger.batch(blocks, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", overwrite: true }),
        });
        for (const screen of gsap.utils.toArray<HTMLElement>("main [data-open]").filter(below)) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: screen, start: "top bottom", end: "top 72%", scrub: 0.6 },
          });
          tl.fromTo(
            screen,
            { clipPath: "inset(16% 14% 16% 14% round 14px)" },
            { clipPath: "inset(0% 0% 0% 0% round 14px)", ease: "none" },
          );
          const photo = screen.querySelector("img");
          if (photo) tl.fromTo(photo, { scale: 1.12 }, { scale: 1, ease: "none" }, 0);
        }
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
  }, []);
  return null;
}
