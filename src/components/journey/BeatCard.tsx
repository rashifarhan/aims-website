"use client";

import Link from "next/link";
import { useRef } from "react";
import { AddToQuote } from "./AddToQuote";
import type { BeatData } from "./beatData";
import { anchorAt, cardAmount, progress, smooth, useFilm } from "./film";

/**
 * One product's moment over the film. As the camera arrives, the product's name rises and stretches wide; as the
 * camera finishes its push-in, a glass card materialises beside the product, tied to it by a line of light from
 * its tracked position, tinted by the picture behind it, drifting a little with the camera, and dissolving as
 * the camera pulls out. All of it scroll-driven, both ways (visionOS-style spatial UI, 3D plan).
 */
export function BeatCard({ beat, chapterTitle, chapterLine }: { beat: BeatData; chapterTitle: string; chapterLine?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const line = useRef<SVGLineElement>(null);
  const dot = useRef<HTMLSpanElement>(null);

  useFilm((s) => {
    const el = root.current;
    const tl = title.current;
    const cd = card.current;
    const ln = line.current;
    const dt = dot.current;
    if (!el || !tl || !cd || !ln || !dt) return;
    const p = progress(s.frame, beat.from, beat.to);
    if (p < -0.1 || p > 1.1) {
      if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
      return;
    }
    el.style.visibility = "visible";

    const t = smooth(-0.02, 0.1, p) * (1 - smooth(0.22, 0.32, p));
    tl.style.opacity = String(t);
    tl.style.fontStretch = `${75 + 50 * smooth(-0.02, 0.3, p)}%`;
    tl.style.transform = `translate3d(0, ${(1 - t) * 24}px, 0)`;

    const c = cardAmount(p);
    const a = anchorAt(beat.track, s.frame);
    const sx = a ? s.rect.x + a.x * s.rect.w : s.stage.w / 2;
    const sy = a ? s.rect.y + a.y * s.rect.h : s.stage.h / 2;
    const narrow = s.stage.w < 760;
    const cw = cd.offsetWidth;
    const ch = cd.offsetHeight;
    const right = sx < s.stage.w * 0.52;
    let x: number;
    let y: number;
    if (narrow) {
      x = 12;
      y = s.stage.h - ch - 12; // phones: a sheet at the foot (the timeline moves under the header)
    } else {
      // A fixed column beside the product that drifts 12 % with it: the card floats at its own depth.
      // The outer margin on the product's open side, drifting 8 % with it: the card floats at its own depth
      // and keeps clear of a close-up product filling the middle of the frame.
      const margin = Math.max(24, s.stage.w * 0.035);
      x = (right ? s.stage.w - cw - margin : margin) + (sx - s.stage.w / 2) * 0.08;
      y = Math.min(Math.max(sy - ch * 0.4, 84), s.stage.h - ch - 84); // clear of the timeline at the foot
    }
    const tilt = narrow ? 0 : (right ? -1 : 1) * 5 * c;
    cd.style.opacity = String(c);
    cd.style.filter = c < 0.999 ? `blur(${(1 - c) * 8}px)` : "";
    cd.style.transform = `translate3d(${x}px, ${y}px, 0) perspective(1000px) rotateY(${tilt}deg) scale(${0.95 + 0.05 * c})`;
    cd.style.pointerEvents = c > 0.6 ? "auto" : "none";
    cd.inert = c < 0.5; // a card on its way in or out is out of the tab order too
    const [r, g, b] = s.sample((x - s.rect.x) / s.rect.w, (y - s.rect.y) / s.rect.h, cw / s.rect.w, ch / s.rect.h);
    // Take the scene's hue but cap its brightness, so white text stays legible over a bright office.
    const k = Math.min(1, 70 / Math.max(0.2126 * r + 0.7152 * g + 0.0722 * b, 1));
    cd.style.setProperty("--tint", `${(r * k) | 0} ${(g * k) | 0} ${(b * k) | 0}`);

    const show = !narrow && a?.visible && c > 0.01;
    const ex = right ? x : x + cw;
    const ey = y + Math.min(56, ch / 2);
    ln.setAttribute("x1", String(sx));
    ln.setAttribute("y1", String(sy));
    ln.setAttribute("x2", String(ex));
    ln.setAttribute("y2", String(ey));
    const len = Math.hypot(ex - sx, ey - sy);
    ln.style.strokeDasharray = String(len);
    ln.style.strokeDashoffset = String(len * (1 - c));
    ln.style.opacity = show ? "1" : "0";
    dt.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
    dt.style.opacity = show ? String(c) : "0";
  });

  return (
    <div ref={root} className="beat" style={{ visibility: "hidden" }}>
      <svg className="beat-line" aria-hidden="true">
        <line ref={line} />
      </svg>
      <span ref={dot} className="beat-dot" aria-hidden="true" />
      <div ref={title} className="beat-title" aria-hidden="true">
        <p className="beat-model">{beat.model}</p>
        <p className="beat-big">{beat.name.replace(/^(ZKTeco|Alpha) /, "")}</p>
      </div>
      <article ref={card} className="beat-card" aria-label={beat.name}>
        <p className="beat-chapter">{chapterTitle}</p>
        {chapterLine && <p className="beat-aims">{chapterLine}</p>}
        <p className="beat-model" dir="ltr">
          {beat.model}
        </p>
        <h2 className="beat-name">{beat.name}</h2>
        <p className="beat-role">{beat.role}</p>
        <dl className="beat-specs">
          {beat.specs.map((sp) => (
            <div key={sp.label}>
              <dt>{sp.label}</dt>
              <dd>{sp.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="beat-links">
          {beat.links.map((l) => (
            <li key={l.href + l.label}>
              {l.external ? (
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ) : (
                <Link href={l.href}>{l.label} →</Link>
              )}
            </li>
          ))}
        </ul>
        <AddToQuote quote={beat.quote} name={beat.name} />
      </article>
    </div>
  );
}
