/*
 * The home dive's scroll maths (direction 2; CLAUDE.md → Design rules, Motion). One progress value p, 0 at the top of
 * the pinned section and 1 at its end, drives three phases: the terminal flies forward (DIVE), the screen opens to the
 * whole stage (OPEN), then the six families each take an equal stretch (SHOW). Plain functions, unit tested.
 */
export type Span = readonly [number, number];

export const DIVE: Span = [0.02, 0.14];
export const OPEN: Span = [0.14, 0.21];
export const SHOW: Span = [0.23, 0.97];

/** 0 before the span, 1 after it, linear in between. */
export const ramp = (p: number, [a, b]: Span) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Where the families stand: 0 at the start of SHOW, n at its end. */
const reel = (p: number, n: number) => ramp(p, SHOW) * n;

/** The family in front. */
export const activeIndex = (p: number, n: number) => Math.min(n - 1, Math.floor(reel(p, n)));

/**
 * A family's offset from the centre of its stretch: 0 when it is centred, −0.5 as it arrives, +0.5 as it leaves. The
 * first family is already whole when the screen opens and the last stays whole as the page carries on.
 */
export function slideOffset(p: number, n: number, i: number) {
  const x = reel(p, n) - (i + 0.5);
  if (i === 0 && x < 0) return 0;
  if (i === n - 1 && x > 0) return 0;
  return x;
}

/** Opacity from the offset: whole for the middle half of its stretch, gone at the edges. */
export const slideOpacity = (x: number) => Math.min(1, Math.max(0, 1 - (Math.abs(x) - 0.25) / 0.25));

/** The progress at the centre of family i's stretch: where the arrows, chips and soft snap take the scroll. */
export const familyProgress = (i: number, n: number) => SHOW[0] + ((i + 0.5) / n) * (SHOW[1] - SHOW[0]);

/**
 * Where a resting scroll settles, or null to leave it. Within the dive it finishes the move: on to the first family
 * once the terminal is past its halfway zoom, back to the hero before that. Among the families it settles on the
 * nearest one. Past the last family the page carries on freely.
 */
export function snapProgress(p: number, n: number): number | null {
  if (p <= 0 || p >= familyProgress(n - 1, n)) return null;
  if (p < familyProgress(0, n)) return ramp(p, DIVE) >= 0.5 ? familyProgress(0, n) : 0;
  const points = Array.from({ length: n }, (_, i) => familyProgress(i, n));
  let best = points[0];
  for (const point of points) if (Math.abs(point - p) < Math.abs(best - p)) best = point;
  return Math.abs(best - p) < 0.002 ? null : best;
}

/** The zoom eased only at its two ends, in log space, so each step magnifies by the same factor. */
export function zoom(d: number, k: number) {
  const e = d * d * (3 - 2 * d);
  return Math.exp(Math.log(k) * e);
}
