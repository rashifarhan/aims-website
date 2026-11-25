/**
 * The point cloud of the scroll hero: a procedural face (no model file), and the scattered cloud it forms from.
 * A seeded generator keeps the face identical on every visit. Units: the face is about 2 tall, centred on 0.
 */

/** Mulberry32: tiny, fast and deterministic. */
export function rng(seed: number) {
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

/** How far the face surface stands out from the base head at (x, y): nose, brows, sockets, cheeks, lips, chin. */
function relief(x: number, y: number) {
  const ax = Math.abs(x);
  return (
    1.35 *
    (0.3 * g(x, y, 0, -0.18, 0.09, 0.2) + // nose tip
      0.16 * g(x, y, 0, 0.05, 0.06, 0.26) + // nose bridge
      0.07 * g(ax, y, 0.3, 0.33, 0.2, 0.05) - // brows
      0.13 * g(ax, y, 0.3, 0.16, 0.13, 0.09) + // eye sockets
      0.07 * g(ax, y, 0.46, -0.06, 0.14, 0.12) + // cheekbones
      0.07 * g(x, y, 0, -0.47, 0.22, 0.05) - // lips
      0.04 * g(x, y, 0, -0.5, 0.2, 0.012) + // mouth line
      0.06 * g(x, y, 0, -0.8, 0.18, 0.1)) // chin
  );
}

/** Feature density: more points where the face has detail, so the eye reads it as a face. */
const detail = (x: number, y: number) =>
  0.35 +
  g(x, y, 0, -0.12, 0.16, 0.32) +
  0.8 * g(Math.abs(x), y, 0.3, 0.18, 0.16, 0.12) +
  0.6 * g(x, y, 0, -0.47, 0.25, 0.08);

export function facePoints(count: number, seed = 7) {
  const r = rng(seed);
  const face = new Float32Array(count * 3);
  const cloud = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const shade = new Float32Array(count);
  let i = 0;
  while (i < count) {
    // A front-facing mask: the head's front half and its sides, wrapping to about ±115°.
    const theta = (r() * 2 - 1) * 2.0;
    const v = r() * 2 - 1; // height, -1 chin … 1 crown
    const y = v * 1.05;
    // The jaw narrows towards the chin and the crown rounds off.
    const width =
      0.72 * (1 - 0.42 * smooth(-0.1, -1, v)) * Math.sqrt(Math.max(0, 1 - (Math.max(0, v - 0.25) / 0.8) ** 2));
    const depth = 0.8 * width;
    const x = Math.sin(theta) * width;
    let z = Math.cos(theta) * depth;
    const front = smooth(0.15, 0.7, Math.cos(theta));
    z += relief(x, y) * front;
    if (r() * 1.8 > detail(x, y) * (0.4 + front)) continue;
    face.set([x, y, z], i * 3);
    // Fake light from the upper left: the slope of the relief brightens the faces of the nose, brows and cheeks.
    const e = 0.01;
    const dx = (relief(x + e, y) - relief(x - e, y)) / (2 * e);
    const dy = (relief(x, y + e) - relief(x, y - e)) / (2 * e);
    const nx = -dx * front + Math.sin(theta) * 0.8;
    const ny = -dy * front;
    const nz = 1;
    const len = Math.hypot(nx, ny, nz);
    shade[i] = Math.max(0.15, (-0.45 * nx + 0.55 * ny + 0.7 * nz) / len);
    // The cloud: a wide, flattened swirl the face condenses from.
    const a = r() * Math.PI * 2;
    const rad = 2.2 + r() * 3.4;
    cloud.set([Math.cos(a) * rad, (r() * 2 - 1) * 2.2, Math.sin(a) * rad * 0.6 - 1.2], i * 3);
    rand[i] = r();
    i++;
  }
  return { face, cloud, rand, shade };
}
