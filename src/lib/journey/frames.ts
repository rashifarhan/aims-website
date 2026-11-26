/** Frame bookkeeping for the scroll film: which frames exist, in what order to load them, which to draw. */

/** The film frames rendered to disk: 1, 1 + step, 1 + 2·step … up to `frames`. */
export function availableFrames(frames: number, step: number): number[] {
  const list: number[] = [];
  for (let f = 1; f <= frames; f += step) list.push(f);
  return list;
}

/**
 * Coarse to fine: every 32nd frame of the whole film first, then every 16th, 8th … every one, so a reader who
 * scrolls anywhere early still sees the right place in the film, only choppier (responsiveness rules).
 */
export function loadOrder(available: number[]): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const stride of [32, 16, 8, 4, 2, 1]) {
    for (let i = 0; i < available.length; i += stride) {
      const frame = available[i];
      if (frame !== undefined && !seen.has(frame)) {
        seen.add(frame);
        order.push(frame);
      }
    }
  }
  return order;
}

/** Index of the available frame closest to `frame` (binary search on the sorted list). */
export function nearestIndex(available: number[], frame: number): number {
  let lo = 0;
  let hi = available.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((available[mid] ?? 0) < frame) lo = mid + 1;
    else hi = mid;
  }
  const below = Math.max(lo - 1, 0);
  return Math.abs((available[below] ?? 0) - frame) <= Math.abs((available[lo] ?? 0) - frame) ? below : lo;
}

/** The loaded frame nearest to `frame`, searching outward; null while nothing has loaded. */
export function nearestLoaded(available: number[], loaded: (frame: number) => boolean, frame: number): number | null {
  const start = nearestIndex(available, frame);
  for (let d = 0; d < available.length; d++) {
    for (const i of d === 0 ? [start] : [start - d, start + d]) {
      const f = available[i];
      if (f !== undefined && loaded(f)) return f;
    }
  }
  return null;
}

/** The frames around `frame` to fetch next, nearest first, so the reader's own place sharpens first. */
export function neighbourhood(available: number[], frame: number, radius = 12): number[] {
  const start = nearestIndex(available, frame);
  const out: number[] = [];
  for (let d = 0; d <= radius; d++) {
    for (const i of d === 0 ? [start] : [start - d, start + d]) {
      const f = available[i];
      if (f !== undefined) out.push(f);
    }
  }
  return out;
}
