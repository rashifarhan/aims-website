"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { availableFrames, nearestLoaded, neighbourhood } from "@/lib/journey/frames";
import type { Timeline } from "@/lib/journey/scrollMap";
import { type Film, FilmContext, type FilmState } from "./film";
import { FrameStore } from "./frameStore";

type Props = {
  timeline: Timeline;
  frameSrc: string; // "/journey/frames/" → /journey/frames/0001.webp
  filmAspect: number; // width / height of the rendered frames
  stops: number[]; // the checkpoints, in film frames: arrival, then each product's held close-up
  pace: { frames: number[]; travel: number[] }; // the camera's cumulative travel per frame (journey.pace)
  focus: [number, number][]; // per checkpoint, where its product sits on the film (fractions): phones keep it in view
  children: ReactNode; // overlays, which follow the film through FilmContext
};

const pad = (n: number) => String(n).padStart(4, "0");
const SAMPLE_W = 32;
const SAMPLE_H = 20;
const QUIET_MS = 280; // a trackpad keeps firing for a moment after a flick: one gesture, one step
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Play time for a move, from how far the camera travels: long glides stay brisk, short hops never snap. */
const duration = (travel: number) => Math.min(2600, 1200 + 230 * Math.sqrt(travel));
const NARROW = 768; // below this the card is a sheet at the foot (BeatCard, journey.css 47.99rem)
const PHONE_ZOOM = 1.15; // room to slide the wide film so the product clears the sheet
const PHONE_SPOT: [number, number] = [0.5, 0.3]; // where a phone shows the product: centred, upper third

/** Linear lookup in a monotonic table: x → y. */
function lookup(xs: number[], ys: number[], x: number): number {
  if (!xs.length) return x;
  let lo = 0;
  let hi = xs.length - 1;
  if (x <= (xs[0] ?? 0)) return ys[0] ?? x;
  if (x >= (xs[hi] ?? 0)) return ys[hi] ?? x;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((xs[mid] ?? 0) <= x) lo = mid;
    else hi = mid;
  }
  const x0 = xs[lo] ?? 0;
  const x1 = xs[hi] ?? 1;
  const t = x1 > x0 ? (x - x0) / (x1 - x0) : 0;
  return (ys[lo] ?? 0) + ((ys[hi] ?? 0) - (ys[lo] ?? 0)) * t;
}

/**
 * The film as a sequence of checkpoints (user decision, 26 Nov: "scroll is a trigger"). One wheel notch, swipe or
 * key press moves to the next product and the page plays the film there by itself; the film holds on each
 * product's close-up until the next gesture. After the last checkpoint the page scrolls normally. Frames load
 * coarse to fine and the nearest one on hand is always drawn, so nothing ever waits on a spinner.
 */
export function JourneyPlayer({ timeline, frameSrc, filmAspect, stops, pace, focus, children }: Props) {
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
      stop: 0,
      settled: true,
      sample: (x, y, w, h) => {
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let j = Math.max(0, Math.floor(y * SAMPLE_H)); j < Math.min(SAMPLE_H, Math.ceil((y + h) * SAMPLE_H)); j++)
          for (
            let i = Math.max(0, Math.floor(x * SAMPLE_W));
            i < Math.min(SAMPLE_W, Math.ceil((x + w) * SAMPLE_W));
            i++
          ) {
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
      for (const fn of listeners.current) fn(state);
    };
    const settle = (settled: boolean) => {
      state.settled = settled;
    };
    /** While holding, fetch the way to the neighbouring checkpoints, so the next move plays sharp. */
    const prefetch = () => {
      const around = [stops[index - 1], stops[index + 1]].filter((f): f is number => f !== undefined);
      const path = around.flatMap((t) =>
        Array.from({ length: 16 }, (_, k) => current + ((t - current) * (k + 1)) / 16),
      );
      store.focus(path.flatMap((f) => neighbourhood(available, f, 1)));
    };
    let size = { w: 0, h: 0 };
    let shownAt = { x: 0, y: 0 };
    const stopTravel = stops.map((f) => lookup(pace.frames, pace.travel, f));
    /**
     * Where the picture sits. On wide screens it covers the stage, centred: every close-up already frames its product
     * on the left third. A phone sees only a slice of the wide film, so there the picture slides, along the camera's
     * travel, from one product to the next, keeping each where the sheet doesn't cover it.
     */
    const place = () => {
      const { w, h } = state.stage;
      if (w >= NARROW) {
        state.rect = { x: (w - size.w) / 2, y: (h - size.h) / 2, w: size.w, h: size.h };
        return;
      }
      const s = lookup(pace.frames, pace.travel, current);
      const fx = lookup(
        stopTravel,
        focus.map((f) => f[0]),
        s,
      );
      const fy = lookup(
        stopTravel,
        focus.map((f) => f[1]),
        s,
      );
      const clampTo = (v: number, lo: number) => Math.min(0, Math.max(lo, v));
      state.rect = {
        x: clampTo(w * PHONE_SPOT[0] - fx * size.w, w - size.w),
        y: clampTo(h * PHONE_SPOT[1] - fy * size.h, h - size.h),
        w: size.w,
        h: size.h,
      };
    };
    const draw = () => {
      place();
      const want = nearestLoaded(available, store.has, Math.round(current));
      if (want === null) return;
      const bitmap = store.bitmap(want);
      const { x, y, w, h } = state.rect;
      // Keep the last good frame until this one decodes; redraw the same frame only if the picture slid (phones).
      if (!bitmap || (want === shown && x === shownAt.x && y === shownAt.y)) return;
      const dpr = canvas.width / Math.max(state.stage.w, 1);
      ctx.drawImage(bitmap, x * dpr, y * dpr, w * dpr, h * dpr);
      probeCtx.drawImage(bitmap, 0, 0, SAMPLE_W, SAMPLE_H);
      pixels = probeCtx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;
      shown = want;
      shownAt = { x, y };
    };
    const store = new FrameStore(
      (f) => `${frameSrc}${pad(f)}.webp`,
      available,
      (f) => {
        if (Math.abs(f - current) <= timeline.step * 8 || shown < 0) {
          shown = -1;
          draw();
          notify();
        }
      },
    );

    /**
     * Play the film from where it is to `target`, by itself. It moves along the camera's travel, not its frame
     * numbers, so the camera glides at an even speed and the only ease is the one at each end of the move.
     */
    const playTo = (target: number) => {
      cancelAnimationFrame(raf);
      const from = current;
      const s0 = lookup(pace.frames, pace.travel, from);
      const s1 = lookup(pace.frames, pace.travel, target);
      const path: number[] = [];
      for (let k = 1; k <= 24; k++) path.push(from + ((target - from) * k) / 24);
      store.focus([...neighbourhood(available, target, 10), ...path.flatMap((f) => neighbourhood(available, f, 1))]);
      settle(false);
      if (reduced || Math.abs(target - from) < 1) {
        current = target;
        draw();
        settle(true);
        notify();
        return;
      }
      playing = true;
      const total = duration(Math.abs(s1 - s0));
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / total);
        current = t < 1 ? lookup(pace.travel, pace.frames, s0 + (s1 - s0) * ease(t)) : target;
        draw();
        if (t >= 1) {
          playing = false;
          settle(true);
          prefetch();
        }
        notify();
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const step = (dir: 1 | -1) => {
      const next = Math.min(Math.max(index + dir, 0), stops.length - 1);
      if (next === index) return false;
      index = next;
      state.stop = next;
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
      state.stop = best;
      setStopIndex(best);
      playTo(stops[best] ?? frame);
    };

    // While the visitor is in the film, the page itself does not scroll: every wheel event, however small (a
    // trackpad starts with tiny ones), is a gesture for the film. One more step past the last checkpoint releases
    // the page and glides into "Your system"; scrolling back to the top locks it again.
    const root = document.documentElement;
    let locked = false;
    let releasing = 0;
    const lock = () => {
      if (locked) return;
      locked = true;
      root.style.overflow = "hidden";
    };
    const unlock = () => {
      if (!locked) return;
      locked = false;
      root.style.overflow = "";
      releasing = performance.now();
    };
    const release = () => {
      unlock();
      window.scrollTo({ top: section.offsetTop + section.offsetHeight, behavior: reduced ? "auto" : "smooth" });
    };
    const onScroll = () => {
      if (!locked && performance.now() - releasing > 900 && window.scrollY <= section.offsetTop + 1) lock();
    };
    const gesture = (dir: 1 | -1, e: Event) => {
      if (!locked) return;
      e.preventDefault();
      const now = performance.now();
      const quiet = now - lastGesture > QUIET_MS;
      lastGesture = now;
      if (playing || !quiet) return;
      if (dir === 1 && index === stops.length - 1) release();
      else step(dir);
    };
    const onWheel = (e: WheelEvent) => {
      if (!locked) return;
      if (Math.abs(e.deltaY) < 3) {
        e.preventDefault(); // too small to say which way, but still not the page's to scroll
        return;
      }
      gesture(e.deltaY > 0 ? 1 : -1, e);
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!locked) return;
      e.preventDefault();
      const y = e.touches[0]?.clientY;
      if (touchY === null || y === undefined || Math.abs(touchY - y) < 40 || playing) return;
      const dir = touchY - y > 0 ? 1 : -1;
      touchY = null;
      if (dir === 1 && index === stops.length - 1) release();
      else step(dir);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!locked) return;
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) return;
      const dir = ["ArrowDown", "PageDown", " "].includes(e.key) ? 1 : ["ArrowUp", "PageUp"].includes(e.key) ? -1 : 0;
      if (!dir || (e.key === " " && el?.tagName === "BUTTON")) return;
      e.preventDefault();
      if (playing) return;
      if (dir === 1 && index === stops.length - 1) release();
      else step(dir);
    };
    // Links to the content below ("See the whole system", "Skip the tour") and keyboard focus moving there
    // release the page, so nothing below the film is ever out of reach.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (a && !section.contains(document.querySelector(a.getAttribute("href") ?? "#none"))) unlock();
    };
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Node && !section.contains(e.target) && !(e.target as Element).closest?.(".jh")) unlock();
    };
    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const fw = Math.max(w, h * filmAspect) * (w < NARROW ? PHONE_ZOOM : 1); // cover
      size = { w: fw, h: fw / filmAspect };
      state.stage = { w, h };
      shown = -1;
      draw();
      notify();
    };

    store.start();
    store.focus(stops.flatMap((s) => neighbourhood(available, s, 3))); // every checkpoint sharp first
    onResize();
    if (window.scrollY <= section.offsetTop + 1) lock();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    document.addEventListener("focusin", onFocus);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      store.stop();
    };
  }, [available, film, filmAspect, focus, frameSrc, pace, stops, timeline.step]);

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
