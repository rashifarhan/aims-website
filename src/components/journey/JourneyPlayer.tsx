"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { availableFrames, nearestLoaded, neighbourhood } from "@/lib/journey/frames";
import { buildSegments, frameAt, progressAt, type Timeline, totalScreens } from "@/lib/journey/scrollMap";
import { FrameStore } from "./frameStore";

export type JourneySlide = { key: string; from: number; to: number; node: ReactNode };
export type JourneyChapter = { key: string; label: string; frame: number };

type Props = {
  timeline: Timeline;
  slides: JourneySlide[];
  chapters: JourneyChapter[];
  frameSrc: string; // e.g. "/journey/frames/" → /journey/frames/0001.webp
  indexLabel: string;
};

const pad = (n: number) => String(n).padStart(4, "0");

/** Draw `img` to cover the canvas, as CSS object-fit: cover would. */
function drawCover(ctx: CanvasRenderingContext2D, img: ImageBitmap, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/**
 * The scroll film. Scroll position is the only clock (3D plan, responsiveness rules): native scroll picks the
 * frame through the scroll map, a ~80 ms ease smooths it, nothing autoplays, and the nearest frame on hand is
 * always drawn while sharper ones load. Under reduced motion the film rests on each slide's middle frame.
 */
export function JourneyPlayer({ timeline, slides, chapters, frameSrc, indexLabel }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segments = useMemo(() => buildSegments(timeline), [timeline]);
  const available = useMemo(() => availableFrames(timeline.frames, timeline.step), [timeline]);
  const [activeKey, setActiveKey] = useState<string | null>(slides[0]?.key ?? null);
  const [chapterKey, setChapterKey] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 1;
    let current = 1;
    let shown = -1;
    let raf = 0;
    let last = 0;

    const draw = () => {
      const want = nearestLoaded(available, store.has, Math.round(current));
      if (want === null) return;
      const bitmap = store.bitmap(want);
      if (!bitmap || want === shown) return; // keep the last good frame until this one decodes
      drawCover(ctx, bitmap, canvas.width, canvas.height);
      shown = want;
    };
    const store = new FrameStore((f) => `${frameSrc}${pad(f)}.webp`, available, (f) => {
      if (Math.abs(f - current) <= timeline.step * 8 || shown < 0) {
        shown = -1;
        draw();
      }
    });

    const tick = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      current += (target - current) * (1 - Math.exp(-dt / 80));
      if (Math.abs(target - current) < 0.05) current = target;
      draw();
      raf = current === target ? 0 : requestAnimationFrame(tick);
      if (!raf) last = 0;
    };

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const progress = span > 0 ? -rect.top / span : 0;
      const frame = frameAt(segments, progress);
      const slide = slides.find((s) => frame >= s.from && frame <= s.to);
      setActiveKey(slide?.key ?? null);
      const chapter = [...chapters].reverse().find((c) => frame >= c.frame);
      setChapterKey(chapter?.key ?? null);
      target = reduced && slide ? Math.round((slide.from + slide.to) / 2) : frame;
      if (reduced) current = target;
      store.focus(neighbourhood(available, target, 12));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      shown = -1;
      draw();
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
  }, [available, chapters, frameSrc, segments, slides, timeline.step]);

  const jump = (frame: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const span = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + progressAt(segments, frame) * span + 1 });
  };

  const screens = totalScreens(segments) + 1; // + the sticky stage's own screen
  return (
    <section ref={sectionRef} className="journey" style={{ height: `${screens * 100}svh` }}>
      <div className="journey-stage">
        <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
        {slides.map((s) => (
          <div key={s.key} className="journey-slide" data-active={s.key === activeKey}>
            {s.node}
          </div>
        ))}
        <nav className="journey-index" aria-label={indexLabel}>
          {chapters.map((c) => (
            <button key={c.key} type="button" aria-current={c.key === chapterKey ? "step" : undefined} onClick={() => jump(c.frame)}>
              {c.label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
