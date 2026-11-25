import { rng } from "./face";

/**
 * Turns one of AIMS's own product photographs into a point cloud the hero's particles can form: the outline comes
 * from the photo's transparency, or from its white studio ground; points crowd onto edges and detail so the device
 * reads at a glance, and each point keeps a brightness from the photo. Shapes are about 2.2 tall, centred on 0.
 */
export type Shape = { points: Float32Array; shade: Float32Array };

const SAMPLE = 220; // the photo is read at this width: plenty for 20,000 points, cheap to scan

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function shapeFromPhoto(src: string, count: number, seed: number): Promise<Shape> {
  const img = await load(src);
  const w = SAMPLE;
  const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;

  const lum = new Float32Array(w * h);
  const mask = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = px[i * 4]! / 255; // getImageData always holds 4 bytes per pixel
    const g = px[i * 4 + 1]! / 255;
    const b = px[i * 4 + 2]! / 255;
    const a = px[i * 4 + 3]! / 255;
    lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Off-white is the studio ground; anything darker or coloured belongs to the device.
    const ground = Math.min(r, g, b) > 0.93 && Math.max(r, g, b) - Math.min(r, g, b) < 0.04;
    mask[i] = a < 0.5 || ground ? 0 : 1;
  }
  // Edge strength (Sobel on luminance and on the outline) and the device's bounds.
  const weight = new Float32Array(w * h);
  let x0 = w;
  let x1 = 0;
  let y0 = h;
  let y1 = 0;
  let total = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      const L = (dx: number, dy: number) => lum[i + dy * w + dx]! + 0.6 * (1 - mask[i + dy * w + dx]!);
      const gx = L(1, -1) + 2 * L(1, 0) + L(1, 1) - L(-1, -1) - 2 * L(-1, 0) - L(-1, 1);
      const gy = L(-1, 1) + 2 * L(0, 1) + L(1, 1) - L(-1, -1) - 2 * L(0, -1) - L(1, -1);
      const edge = Math.min(1, Math.hypot(gx, gy) * 1.6);
      weight[i] = 0.25 + edge * 2.2 + lum[i]! * 0.5;
      total += weight[i]!;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  const scale = 2.2 / Math.max(1, y1 - y0, (x1 - x0) * 0.75);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  // Draw `count` pixels in proportion to their weight (a cumulative table and binary search).
  const cdf = new Float32Array(w * h);
  let run = 0;
  for (let i = 0; i < w * h; i++) {
    run += weight[i]!;
    cdf[i] = run;
  }
  const r = rng(seed);
  const points = new Float32Array(count * 3);
  const shade = new Float32Array(count);
  for (let n = 0; n < count; n++) {
    const target = r() * total;
    let lo = 0;
    let hi = w * h - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid]! < target) lo = mid + 1;
      else hi = mid;
    }
    const x = lo % w;
    const y = Math.floor(lo / w);
    const l = lum[lo]!;
    const jx = (r() - 0.5) * 0.9;
    const jy = (r() - 0.5) * 0.9;
    points[n * 3] = (x + jx - cx) * scale;
    points[n * 3 + 1] = -(y + jy - cy) * scale;
    // A shallow relief from brightness gives the flat photo depth when it turns.
    points[n * 3 + 2] = (l - 0.5) * 0.18 + (r() - 0.5) * 0.04;
    shade[n] = 0.35 + 0.65 * Math.min(1, weight[lo]! / 1.6);
  }
  return { points, shade };
}
