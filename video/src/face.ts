// The same seeded face as the site's particle hero (src/components/home/heroscroll/face.ts), projected to 2D for the
// terminal's viewfinder, so the films and the 3D hero share one face.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const g = (x: number, y: number, cx: number, cy: number, sx: number, sy: number) =>
  Math.exp(-(((x - cx) / sx) ** 2) - ((y - cy) / sy) ** 2);
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function relief(x: number, y: number) {
  const ax = Math.abs(x);
  return (
    1.35 *
    (0.3 * g(x, y, 0, -0.18, 0.09, 0.2) +
      0.16 * g(x, y, 0, 0.05, 0.06, 0.26) +
      0.07 * g(ax, y, 0.3, 0.33, 0.2, 0.05) -
      0.13 * g(ax, y, 0.3, 0.16, 0.13, 0.09) +
      0.07 * g(ax, y, 0.46, -0.06, 0.14, 0.12) +
      0.07 * g(x, y, 0, -0.47, 0.22, 0.05) -
      0.04 * g(x, y, 0, -0.5, 0.2, 0.012) +
      0.06 * g(x, y, 0, -0.8, 0.18, 0.1))
  );
}
const detail = (x: number, y: number) =>
  0.35 + g(x, y, 0, -0.12, 0.16, 0.32) + 0.8 * g(Math.abs(x), y, 0.3, 0.18, 0.16, 0.12) + 0.6 * g(x, y, 0, -0.47, 0.25, 0.08);

export type Dot = { x: number; y: number; z: number; s: number; r: number };

export function faceDots(count: number, seed = 7): Dot[] {
  const r = rng(seed);
  const out: Dot[] = [];
  while (out.length < count) {
    const theta = (r() * 2 - 1) * 2.0;
    const v = r() * 2 - 1;
    const y = v * 1.05;
    const width =
      0.72 * (1 - 0.42 * smooth(-0.1, -1, v)) * Math.sqrt(Math.max(0, 1 - (Math.max(0, v - 0.25) / 0.8) ** 2));
    const x = Math.sin(theta) * width;
    const front = smooth(0.15, 0.7, Math.cos(theta));
    const z = Math.cos(theta) * 0.8 * width + relief(x, y) * front;
    if (r() * 1.8 > detail(x, y) * (0.4 + front)) continue;
    const e = 0.01;
    const dx = (relief(x + e, y) - relief(x - e, y)) / (2 * e);
    const dy = (relief(x, y + e) - relief(x, y - e)) / (2 * e);
    const nx = -dx * front + Math.sin(theta) * 0.8;
    const ny = -dy * front;
    const len = Math.hypot(nx, ny, 1);
    out.push({ x, y, z, s: Math.max(0.15, (-0.45 * nx + 0.55 * ny + 0.7) / len), r: r() });
  }
  return out;
}
