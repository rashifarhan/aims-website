"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { availableFrames, nearestLoaded, neighbourhood } from "@/lib/journey/frames";
import { buildSegments, frameAt, progressAt, type Timeline, totalScreens } from "@/lib/journey/scrollMap";
import { cardAmount, type Film, FilmContext, type FilmState, progress } from "./film";
import { FrameStore } from "./frameStore";

type Props = {
  timeline: Timeline;
  frameSrc: string; // "/journey/frames/" → /journey/frames/0001.webp
  filmAspect: number; // width / height of the rendered frames
  beats: { from: number; to: number }[]; // product beats: the scene dims while their cards are up
  children: ReactNode; // overlays, which follow the film through FilmContext
};

const pad = (n: number) => String(n).padStart(4, "0");
const SAMPLE_W = 32;
const SAMPLE_H = 20;

/**
 * The scroll film. Scroll position is the only clock (3D plan, responsiveness rules): native scroll picks the frame
 * through the scroll map, an ~80 ms ease smooths it, nothing autoplays, and the nearest frame on hand is always
 * drawn while sharper ones load. Overlays subscribe to the film and move themselves.
 */
export function JourneyPlayer({ timeline, frameSrc, filmAspect, beats, children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segments = useMemo(() => buildSegments(timeline, 1.6), [timeline]);
  const available = useMemo(() => availableFrames(timeline.frames, timeline.step), [timeline]);
  const listeners = useRef(new Set<(s: FilmState) => void>());
  const jumpTo = useRef<(frame: number) => void>(() => {});
  const [film] = useState<Film>(() => ({
    subscribe: (fn) => {
      listeners.current.add(fn);
      return () => listeners.current.delete(fn);
    },
    jump: (frame) => jumpTo.current(frame),
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
    let target = 1;
    let current = 1;
    let shown = -1;
    let raf = 0;
    let last = 0;

    const state: FilmState = {
      frame: 1,
      rect: { x: 0, y: 0, w: 0, h: 0 },
      stage: { w: 0, h: 0 },
      sample: (x, y, w, h) => {
        let r = 0, g = 0, b = 0, n = 0;
        for (let j = Math.floor(y * SAMPLE_H); j < Math.min(SAMPLE_H, Math.ceil((y + h) * SAMPLE_H)); j++)
          for (let i = Math.floor(x * SAMPLE_W); i < Math.min(SAMPLE_W, Math.ceil((x + w) * SAMPLE_W)); i++) {
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

    const tick = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      current += (target - current) * (1 - Math.exp(-dt / 80));
      if (Math.abs(target - current) < 0.05) current = target;
      draw();
      notify();
      raf = current === target ? 0 : requestAnimationFrame(tick);
      if (!raf) last = 0;
    };
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const frame = frameAt(segments, span > 0 ? -rect.top / span : 0);
      const beat = beats.find((b) => frame >= b.from && frame <= b.to);
      target = reduced && beat ? Math.round(beat.from + (beat.to - beat.from) * 0.6) : frame;
      if (reduced) current = target;
      store.focus(neighbourhood(available, target, 12));
      if (!raf) raf = requestAnimationFrame(tick);
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
    jumpTo.current = (frame: number) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const span = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + progressAt(segments, frame) * span + 1 });
    };

    store.start();
    onResize();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      store.stop();
    };
  }, [available, beats, film, filmAspect, frameSrc, segments, timeline.step]);

  return (
    <FilmContext.Provider value={film}>
      <section ref={sectionRef} className="journey" style={{ height: `${(totalScreens(segments) + 1) * 100}svh` }}>
        <div className="journey-stage">
          <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
          {children}
          <div className="journey-grain" aria-hidden="true" />
        </div>
      </section>
    </FilmContext.Provider>
  );
}
