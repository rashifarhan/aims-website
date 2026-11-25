"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./hero3d.css";

// Three.js and the scene load only after the page has painted, in their own chunk.
const Scene = lazy(() => import("./Scene"));

/**
 * The 3D hero stage (client choice, 25 Nov 2026): a live Three.js loop of a site AIMS equips, ending close on a
 * face terminal opening into its layers. It mounts after hydration, plays only while on screen, holds one still
 * for visitors who prefer reduced motion, and keeps a keyboard-reachable pause for the loop.
 */
export function Hero3DStage({
  label,
  pauseLabel,
  playLabel,
}: {
  label: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  // Review aid: ?hero3d-t=10.8 freezes the loop at that second (for screenshots and sign-off).
  const [at, setAt] = useState<number | undefined>(undefined);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const pinned = Number.parseFloat(new URLSearchParams(location.search).get("hero3d-t") ?? "");
    const sync = () => setStill(reduce.matches || Number.isFinite(pinned));
    reduce.addEventListener("change", sync);
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry?.isIntersecting ?? true));
    if (root.current) observer.observe(root.current);
    // Give the page its first paint before the 3D chunk starts downloading.
    // Everything the scene needs to know is settled in the same deferred step that mounts it.
    const start = () => {
      if (Number.isFinite(pinned)) setAt(pinned);
      sync();
      setReady(true);
    };
    const idle = window.requestIdleCallback?.(start) ?? window.setTimeout(start, 200);
    return () => {
      reduce.removeEventListener("change", sync);
      observer.disconnect();
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return (
    <div ref={root} className="hero3d" role="img" aria-label={label} data-ready={ready || undefined}>
      {ready && (
        <Suspense fallback={null}>
          <Scene playing={onScreen && !paused} still={still} at={at} />
        </Suspense>
      )}
      {!still && (
        <button type="button" className="hero3d-pause" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          {paused ? playLabel : pauseLabel}
        </button>
      )}
    </div>
  );
}
