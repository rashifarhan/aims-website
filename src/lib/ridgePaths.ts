/**
 * AIMS's one motif (client decision, 24 Nov 2026): fingerprint-ridge contours, concentric closed curves gently
 * warped like a fingertip's contour map, from the approved premium-pass mockup. Each ring is a smooth closed
 * Catmull-Rom curve through `points` samples, written as cubic Béziers in a 1000 × 1000 viewBox, rounded to whole
 * units so the inline SVG stays small.
 */
export const RIDGE_VIEWBOX = 1000;

export function ridgePath(ring: number, points = 20): string {
  const r = 11 + 13.2 * ring;
  const cx = 500 + ring * 1.4;
  const cy = 505 - ring * 1.1;
  const pts = Array.from({ length: points }, (_, i) => {
    const t = (2 * Math.PI * i) / points;
    const warp =
      1 +
      0.055 * Math.sin(2 * t + ring * 0.17) +
      0.032 * Math.sin(3 * t + 1.3 + ring * 0.05) +
      0.018 * Math.sin(5 * t + ring * 0.31);
    return [cx + 0.8 * r * warp * Math.cos(t), cy + r * warp * Math.sin(t)] as const;
  });
  const at = (i: number) => pts[(i + points) % points];
  const n = (v: number) => Math.round(v).toString();
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < points; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return `${d}Z`;
}

/** Every ring of the motif, innermost first; the outermost (ring 30) nearly reaches the viewBox edge. */
export function ridgePaths(rings = 30): string[] {
  return Array.from({ length: rings }, (_, i) => ridgePath(i + 1));
}
