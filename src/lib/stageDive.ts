/*
 * The page stages' scroll maths (direction 2; CLAUDE.md → Design rules, Motion: every main page has one dive). One
 * progress value p, 0 at the top of the pinned section and 1 at its end: the product flies forward until its screen
 * fills the stage (DIVE), the screen opens to the whole stage (OPEN), then the inside holds while the page carries on.
 * The home dive has its own maths (dive.ts), because its inside is a reel of six families.
 */
import { ramp, type Span } from "./dive";

export const STAGE_DIVE: Span = [0.03, 0.5];
export const STAGE_OPEN: Span = [0.5, 0.72];

/** Where a resting scroll settles inside the dive, or null to leave it: never stopped halfway into a screen. */
export function stageSnap(p: number): number | null {
  if (p <= 0 || p >= STAGE_OPEN[1]) return null;
  return ramp(p, STAGE_DIVE) >= 0.5 ? STAGE_OPEN[1] : 0;
}

/** A screen's box inside its photograph, as fractions of the cut-out. */
export type Aperture = { x: number; y: number; w: number; h: number };

/**
 * The scale at which the screen fills the stage (94% of its height, or of its width for a wide screen) and the inset
 * the opening starts from: the enlarged screen's box inside the stage.
 */
export function apertureFit(screenW: number, screenH: number, stageW: number, stageH: number) {
  const k = Math.min((stageH * 0.94) / screenH, (stageW * 0.96) / screenW);
  const insetX = Math.max(0, (stageW - screenW * k) / 2);
  const insetY = Math.max(0, (stageH - screenH * k) / 2);
  return { k, inset: [insetY, insetX, insetY, insetX] as const };
}
