/**
 * The 3D hero's one loop (client choice, 25 Nov 2026: storyboard A, "the verified site", closing on B's terminal
 * close-up). Everything is a pure function of the loop time, so the scene stays in step and reduced motion can
 * show any single moment.
 *
 *  0.0–2.0  the whole site; the camera drifts in
 *  2.0–4.0  a car reaches the barrier, which lifts, and drives on
 *  4.0–6.5  a visitor passes the metal detector and the speed gates open on a face
 *  6.5–9.0  the door reader unlocks, the terminal logs the check-in, data rises to the dashboard
 *  9.0–12.6 the camera moves in on the terminal, which opens into its layers and closes again
 * 12.6–14.0 back to the whole site
 */
export const LOOP = 14;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before `a`, 1 after `b`, eased between. */
export const ramp = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
/** Rises over [a, b], holds, falls over [c, d]. */
export const pulse = (t: number, a: number, b: number, c: number, d: number) => ramp(t, a, b) * (1 - ramp(t, c, d));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

export type Vec3 = [number, number, number];
const mix3 = (a: Vec3, b: Vec3, k: number): Vec3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];

/** Camera stops: [time, position, target]. Between stops the camera eases. Three.js is y-up. */
const SHOTS: [number, Vec3, Vec3][] = [
  [0, [10.6, 9.4, 12.8], [0.2, 0.7, 0]],
  [2.0, [8.6, 7.6, 10.8], [-0.8, 0.7, 0]],
  [4.0, [4.8, 4.8, 8.8], [-1.8, 0.9, 0.3]],
  [6.5, [7.0, 5.2, 8.4], [1.0, 1.0, -0.2]],
  [9.0, [6.6, 5.4, 7.4], [2.2, 1.7, -1.6]],
  [10.2, [0.1, 2.3, 1.1], [3.0, 1.5, -1.75]],
  [12.0, [0.3, 2.2, 0.9], [3.0, 1.5, -1.75]],
  [12.7, [4.0, 6.5, 6.0], [1.2, 1.2, -1.2]],
  [13.4, [10.6, 9.4, 12.8], [0.2, 0.7, 0]],
  [LOOP, [10.6, 9.4, 12.8], [0.2, 0.7, 0]],
];

export function cameraAt(t: number): { position: Vec3; target: Vec3 } {
  for (let i = 0; i < SHOTS.length - 1; i++) {
    const [t0, p0, g0] = SHOTS[i]!; // SHOTS is a fixed literal; i < length - 1, so both reads exist
    const [t1, p1, g1] = SHOTS[i + 1]!;
    if (t >= t0 && t <= t1) {
      const k = ramp(t, t0, t1);
      return { position: mix3(p0, p1, k), target: mix3(g0, g1, k) };
    }
  }
  return { position: SHOTS[0]![1], target: SHOTS[0]![2] };
}

/** Each moment of the story, 0 → 1. */
export function momentsAt(t: number) {
  return {
    carZ: mix(4.0, -5.5, ramp(t, 1.6, 4.4) * 0.45 + ramp(t, 3.2, 5.6) * 0.55),
    barrier: pulse(t, 2.5, 3.2, 5.4, 6.2),
    walker: ramp(t, 3.9, 8.6),
    detector: pulse(t, 4.4, 4.7, 5.3, 5.8),
    gates: pulse(t, 5.6, 6.1, 7.8, 8.4),
    door: pulse(t, 6.9, 7.4, 9.2, 9.8),
    verified: pulse(t, 7.2, 7.5, 12.8, 13.4),
    data: pulse(t, 7.6, 8.4, 9.6, 10.2),
    dashboard: pulse(t, 7.8, 8.6, 12.8, 13.6),
    explode: pulse(t, 10.4, 11.0, 11.8, 12.4),
  };
}
export type Moments = ReturnType<typeof momentsAt>;
