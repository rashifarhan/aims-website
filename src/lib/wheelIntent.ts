/**
 * Telling a fresh wheel or trackpad stroke from the glide of the last one (family slider; CLAUDE.md → Design rules →
 * Motion). A trackpad's glide only ever slows down; a new stroke, or a mouse wheel still turning, holds its speed or
 * speeds up. So the latest few deltas are compared with the ones before them (after fullPage.js's acceleration test).
 */
const LATEST = 6;
const BEFORE = 30;
/** How many recent speeds the slider keeps. */
export const WHEEL_HISTORY = BEFORE;

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/** `speeds` are recent |deltaY| values, oldest first. Too few to judge counts as not fresh. */
export function isFreshInput(speeds: number[]): boolean {
  if (speeds.length < LATEST * 2) return false;
  return mean(speeds.slice(-LATEST)) >= mean(speeds.slice(-BEFORE)) * 0.98;
}
