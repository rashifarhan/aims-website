/*
 * A pinned run of n steps (the home job ticket; direction 2, CLAUDE.md → Design rules, Motion): progress p from 0 to 1
 * gives each step an equal stretch. Plain functions, unit tested.
 */

/** The step in front. */
export const stepAt = (p: number, n: number) => Math.min(n - 1, Math.max(0, Math.floor(p * n)));

/** The progress at the centre of step i's stretch. */
export const stepCentre = (i: number, n: number) => (i + 0.5) / n;

/**
 * Where a resting scroll settles: the nearest step's centre, but only between the first and last centres, so the
 * page is never held as it enters or leaves the run. Null to leave it.
 */
export function stepSnap(p: number, n: number): number | null {
  if (p <= stepCentre(0, n) || p >= stepCentre(n - 1, n)) return null;
  const nearest = stepCentre(Math.min(n - 1, Math.max(0, Math.round(p * n - 0.5))), n);
  return Math.abs(nearest - p) < 0.002 ? null : nearest;
}
