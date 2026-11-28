/**
 * The family slider's scroll maths (CLAUDE.md → Design rules → Motion), kept pure so it can be tested and so the
 * client leaf only writes styles. Each family owns one unit of scroll: a short rest (REST of the unit) and then the
 * change to the next family. The last family keeps a rest of its own before the page carries on. Tuned for response
 * (owner, 28 Nov 2026, after a measured review): the change starts almost at once and follows the scroll evenly.
 */
export const REST = 0.06;

/** How far into a change (0–1) a scroll must get before it settles forward rather than back (owner, 28 Nov 2026). */
export const COMMIT = 0.08;

/** How far each layer of the arriving family travels, as a share of the frame width (MotionSites "Smoothie
 * Slider"): the deeper the layer, the further it comes from, so the pieces overtake the word. */
export const LAYER_TRAVEL = { word: 0.4, shadow: 0.3, hero: 0.15, bits: 0.55, corner: 0.75 } as const;
export type StageLayer = keyof typeof LAYER_TRAVEL;

/** The leaving family drifts away by this share of the frame width while it is covered. */
export const LEAVE_DRIFT = 0.14;

/** Scroll units for `count` families: one per change plus the last family's rest. */
export const stageUnits = (count: number) => Math.max(0, count - 1) + REST;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Scroll progress through the pin (0–1) → stage position (0 … count − 1), holding still during each rest. */
export function stagePosition(progress: number, count: number): number {
  const units = clamp01(progress) * stageUnits(count);
  const k = Math.min(count - 1, Math.floor(units));
  if (k >= count - 1) return count - 1;
  const local = units - k;
  return local < REST ? k : k + (local - REST) / (1 - REST);
}

/** Where the scroll settles: the start of each family's rest, as a progress through the pin, then the pin's end. */
export function stageSnapPoints(count: number): number[] {
  const units = stageUnits(count);
  return [...Array.from({ length: count }, (_, k) => k / units), 1];
}

/**
 * Where the scroll settles once it stops inside the pinned stage. Inside a change it goes the way the visitor was
 * scrolling once they are COMMIT of the way in, and back otherwise (`direction` 0, for keyboard or scrollbar, takes
 * the nearer side); during a rest it returns to that family. Outside the stage, and in the last family's rest before
 * the page carries on, `null`: the page scrolls freely there.
 */
export function settleTarget(y: number, start: number, end: number, count: number, direction: -1 | 0 | 1 = 0) {
  if (y < start || y > end || end <= start) return null;
  const points = stageSnapPoints(count).map((p) => start + p * (end - start));
  const k = points.findIndex((p, i) => i < count - 1 && y >= p && y < (points[i + 1] ?? end));
  const from = points[k];
  const to = points[k + 1];
  if (from === undefined || to === undefined) return null;
  const change = ((y - from) / (to - from) - REST) / (1 - REST);
  if (change <= 0) return from;
  const forward = direction > 0 ? change >= COMMIT : direction < 0 ? change > 1 - COMMIT : change >= 0.5;
  return forward ? to : from;
}

/** The family nearest to a stage position, the one the tabs and the counter name. */
export const shownFamily = (position: number, count: number) => Math.min(count - 1, Math.max(0, Math.round(position)));

/**
 * How much of the leaving family is covered (0–1) at a point in the change. Nearly even, with a little ease at both
 * ends, so every bit of scroll shows about the same amount of change and the wipe follows the hand. (The reference's
 * measured curve was a timed animation; tied to the scroll it made a dead start and a jump, owner review 28 Nov 2026.)
 */
export function cover(t: number): number {
  const x = clamp01(t);
  return 0.75 * x + 0.25 * x * x * (3 - 2 * x);
}

/** How far the arriving family has landed (0–1): it starts moving just after the wipe does and eases out, so it
 * lands as the change ends. */
export function arrival(t: number): number {
  const k = clamp01((t - 0.1) / 0.9);
  return 1 - (1 - k) ** 3;
}
