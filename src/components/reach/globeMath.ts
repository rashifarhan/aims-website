/**
 * The geometry the reach globe shares with cobe's shader, so the HTML ring stays on its place on the map while the
 * globe turns. Pure functions; tested in globeMath.test.ts.
 */
export type Vec3 = [number, number, number];

/** cobe draws the sphere at 0.8 of the half-canvas. */
const GLOBE_RADIUS = 0.8;
/** The tilt toward the viewer, in radians: enough to show the Gulf above the equator. */
export const GLOBE_THETA = 0.32;

export function toCartesian(lat: number, lng: number): Vec3 {
  const la = (lat * Math.PI) / 180;
  const lo = (lng * Math.PI) / 180 - Math.PI;
  const c = Math.cos(la);
  return [-c * Math.cos(lo), Math.sin(la), c * Math.sin(lo)];
}

/** Where a point lands on the canvas (0..1 across and down) and how far it faces the viewer (depth > 0 is in front). */
export function project([x, y, z]: Vec3, phi: number, theta: number) {
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const sx = (cp * x + sp * z) * GLOBE_RADIUS;
  const sy = (sp * st * x + ct * y - cp * st * z) * GLOBE_RADIUS;
  const depth = -sp * ct * x + st * y + cp * ct * z;
  return { x: (sx + 1) / 2, y: (1 - sy) / 2, depth };
}

/** The rotation that turns a longitude to face the viewer. */
export function facingPhi(lng: number) {
  return (3 * Math.PI) / 2 - (lng * Math.PI) / 180;
}

/** The copy of `angle` (mod 2π) closest to `from`, so every turn takes the short way round. */
export function nearestTurn(from: number, angle: number) {
  const tau = Math.PI * 2;
  return angle + tau * Math.round((from - angle) / tau);
}

/** A quick start and a long settle onto the target. */
export function easeOutExpo(t: number) {
  return t >= 1 ? 1 : (1 - Math.pow(2, -10 * t)) / (1 - Math.pow(2, -10));
}
