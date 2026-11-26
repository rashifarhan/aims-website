"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero film and the line that moves with it (client direction, 26 Nov 2026: a cinematic background film with the
 * text animating over it). The film is six 3.4-second shots (stand-in footage, credited in the footer); the caption
 * says what each shot stands for and its bar fills with the shot, read from the video's own clock so the two never
 * drift. Reduced motion: the poster stands and nothing plays. The film runs past 5 s, so it has a pause button
 * (WCAG 2.2.2).
 */
const SHOT_SECONDS = 3.4;

export function ReelVideo({
  labels,
  pause,
  play,
  label,
}: {
  labels: string[];
  pause: string;
  play: string;
  label: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const bars = useRef<(HTMLElement | null)[]>([]);
  const [shot, setShot] = useState(0);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    // The button follows the film's own state, however it changed.
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return () => {
        v.removeEventListener("play", onPlay);
        v.removeEventListener("pause", onPause);
      };
    }
    void v.play().catch(() => undefined);
    let raf = 0;
    let last = -1;
    const tick = () => {
      const t = v.currentTime;
      const i = Math.floor(t / SHOT_SECONDS) % labels.length;
      if (i !== last) {
        last = i;
        setShot(i);
      }
      bars.current.forEach((b, j) => {
        b?.style.setProperty("--fill", j < i ? "1" : j === i ? String((t % SHOT_SECONDS) / SHOT_SECONDS) : "0");
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Off screen, the film stops: no decoding nobody sees (CLAUDE.md §3, loops pause off-screen).
    const io = new IntersectionObserver(([e]) => {
      if (!e || v.dataset.userPaused) return;
      if (e.isIntersecting) void v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [labels.length]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      delete v.dataset.userPaused;
      void v.play();
    } else {
      v.dataset.userPaused = "1";
      v.pause();
    }
  };

  return (
    <>
      <video
        ref={video}
        className="vh-video"
        muted
        loop
        playsInline
        preload="auto"
        poster="/video/hero-film-poster.webp"
        aria-label={label}
      >
        {/* Phones get a lighter cut: under 1 MB, where the film fills less of the screen. */}
        <source src="/video/hero-film-sm.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/video/hero-film.mp4" type="video/mp4" />
      </video>
      <div className="vh-reel">
        <ol className="vh-bars" aria-hidden="true">
          {labels.map((l, i) => (
            <li key={l}>
              <span
                ref={(el) => {
                  bars.current[i] = el;
                }}
                className="vh-bar"
              />
            </li>
          ))}
        </ol>
        <p className="vh-now">
          <span className="vh-now-index" dir="ltr">
            {String(shot + 1).padStart(2, "0")}
          </span>
          <span className="vh-now-mask">
            <span key={shot} className="vh-now-label">
              {labels[shot]}
            </span>
          </span>
        </p>
      </div>
      <button type="button" className="vh-pause" onClick={toggle} aria-label={paused ? play : pause}>
        {paused ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5.5v13l10.5-6.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          </svg>
        )}
      </button>
    </>
  );
}
