"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { REST_EVENT, restRequested } from "@/components/motion/gsap";
import type { FamilySlide } from "./familySlides";
import { FamilyControls } from "./FamilyControls";
import { FamilyStage } from "./FamilyStage";
import { useHeaderTone } from "./useHeaderTone";
import "./families.css";

export type SliderLabels = {
  label: string;
  titleLead: string;
  titleRest: string;
  titleAccent: string;
  tabs: string;
  shown: string;
  range: string;
  previous: string;
  next: string;
};

/**
 * The home hero, direction 3's family slider (CLAUDE.md → Design rules; MotionSites "Smoothie Slider"). Server
 * render and reduced motion: the six families stand as six full-screen floods, one after another, every one readable.
 * With motion, the scroll engine (stageMotion.ts, loaded lazily) pins the section and the scroll moves from family to
 * family; the tabs, the arrows and ← → jump the scroll to a family. Nothing runs on a timer.
 */
export function FamilySlider({ slides, labels }: { slides: FamilySlide[]; labels: SliderLabels }) {
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const jumpTo = useRef<(index: number) => void>(() => undefined);
  const [shown, setShown] = useState(0);
  // The family a tab, arrow or key is taking the scroll to: the next step counts from there, not from the family
  // passing by on the way. Cleared on arrival, or when the visitor takes the scroll back.
  const [aim, setAim] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  useHeaderTone(wrap);

  useEffect(() => {
    if (aim === null) return;
    const release = () => setAim(null);
    window.addEventListener("wheel", release, { passive: true, once: true });
    window.addEventListener("touchstart", release, { passive: true, once: true });
    return () => {
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
    };
  }, [aim]);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || restRequested()) return;
    let stop: (() => void) | undefined;
    let live = true;
    const rest = () => {
      stop?.();
      stop = undefined;
      setPinned(false);
    };
    document.addEventListener(REST_EVENT, rest);
    import("./stageMotion")
      .then(({ startStage }) => {
        if (!live || restRequested()) return;
        const stage = startStage(el, (index) => {
          setShown(index);
          setAim((current) => (current === index ? null : current));
        });
        jumpTo.current = stage.jump;
        stop = stage.stop;
        setPinned(true);
      })
      // Without the chunk the floods stay stacked, which is the readable fallback.
      .catch(() => undefined);
    return () => {
      live = false;
      document.removeEventListener(REST_EVENT, rest);
      stop?.();
    };
  }, []);

  const count = slides.length;
  const base = aim ?? shown;
  const go = (index: number) => {
    const k = (index + count) % count;
    setAim(k);
    jumpTo.current(k);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!pinned || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const forward = (e.key === "ArrowRight") !== rtl;
    e.preventDefault();
    go(base + (forward ? 1 : -1));
  };
  const current = slides[shown];

  return (
    <div ref={wrap} className="fam-wrap" data-tone="ground">
      {/* The pin's spacer, given to ScrollTrigger so it never moves the section: a moved node restarts its entrance. */}
      <div className="fam-pin">
        <section ref={root} className="fam" aria-label={labels.label} onKeyDown={onKey}>
          <div className="fam-slides">
            {slides.map((slide, i) => (
              <FamilyStage
                key={slide.slug}
                slide={slide}
                index={i}
                total={count}
                priority={i === 0}
                labels={{ shown: labels.shown, range: labels.range }}
              />
            ))}
          </div>

          <div className="fam-ui">
            <div className="fam-head">
              <h1 className="fam-title">
                {labels.titleLead}
                <br />
                {labels.titleRest} <em>{labels.titleAccent}</em>
              </h1>
              <div className="fam-ticks" aria-hidden="true">
                {slides.map((s, k) => (
                  <span key={s.slug} style={{ "--k": k } as CSSProperties} />
                ))}
              </div>
              {pinned && current && (
                <p className="fam-current" aria-hidden="true">
                  <span className="fam-count">
                    <b>{String(shown + 1).padStart(2, "0")}</b> / {String(count).padStart(2, "0")}
                  </span>
                  {current.name}
                </p>
              )}
            </div>
            {pinned && <FamilyControls slides={slides} shown={shown} base={base} labels={labels} onGo={go} />}
          </div>
        </section>
      </div>
    </div>
  );
}
