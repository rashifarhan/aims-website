"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { availableFrames, nearestLoaded, neighbourhood } from "@/lib/journey/frames";
import type { Timeline } from "@/lib/journey/scrollMap";
import { cardAmount, type Film, FilmContext, type FilmState, progress } from "./film";
import { FrameStore } from "./frameStore";

type Props = {
  timeline: Timeline;
  frameSrc: string; // "/journey/frames/" → /journey/frames/0001.webp
  filmAspect: number; // width / height of the rendered frames
  stops: number[]; // the checkpoints, in film frames: arrival, each product's held close-up, the skyline
  beats: { from: number; to: number }[]; // product beats: the scene dims while their cards are up
  children: ReactNode; // overlays, which follow the film through FilmContext
};

const pad = (n: number) => String(n).padStart(4, "0");
const SAMPLE_W = 32;
const SAMPLE_H = 20;
const QUIET_MS = 280; // a trackpad keeps firing for a moment after a flick: one gesture, one step
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Play time for a stretch of film: long journeys stay brisk, short hops never snap. */
const duration = (frames: number) => Math.min(2800, Math.max(1100, 800 + frames * 4.2));

/**
 * The film as a sequence of checkpoints (user decision, 26 Nov: "scroll is a trigger"). One wheel notch, swipe or
 * key press moves to the next product and the page plays the film there by itself; the film holds on each
 * product's close-up until the next gesture. After the last checkpoint the page scrolls normally. Frames load
 * coarse to fine and the nearest one on hand is always drawn, so nothing ever waits on a spinner.
 */
export function JourneyPlayer({ timeline, frameSrc, filmAspect, stops, beats, children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const available = useMemo(() => availableFrames(timeline.frames, timeline.step), [timeline]);
  const listeners = useRef(new Set<(s: FilmState) => void>());
  const goTo = useRef<(frame: number) => void>(() => {});
  const [stopIndex, setStopIndex] = useState(0);
  const [film] = useState<Film>(() => ({
    subscribe: (fn) => {
      listeners.current.add(fn);
      return () => listeners.current.delete(fn);
    },
    jump: (frame) => goTo.current(frame),
  }));

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const probe = document.createElement("canvas");
    probe.width = SAMPLE_W;
    probe.height = SAMPLE_H;
    const probeCtx = probe.getContext("2d", { willReadFrequently: true });
    if (!section || !canvas || !ctx || !probeCtx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pixels = new Uint8ClampedArray(SAMPLE_W * SAMPLE_H * 4);
    let current = stops[0] ?? 1;
    let index = 0;
    let shown = -1;
    let raf = 0;
    let playing = false;
    let lastGesture = 0;

    const state: FilmState = {
      frame: current,
      rect: { x: 0, y: 0, w: 0, h: 0 },
      stage: { w: 0, h: 0 },
      sample: (x, y, w, h) => {
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let j = Math.max(0, Math.floor(y * SAMPLE_H)); j < Math.min(SAMPLE_H, Math.ceil((y + h) * SAMPLE_H)); j++)
          for (let i = Math.max(0, Math.floor(x * SAMPLE_W)); i < Math.min(SAMPLE_W, Math.ceil((x + w) * SAMPLE_W)); i++) {
            const k = (j * SAMPLE_W + i) * 4;
            r += pixels[k] ?? 0;
            g += pixels[k + 1] ?? 0;
            b += pixels[k + 2] ?? 0;
            n++;
          }
        return n ? [r / n, g / n, b / n] : [20, 24, 30];
      },
    };
    const notify = () => {
      state.frame = current;
      const dim = Math.max(0, ...beats.map((b) => cardAmount(progress(current, b.from, b.to)))) * 0.18;
      canvas.style.filter = dim > 0.005 ? `brightness(${1 - dim})` : "";
      for (const fn of listeners.current) fn(state);
    };
    const draw = () => {
      const want = nearestLoaded(available, store.has, Math.round(current));
      if (want === null) return;
      const bitmap = store.bitmap(want);
      if (!bitmap || want === shown) return; // keep the last good frame until this one decodes
      const { x, y, w, h } = state.rect;
      const dpr = canvas.width / Math.max(state.stage.w, 1);
      ctx.drawImage(bitmap, x * dpr, y * dpr, w * dpr, h * dpr);
      probeCtx.drawImage(bitmap, 0, 0, SAMPLE_W, SAMPLE_H);
      pixels = probeCtx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;
      shown = want;
    };
    const store = new FrameStore((f) => `${frameSrc}${pad(f)}.webp`, available, (f) => {
      if (Math.abs(f - current) <= timeline.step * 8 || shown < 0) {
        shown = -1;
        draw();
        notify();
      }
    });

    /** Play the film from where it is to `target`, by itself, eased; then hold. */
    const playTo = (target: number) => {
      cancelAnimationFrame(raf);
      const from = current;
      const span = Math.abs(target - from);
      // Fetch the stretch ahead first: every few frames along the way, then the destination's neighbourhood.
      const path: number[] = [];
      for (let k = 1; k <= 24; k++) path.push(from + ((target - from) * k) / 24);
      store.focus([...neighbourhood(available, target, 10), ...path.flatMap((f) => neighbourhood(available, f, 1))]);
      if (reduced || span < 1) {
        current = target;
        draw();
        notify();
        return;
      }
      playing = true;
      const total = duration(span);
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / total);
        current = from + (target - from) * ease(t);
        draw();
        notify();
        if (t < 1) raf = requestAnimationFrame(tick);
        else playing = false;
      };
      raf = requestAnimationFrame(tick);
    };
    const step = (dir: 1 | -1) => {
      const next = Math.min(Math.max(index + dir, 0), stops.length - 1);
      if (next === index) return false;
      index = next;
      setStopIndex(next);
      playTo(stops[next] ?? current);
      return true;
    };
    goTo.current = (frame: number) => {
      let best = 0;
      stops.forEach((s, i) => {
        if (Math.abs(s - frame) < Math.abs((stops[best] ?? 0) - frame)) best = i;
      });
      window.scrollTo({ top: section.offsetTop });
      index = best;
      setStopIndex(best);
      playTo(stops[best] ?? frame);
    };

    /** The film has the gestures while it fills the screen, except scrolling on past the last checkpoint. */
    const filmOwns = (dir: 1 | -1) => {
      const top = section.getBoundingClientRect().top;
      if (Math.abs(top) > 2) return false;
      return !(dir === 1 && index === stops.length - 1);
    };
    const gesture = (dir: 1 | -1, e: Event) => {
      if (!filmOwns(dir)) return;
      e.preventDefault();
      const now = performance.now();
      const quiet = now - lastGesture > QUIET_MS;
      lastGesture = now;
      if (playing || !quiet) return;
      step(dir);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 2) return;
      gesture(e.deltaY > 0 ? 1 : -1, e);
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (touchY === null || y === undefined) return;
      const dy = touchY - y;
      if (Math.abs(dy) < 8) return;
      const dir = dy > 0 ? 1 : -1;
      if (!filmOwns(dir)) return;
      e.preventDefault();
      if (Math.abs(dy) > 40 && !playing) {
        touchY = null;
        step(dir);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) return;
      const dir = ["ArrowDown", "PageDown", " "].includes(e.key) ? 1 : ["ArrowUp", "PageUp"].includes(e.key) ? -1 : 0;
      if (!dir || (e.key === " " && el?.tagName === "BUTTON")) return;
      if (!filmOwns(dir)) return;
      e.preventDefault();
      if (!playing) step(dir);
    };
    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const fw = Math.max(w, h * filmAspect); // cover
      const fh = fw / filmAspect;
      state.stage = { w, h };
      state.rect = { x: (w - fw) / 2, y: (h - fh) / 2, w: fw, h: fh };
      shown = -1;
      draw();
      notify();
    };

    store.start();
    store.focus(stops.flatMap((s) => neighbourhood(available, s, 3))); // every checkpoint sharp first
    onResize();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      store.stop();
    };
  }, [available, beats, film, filmAspect, frameSrc, stops, timeline.step]);

  return (
    <FilmContext.Provider value={film}>
      <section ref={sectionRef} className="journey" data-stop={stopIndex} data-last={stopIndex === stops.length - 1}>
        <div className="journey-stage">
          <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
          {children}
          <div className="journey-grain" aria-hidden="true" />
          <p className="journey-count" aria-live="polite">
            {stopIndex === 0 ? "Scroll to walk in" : `${stopIndex} / ${stops.length - 1}`}
          </p>
        </div>
      </section>
    </FilmContext.Provider>
  );
}
