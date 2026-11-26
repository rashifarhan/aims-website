"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { AnchorPoint } from "./beatData";

export type Rect = { x: number; y: number; w: number; h: number };
export type FilmState = {
  frame: number; // the frame on screen now (fractional while easing)
  rect: Rect; // where the film's picture sits in the stage (CSS px; it covers, so it may overflow)
  stage: { w: number; h: number };
  /** Average colour (0..255) of a region of the current picture, in film fractions: the light behind a card. */
  sample: (x: number, y: number, w: number, h: number) => [number, number, number];
  stop: number; // the checkpoint the film is at, or heading to
  settled: boolean; // true once the film has arrived and holds there
};
export type Film = { subscribe: (fn: (s: FilmState) => void) => () => void; jump: (frame: number) => void };

export const FilmContext = createContext<Film | null>(null);

/** Run `fn` on every film update. Overlays move themselves from here, imperatively, without re-rendering. */
export function useFilm(fn: (s: FilmState) => void) {
  const film = useContext(FilmContext);
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });
  useEffect(() => film?.subscribe((s) => latest.current(s)), [film]);
  return film;
}

export const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
export function smooth(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Progress through a frame range: 0 at its first frame, 1 at its last (unclamped). */
export const progress = (frame: number, from: number, to: number) => (frame - from) / Math.max(to - from, 1);

/** The product's position on the film at a frame, linearly between exported samples. */
export function anchorAt(track: AnchorPoint[], frame: number): { x: number; y: number; visible: boolean } | null {
  if (!track.length) return null;
  const first = track[0];
  const last = track[track.length - 1];
  if (!first || !last || frame <= first[0]) return first ? { x: first[1], y: first[2], visible: first[3] === 1 } : null;
  if (frame >= last[0]) return { x: last[1], y: last[2], visible: last[3] === 1 };
  for (let i = 1; i < track.length; i++) {
    const b = track[i];
    const a = track[i - 1];
    if (a && b && frame <= b[0]) {
      const t = (frame - a[0]) / Math.max(b[0] - a[0], 1);
      return { x: a[1] + (b[1] - a[1]) * t, y: a[2] + (b[2] - a[2]) * t, visible: a[3] === 1 && b[3] === 1 };
    }
  }
  return null;
}
