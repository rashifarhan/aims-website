export type SignalField = {
  /** The drawing's viewBox width and height. */
  width: number;
  height: number;
  /** Where every line ends: the device in the home hero, a corner for a watermark. */
  target: { x: number; y: number };
  count: number;
  /**
   * The phone fan: lines rise from the whole bottom edge. The wide fan starts them along the bottom from x = 600
   * and then up the end edge, as in the approved prototype.
   */
  mobile?: boolean;
};

/**
 * The AIMS signal lines (Design Doc 3 and 8.1): cubic curves that rise from the field's edge and meet at one target.
 * Geometry ported from docs/prototypes/hero/aims-hero.html, shared by the animated home hero and the static
 * watermarks on inner heroes and home sections, so every page draws the same curves.
 */
export function signalPaths({ width, height, target, count, mobile = false }: SignalField): string[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const sx = mobile ? -40 + t * (width + 80) : t < 0.62 ? 600 + (t / 0.62) * (width - 560) : width + 30;
    const sy = mobile || t < 0.62 ? height + 30 : height - 80 - ((t - 0.62) / 0.38) * (height - 40);
    const c1x = sx + (target.x - sx) * 0.15 + (mobile ? 0 : -60);
    const c1y = sy - (sy - target.y) * 0.55 - (mobile ? 40 : 90) * Math.sin(t * Math.PI);
    const c2x = target.x - (target.x - sx) * 0.35;
    const c2y = target.y + (sy - target.y) * 0.25;
    return `M${sx.toFixed(1)} ${sy.toFixed(1)} C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${target.x} ${target.y}`;
  });
}

/** A line's resting strength in the prototype: every fifth line stronger, the middle of the fan brightest. */
export function signalOpacity(i: number, count: number): number {
  return (i % 5 === 0 ? 0.65 : 0.22) + 0.35 * Math.sin((i / (count - 1)) * Math.PI);
}
