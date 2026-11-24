/**
 * The homepage's one count (CLAUDE.md §3: a tech site may have one count). Pure timing and formatting, so the
 * client leaf (components/home/CountUpFigure.tsx) only schedules frames.
 */
export const COUNT_DURATION_MS = 1400;
/** Each of the four figures starts this much after the one before it. */
export const COUNT_STAGGER_MS = 120;

/** A company figure as the site prints it: Latin digits, a thousands comma, then the suffix ("2,200+"). */
export const formatFigure = (value: number, suffix = "") => `${Math.round(value).toLocaleString("en")}${suffix}`;

/** Ease-out cubic: quick at first, settling on the final number (taste motion.md, entrances ease out). */
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** The whole number shown `elapsed` ms into the count: 0 before it starts, exactly `target` once it ends. */
export function countUpValue(target: number, elapsed: number, duration = COUNT_DURATION_MS): number {
  if (elapsed <= 0) return 0;
  if (elapsed >= duration) return target;
  return Math.round(target * easeOutCubic(elapsed / duration));
}
