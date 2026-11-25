/**
 * The home journey's scrubbed timeline (home/journeyMotion.ts) runs a short lead-in, then one time unit per move from
 * one step to the next. This says which step is active at a time on it: the next card counts as active from a quarter
 * unit before it arrives, as it reaches full opacity, so the counter rolls with the card rather than after it.
 */
export function journeyStep(time: number, lead: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(time - lead + 0.25)));
}
