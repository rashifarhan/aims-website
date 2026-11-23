"use client";
import { useEffect } from "react";

/** Design Doc 8.3: routes explain delivery from Dubai, once, with a finished static fallback. */
export function LocationsMotion() {
  useEffect(() => {
    const root = document.querySelector(".locations-hub, .location-page");
    const map = root?.querySelector(".reach-map");
    if (!root || !map) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        animations.forEach((a) => {
          if (a.playState === "finished") return;
          if (entry.isIntersecting && !document.hidden) a.play();
          else a.pause();
        });
        if (!entry.isIntersecting || map.hasAttribute("data-played") || media.matches) return;
        map.setAttribute("data-played", "true");
        map.querySelectorAll(".reach-route").forEach((line, i) =>
          animations.push(
            line.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
              duration: 1400,
              delay: i * 120,
              fill: "both",
              easing: "cubic-bezier(.2,.8,.2,1)",
            }),
          ),
        );
      },
      { threshold: 0.2 },
    );
    observer.observe(map);
    const settle = () => {
      if (media.matches) {
        animations.forEach((a) => a.cancel());
        animations.length = 0;
      }
    };
    const visibility = () =>
      animations.forEach((a) => {
        if (a.playState === "finished") return;
        if (document.hidden) a.pause();
        else if (map.getBoundingClientRect().bottom > 0 && map.getBoundingClientRect().top < innerHeight) a.play();
      });
    media.addEventListener("change", settle);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      animations.forEach((a) => a.cancel());
      media.removeEventListener("change", settle);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
