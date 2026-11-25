/**
 * The door kit's scrubbed timeline (solution/access-control/doorMotion.ts) walks a controlled door in the parts list's
 * order: credential, reader, controller, software, EM lock, exit button. Each part's beat starts at its time below
 * (timeline units); the last entry starts the verified finish, after which no part is singled out.
 */
export const DOOR_BEATS = [0, 1, 1.6, 2.8, 3.8, 5.8, 7] as const;

/** The step (1 to 6) whose part is active at a time on the timeline, or 0 once the door rests verified. */
export function doorStep(time: number): number {
  const reached = DOOR_BEATS.filter((start) => time >= start).length;
  if (reached >= DOOR_BEATS.length) return 0;
  return Math.max(1, reached);
}
