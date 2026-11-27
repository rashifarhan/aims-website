/**
 * The family slider's scroll maths (CLAUDE.md → Design rules → Motion), kept pure so it can be tested and so the
 * client leaf only writes styles. Each family owns one unit of scroll: a rest (REST of the unit) and then the change
 * to the next family. The last family keeps a rest of its own before the page carries on.
 */
export const REST = 0.3;

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
 * Where the scroll settles once it stops inside the pinned stage: the rest (or the pin's end) nearest to `y`, the
 * place a flick is heading for. Outside the stage, `null`: the page scrolls freely there.
 */
export function settleTarget(y: number, start: number, end: number, count: number): number | null {
  if (y < start || y > end || end <= start) return null;
  const points = stageSnapPoints(count).map((p) => start + p * (end - start));
  return points.reduce((best, p) => (Math.abs(p - y) < Math.abs(best - y) ? p : best));
}

/** The family nearest to a stage position, the one the tabs and the counter name. */
export const shownFamily = (position: number, count: number) => Math.min(count - 1, Math.max(0, Math.round(position)));

/* The measured cover curve of the reference (time → share covered): a slow start, a rush through the middle and a
   long soft settle; smoothstepped between the points. */
const CURVE_T = [0, 0.031, 0.134, 0.206, 0.278, 0.34, 0.412, 0.485, 0.546, 0.583, 0.62, 0.69, 0.79, 0.85, 0.93, 1];
const CURVE_C = [0, 0.006, 0.012, 0.023, 0.047, 0.07, 0.105, 0.158, 0.246, 0.55, 0.825, 0.9, 0.94, 0.956, 0.975, 1];

export function cover(t: number): number {
  const x = clamp01(t);
  for (let i = 1; i < CURVE_T.length; i++) {
    const t1 = CURVE_T[i] ?? 1;
    if (x <= t1) {
      const t0 = CURVE_T[i - 1] ?? 0;
      const c0 = CURVE_C[i - 1] ?? 0;
      const c1 = CURVE_C[i] ?? 1;
      const k = (x - t0) / (t1 - t0);
      return c0 + (c1 - c0) * k * k * (3 - 2 * k);
    }
  }
  return 1;
}

/** How far the arriving family has landed (0–1): it starts moving a third of the way into the change and eases
 * out, so it lands as the wipe settles. */
export function arrival(t: number): number {
  const k = clamp01((t - 0.35) / 0.65);
  return 1 - (1 - k) ** 3;
}
