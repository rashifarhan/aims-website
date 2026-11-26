"use client";

import Link from "next/link";
import { useRef } from "react";
import { AddToQuote } from "./AddToQuote";
import type { BeatData } from "./beatData";
import { anchorAt, useFilm } from "./film";

type Phase = "out" | "in";

/**
 * One product's moment, choreographed against the film rather than scrubbed by it: while the camera travels,
 * nothing covers the picture (user, 26 Nov: no big name while moving; the card names the product). Once the
 * camera settles, a card rises in with a soft spring, its contents a beat apart, and a line of light draws from
 * the product to the card; on the next gesture everything clears in a quarter of a second. The phases switch a data attribute and CSS does the
 * easing (journey.css); position follows the product frame by frame and the glass takes the picture's colour.
 */
export function BeatCard({
  beat,
  stopIndex,
  chapterTitle,
  chapterLine,
}: {
  beat: BeatData;
  stopIndex: number;
  chapterTitle: string;
  chapterLine?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pos = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const line = useRef<SVGLineElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const phase = useRef<Phase>("out");

  useFilm((s) => {
    const el = root.current;
    const ps = pos.current;
    const cd = card.current;
    const ln = line.current;
    const dt = dot.current;
    if (!el || !ps || !cd || !ln || !dt) return;
    const next: Phase = s.stop === stopIndex && s.settled ? "in" : "out";
    const enter = next !== phase.current;
    if (enter) {
      phase.current = next;
      cd.inert = next !== "in"; // a card on its way in or out is out of the tab order too
    }
    // Placed only while the camera holds on the product: while it travels, the card, line and dot neither show
    // nor follow it, and on leaving they fade where they stood instead of sliding with the picture.
    if (next !== "in") {
      if (enter) el.dataset.phase = next;
      return;
    }

    const a = anchorAt(beat.track, s.frame);
    const sx = a ? s.rect.x + a.x * s.rect.w : s.stage.w / 2;
    const sy = a ? s.rect.y + a.y * s.rect.h : s.stage.h / 2;
    const narrow = s.stage.w < 768; // journey.css 47.99rem
    const cw = cd.offsetWidth;
    const ch = cd.offsetHeight;
    const right = sx < s.stage.w * 0.52;
    let x: number;
    let y: number;
    if (narrow) {
      x = 12;
      y = s.stage.h - ch - 12; // phones: a sheet at the foot (the timeline moves under the header)
    } else {
      // The outer margin on the product's open side: every close-up frames its product on the left third.
      const margin = Math.max(24, s.stage.w * 0.04);
      x = right ? s.stage.w - cw - margin : margin;
      y = Math.min(Math.max(sy - ch * 0.42, 84), s.stage.h - ch - 84); // clear of the timeline at the foot
    }
    ps.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    el.dataset.side = right ? "right" : "left";
    const [r, g, b] = s.sample((x - s.rect.x) / s.rect.w, (y - s.rect.y) / s.rect.h, cw / s.rect.w, ch / s.rect.h);
    // Take the scene's hue but cap its brightness, so white text stays legible over a bright office.
    const k = Math.min(1, 70 / Math.max(0.2126 * r + 0.7152 * g + 0.0722 * b, 1));
    cd.style.setProperty("--tint", `${(r * k) | 0} ${(g * k) | 0} ${(b * k) | 0}`);

    const ex = right ? x : x + cw;
    const ey = y + Math.min(56, ch / 2);
    ln.setAttribute("x1", String(sx));
    ln.setAttribute("y1", String(sy));
    ln.setAttribute("x2", String(ex));
    ln.setAttribute("y2", String(ey));
    ln.style.setProperty("--len", String(Math.ceil(Math.hypot(ex - sx, ey - sy)) + 2));
    el.toggleAttribute("data-no-anchor", narrow || !a?.visible);
    dt.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
    if (enter) {
      // Commit the new place and the line's length before the phase flips, so the light draws from the product
      // rather than appearing whole.
      void ln.getBoundingClientRect();
      el.dataset.phase = next;
    }
  });

  return (
    <div ref={root} className="beat" data-phase="out">
      <svg className="beat-line" aria-hidden="true">
        <line ref={line} />
      </svg>
      <span ref={dot} className="beat-dot" aria-hidden="true" />
      <div ref={pos} className="beat-pos">
        <article ref={card} className="beat-card" aria-label={beat.name} inert>
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
    </div>
  );
}
