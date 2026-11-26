"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { FamilyShow } from "./familyShowcase";
import { FamilyStage } from "./FamilyStage";
import "./family-slider.css";

export type FamilySlide = FamilyShow & { count: number; href: string; productHref: string };

/**
 * Option 3, the family slider (client exploration, 26 Nov 2026; after MotionSites "Smoothie Slider"). Each product
 * family floods the hero in its own ground with a giant word behind AIMS's photograph of a real model; real
 * accessories float around it and drift with the pointer. Changing family wipes the new ground in from the side it
 * comes from while its word, product and pieces arrive with parallax. Nothing moves on a timer: tabs, arrows, the
 * keyboard (← →) and a swipe change it. Reduced motion: the change is instant and nothing floats.
 */
export function FamilySlider({ slides }: { slides: FamilySlide[] }) {
  const [state, setState] = useState({ index: 0, prev: -1, dir: 1 });
  const root = useRef<HTMLElement>(null);
  const go = (to: number) =>
    setState((s) => {
      const index = (to + slides.length) % slides.length;
      if (index === s.index) return s;
      return { index, prev: s.index, dir: to > s.index || (s.index === slides.length - 1 && index === 0) ? 1 : -1 };
    });
  const step = (d: number) => go(state.index + d);

  // The pointer tilts the pieces by their depth (a pointer-only nicety; touch screens stay still).
  useEffect(() => {
    const el = root.current;
    if (!el || !matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  const startX = useRef<number | null>(null);
  const s = slides[state.index];
  if (!s) return null;
  const next = slides[(state.index + 1) % slides.length];
  const prev = slides[(state.index - 1 + slides.length) % slides.length];
  const leaving = state.prev >= 0 ? slides[state.prev] : undefined;

  return (
    <section
      ref={root}
      className="fs"
      aria-roledescription="carousel"
      aria-label="AIMS product families"
      style={{ "--ground": s.ground } as CSSProperties}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
      }}
    >
      {leaving && <FamilyStage key={`out-${state.prev}-${state.index}`} slide={leaving} phase="out" dir={state.dir} />}
      <FamilyStage key={`in-${state.index}`} slide={s} phase={state.prev >= 0 ? "in" : "first"} dir={state.dir} />

      <div className="fs-ui">
        <h1 className="fs-sr">AIMS: ZKTeco product families in Dubai and Abu Dhabi</h1>
        <div className="fs-tabs" role="tablist" aria-label="Product families">
          {slides.map((f, i) => (
            <button
              key={f.slug}
              type="button"
              role="tab"
              aria-selected={i === state.index}
              className="fs-tab"
              onClick={() => go(i)}
            >
              {f.name}
            </button>
          ))}
        </div>
        <p className="fs-count" aria-hidden="true">
          {String(state.index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </p>
        <div className="fs-caption" aria-live="polite" key={`cap-${state.index}`}>
          <p className="fs-name">{s.name}</p>
          <p className="fs-line">{s.line}</p>
          <Link href={s.productHref} className="fs-model">
            <Image src={s.hero.src} alt="" width={40} height={40} className="fs-model-thumb" />
            <span>
              <small>Shown</small>
              {s.hero.model}
            </span>
          </Link>
        </div>
        <Link href={s.href} className="fs-cta">
          See the range
          <small>
            {s.count} models · {s.facts.map((f) => f[1]).join(" · ")}
          </small>
        </Link>
        <button
          type="button"
          className="fs-arrow fs-prev"
          onClick={() => step(-1)}
          aria-label={`Previous: ${prev?.name}`}
        >
          <span aria-hidden="true">←</span>
          <em>{prev?.word}</em>
        </button>
        <button type="button" className="fs-arrow fs-next" onClick={() => step(1)} aria-label={`Next: ${next?.name}`}>
          <em>{next?.word}</em>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
