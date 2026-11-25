"use client";

import { useEffect, useRef, useState } from "react";
import "./hero-film.css";

/**
 * The hero film (client request, 25 Nov 2026: realistic, and no waiting): a photoreal Blender render of the
 * SpeedFace terminal (light sweep, face scan, "Verified", the device opening into its layers). Its first frame
 * is the poster, painted with the page, so nothing is ever empty; the film plays muted and loops seamlessly.
 * It pauses off screen, shows only the poster under reduced motion, and keeps a keyboard-reachable pause.
 */
export function HeroFilm({ label, pauseLabel, playLabel }: { label: string; pauseLabel: string; playLabel: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let userPaused = false;
    const sync = () => {
      setReduced(reduce.matches);
      if (reduce.matches || userPaused || !visible) el.pause();
      else void el.play().catch(() => undefined);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      sync();
    });
    observer.observe(el);
    reduce.addEventListener("change", sync);
    const onToggle = (event: Event) => {
      userPaused = (event as CustomEvent<boolean>).detail;
      sync();
    };
    el.addEventListener("hero-film-toggle", onToggle);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", sync);
      el.removeEventListener("hero-film-toggle", onToggle);
    };
  }, []);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    video.current?.dispatchEvent(new CustomEvent("hero-film-toggle", { detail: next }));
  };

  return (
    <div className="hero-film">
      <video
        ref={video}
        className="hero-film-video"
        poster="/media/hero/terminal-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={label}
        width={720}
        height={900}
      >
        <source src="/media/hero/terminal.webm" type="video/webm" />
        <source src="/media/hero/terminal.mp4" type="video/mp4" />
      </video>
      {!reduced && (
        <button type="button" className="hero-film-pause" aria-pressed={paused} onClick={toggle}>
          {paused ? playLabel : pauseLabel}
        </button>
      )}
    </div>
  );
}
