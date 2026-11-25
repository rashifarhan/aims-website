"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HeroScene } from "./scene";
import { phases } from "./scene";
import "./hero-scroll.css";

/**
 * The scroll hero (client request, 25 Nov 2026: high-end, fast, scroll-driven 3D). A full-screen night stage pins
 * while the page scrolls through it: a face of glowing points tightens, a lime scan sweeps it, a "Verified" ring
 * blooms, and the face bursts into light as the page moves on. The copy and dark stage paint with the page; the
 * WebGL scene starts at once (no idle wait) and gathers within a second. Reduced motion: one verified still, no pin.
 */
export function HeroScroll({
  children,
  steps,
  label,
}: {
  children: ReactNode;
  steps: [string, string, string];
  label: string;
}) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const root = section.current;
    const el = canvas.current;
    if (!root || !el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.toggleAttribute("data-still", still);
    let scene: HeroScene | undefined;
    let alive = true;
    const colors = (() => {
      const css = getComputedStyle(document.documentElement);
      const v = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
      return {
        base: v("--color-green-700", "#26703a"),
        lime: v("--color-lime", "#78be20"),
      };
    })();
    const count = matchMedia("(max-width: 767px)").matches ? 9000 : 20000;
    void import("./scene").then(({ createHeroScene }) => {
      if (!alive) return;
      scene = createHeroScene(el, { count, still, colors });
      root.setAttribute("data-live", "");
      update();
    });
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const run = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / run));
      root.style.setProperty("--p", p.toFixed(4));
      scene?.setProgress(p);
      const ph = phases(p);
      setStep(ph.out > 0.15 ? 2 : ph.verify > 0.4 ? 1 : ph.scanOn > 0.4 ? 0 : -1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onPointer = (e: PointerEvent) =>
      scene?.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    if (!still) {
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("pointermove", onPointer, { passive: true });
    }
    addEventListener("resize", onScroll);
    return () => {
      alive = false;
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointer);
      removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      scene?.dispose();
    };
  }, []);

  return (
    <section ref={section} className="hero-scroll section-night" aria-labelledby="home-title">
      <div className="hero-scroll-stage">
        <canvas ref={canvas} className="hero-scroll-canvas" role="img" aria-label={label} />
        <div className="hero-scroll-copy wrap">{children}</div>
        <ol className="hero-scroll-steps wrap" aria-hidden="true">
          {steps.map((text, i) => (
            <li key={text} data-on={step === i || undefined}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {text}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
