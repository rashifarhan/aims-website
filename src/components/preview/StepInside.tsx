"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { FamilySlide } from "./FamilySlider";
import "./step-inside.css";

/**
 * Option 2, step inside the terminal (client exploration, 26 Nov 2026; after MotionSites "Laptop Portfolio"). AIMS's
 * SpeedFace stands before a giant wordmark with an access card on a lanyard. Scrolling pins the stage and flies the
 * terminal forward until its screen fills the view; the screen then becomes a showcase of the six families, one per
 * stretch of scroll, with arrows that scroll to each. Native scroll throughout (CSS sticky, no scroll-jacking).
 * Reduced motion: no pin, the hero stands and the showcase sits below it with its arrows.
 */
const SCREEN = { x: 0.152, y: 0.2, w: 0.688, h: 0.571 };
// The dive takes about two thirds of a screen of scrolling (client feedback, 26 Nov 2026: it felt slow).
const DIVE = [0.02, 0.15] as const;
const OPEN = [0.15, 0.22] as const;
const SHOW = [0.24, 0.97] as const;
const ramp = (p: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export function StepInside({ slides }: { slides: FamilySlide[] }) {
  const section = useRef<HTMLElement>(null);
  const device = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const root = section.current;
    const dev = device.current;
    if (!root || !dev) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let geo = { tx: 0, ty: 0, k: 1, ox: 0, oy: 0, inset: [0, 0, 0, 0] };
    let raf = 0;
    let last = -1;
    let target = 0;
    let shown = -1;
    const measure = () => {
      // The terminal's resting box (its transform cleared); the scale at which its screen fills the stage's height
      // (no more: blowing the photo up to fill the width as well made the browser drop frames and blurred it); and
      // where that enlarged screen then sits, which is where the showcase starts to open from.
      dev.style.transform = "none";
      const stage = root.querySelector<HTMLElement>(".si-stage");
      const s = stage?.getBoundingClientRect();
      const r = dev.getBoundingClientRect();
      if (!s) return;
      const sw = r.width * SCREEN.w;
      const sh = r.height * SCREEN.h;
      const cx = r.left + r.width * (SCREEN.x + SCREEN.w / 2);
      const cy = r.top + r.height * (SCREEN.y + SCREEN.h / 2);
      const k = (s.height * 0.94) / sh;
      const fx = (s.width - sw * k) / 2;
      const fy = (s.height - sh * k) / 2;
      geo = {
        tx: s.left + s.width / 2 - cx,
        ty: s.top + s.height / 2 - cy,
        k,
        ox: r.width * (SCREEN.x + SCREEN.w / 2),
        oy: r.height * (SCREEN.y + SCREEN.h / 2),
        inset: [fy, fx, fy, fx],
      };
      dev.style.transformOrigin = `${geo.ox}px ${geo.oy}px`;
      shown = -1;
    };
    const progress = () => {
      const rect = root.getBoundingClientRect();
      const run = Math.max(1, rect.height - innerHeight);
      return Math.min(1, Math.max(0, -rect.top / run));
    };
    const render = (p: number) => {
      const d = ramp(p, DIVE);
      // The zoom runs in log space, so each step magnifies by the same factor, eased only at its two ends; the move
      // to centre leads it slightly.
      const e = d * d * (3 - 2 * d);
      const k = Math.exp(Math.log(geo.k) * e);
      const m = 1 - (1 - d) ** 3;
      dev.style.transform = `translate3d(${geo.tx * m}px, ${geo.ty * m}px, 0) scale(${k}) rotate(${-4 * (1 - m)}deg)`;
      // Then the showcase opens out of the screen: a clip from the enlarged screen's box to the whole stage.
      const o = ramp(p, OPEN);
      const g = 1 - (1 - o) ** 3;
      const [t, rr, b, l] = geo.inset;
      root.style.setProperty("--dive", d.toFixed(4));
      root.style.setProperty("--open", o.toFixed(4));
      root.style.setProperty(
        "--clip",
        `inset(${(t * (1 - g)).toFixed(1)}px ${(rr * (1 - g)).toFixed(1)}px ${(b * (1 - g)).toFixed(1)}px ${(l * (1 - g)).toFixed(1)}px round ${(14 * (1 - g)).toFixed(1)}px)`,
      );
      // The showcase exists only once it starts to open; whichever layer is showing takes the clicks.
      root.toggleAttribute("data-opening", o > 0);
      root.toggleAttribute("data-inside", o > 0.5);
      const i = Math.min(slides.length - 1, Math.floor(ramp(p, SHOW) * slides.length));
      if (i !== last) {
        last = i;
        setIndex(i);
      }
    };
    // The stage glides towards the scroll position each frame, so stepped wheel input still reads as one fluid move.
    const tick = () => {
      raf = 0;
      if (reduced.matches) return;
      const next = shown < 0 ? target : shown + (target - shown) * 0.2;
      shown = Math.abs(target - next) < 0.0004 ? target : next;
      render(shown);
      if (shown !== target) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      target = progress();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    const apply = () => {
      setStill(reduced.matches);
      if (reduced.matches) dev.style.transform = "none";
      else onResize();
    };
    apply();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    reduced.addEventListener("change", apply);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      reduced.removeEventListener("change", apply);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [slides.length]);

  // The arrows scroll the page to the middle of a family's stretch, so the scroll and the showcase never disagree.
  const goTo = (i: number) => {
    const to = (i + slides.length) % slides.length;
    const root = section.current;
    if (!root || still) return setIndex(to);
    const run = root.offsetHeight - innerHeight;
    const p = SHOW[0] + ((to + 0.5) / slides.length) * (SHOW[1] - SHOW[0]);
    scrollTo({ top: root.offsetTop + p * run, behavior: "smooth" });
  };

  const s = slides[index];
  if (!s) return null;
  return (
    <section ref={section} className="si" data-still={still || undefined} aria-labelledby="si-title">
      <div className="si-stage">
        <div className="si-hero">
          <p className="si-word" aria-hidden="true">
            AIMS
          </p>
          <p className="si-tag">Authorized ZKTeco distributor · UAE</p>
          <div className="si-badge" aria-hidden="true">
            <svg className="si-lanyard" viewBox="0 0 120 330" fill="none">
              <path d="M30 0C40 140 52 230 62 300M92 0C84 140 72 230 62 300" stroke="#e9f2ec" strokeWidth="9" />
              <rect x="50" y="292" width="24" height="30" rx="6" fill="#c9d1cd" />
            </svg>
            <div className="si-card">
              <Image src="/images/cutouts/id-card-thick.png" alt="" width={629} height={403} sizes="220px" />
              <p>
                AIMS<i>.</i>
                <small>Access · all areas</small>
              </p>
            </div>
          </div>
          <div className="si-copy">
            <h1 id="si-title">Access control and attendance for the UAE</h1>
            <p>ZKTeco terminals, gates and locks, supplied, installed and supported from Deira, Dubai and Abu Dhabi.</p>
            <div className="si-actions">
              <Link href="/products" className="si-pill">
                See all products <b aria-hidden="true">→</b>
              </Link>
              <Link href="/quote" className="si-link">
                Request a quote
              </Link>
            </div>
          </div>
          <p className="si-cue" aria-hidden="true">
            <span>↓</span>Scroll to step inside
          </p>
        </div>

        <div ref={device} className="si-device">
          <Image
            src="/images/cutouts/speedface-v5l.png"
            alt="ZKTeco SpeedFace-V5L terminal"
            width={362}
            height={776}
            sizes="(min-width: 1024px) 360px, 240px"
            priority
          />
          <div className="si-screen" aria-hidden="true">
            <svg viewBox="0 0 100 120" fill="none" strokeLinecap="round">
              <path className="si-brackets" d="M14 30V14h16M70 14h16v16M86 90v16H70M30 106H14V90" />
              <ellipse className="si-face" cx="50" cy="56" rx="20" ry="26" />
              <path className="si-scan" d="M18 30h64" />
              <path className="si-tick" d="M38 100l8 8 16-16" />
            </svg>
          </div>
        </div>

        <div className="si-inside" aria-label="Product families">
          <div className="si-glass">
            <p className="si-step" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </p>
            <div className="si-ticket" key={`t-${index}`}>
              <h2>{s.name}</h2>
              <div>
                <span>Shown</span>
                <span>{s.hero.model}</span>
              </div>
              {s.facts.map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div>
                <span>In range</span>
                <span>{s.count} models</span>
              </div>
            </div>
            <div className="si-product" key={`p-${index}`} style={{ "--ground": s.ground } as CSSProperties}>
              <Image src={s.hero.src} alt={s.hero.alt} width={s.hero.w} height={s.hero.h} sizes="50vw" />
            </div>
            <div className="si-desc" key={`d-${index}`}>
              <p>{s.line}</p>
              <Link href={s.href} className="si-pill">
                See {s.count} models <b aria-hidden="true">→</b>
              </Link>
            </div>
            <div className="si-arrows">
              <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous family">
                ←
              </button>
              <button type="button" onClick={() => goTo(index + 1)} aria-label="Next family">
                →
              </button>
            </div>
            <ol className="si-dots">
              {slides.map((f, i) => (
                <li key={f.slug}>
                  <button type="button" aria-current={i === index || undefined} onClick={() => goTo(i)}>
                    {f.word}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
