"use client";

import { type ReactNode, useContext, useRef } from "react";
import { FilmContext, progress, smooth, useFilm } from "./film";

type Fade = [start: number, end: number];

/**
 * Words that live in a stretch of the film: they rise in over `fadeIn` and leave over `fadeOut` (fractions of
 * the frame range), widening their display type as they go (Mona Sans width axis), all scrubbed by scroll.
 */
export function Scrubbed({
  from,
  to,
  fadeIn = [0, 0.15],
  fadeOut = [0.8, 1],
  stretch = [100, 125],
  className,
  children,
}: {
  from: number;
  to: number;
  fadeIn?: Fade;
  fadeOut?: Fade;
  stretch?: [number, number];
  className?: string;
  children: ReactNode;
}) {
  const el = useRef<HTMLDivElement>(null);
  useFilm((s) => {
    const node = el.current;
    if (!node) return;
    const p = progress(s.frame, from, to);
    const a = smooth(fadeIn[0], fadeIn[1], p) * (1 - smooth(fadeOut[0], fadeOut[1], p));
    node.style.visibility = a > 0.002 ? "visible" : "hidden";
    node.style.opacity = String(a);
    node.style.transform = `translate3d(0, ${(1 - a) * 28}px, 0)`;
    node.style.setProperty(
      "--stretch",
      `${stretch[0] + (stretch[1] - stretch[0]) * smooth(fadeIn[0], fadeOut[1], p)}%`,
    );
  });
  return (
    <div ref={el} className={className}>
      {children}
    </div>
  );
}

/** The lift ride: a floor display counting up as the car rises, in step with the film (journey.LIFT). */
export function LiftCounter({ from, to, floor }: { from: number; to: number; floor: number }) {
  const el = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  useFilm((s) => {
    if (!el.current || !num.current) return;
    const p = progress(s.frame, from, to);
    const a = smooth(-0.05, 0.12, p) * (1 - smooth(0.85, 1, p));
    el.current.style.visibility = a > 0.002 ? "visible" : "hidden";
    el.current.style.opacity = String(a);
    num.current.textContent = String(1 + Math.round((floor - 1) * smooth(0.2, 0.8, p))).padStart(2, "0");
  });
  return (
    <div ref={el} className="lift" aria-hidden="true">
      <span className="lift-label">Floor</span>
      <span ref={num} className="lift-number">
        01
      </span>
    </div>
  );
}

/** Chapter rail: where you are, how far through, what's next; a tap jumps to that chapter's first product. */
export function ChapterRail({
  chapters,
}: {
  chapters: { key: string; label: string; from: number; to: number; jump: number }[];
}) {
  const film = useContext(FilmContext);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  useFilm((s) => {
    chapters.forEach((c, i) => {
      const f = Math.min(Math.max(progress(s.frame, c.from, c.to), 0), 1);
      fills.current[i]?.style.setProperty("transform", `scaleX(${f})`);
      items.current[i]?.toggleAttribute("data-current", s.frame >= c.from && s.frame <= c.to);
    });
  });
  return (
    <nav className="rail" aria-label="Chapters">
      <ol>
        {chapters.map((c, i) => (
          <li key={c.key} ref={(n) => void (items.current[i] = n)}>
            <button type="button" onClick={() => film?.jump(c.jump)}>
              <span className="rail-label">{c.label}</span>
              <span className="rail-track" aria-hidden="true">
                <span ref={(n) => void (fills.current[i] = n)} className="rail-fill" />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
