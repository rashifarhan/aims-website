import type Lenis from "lenis";
import type { VirtualScrollData } from "lenis";
import { gestureBounds } from "@/lib/familyStage";
import { WHEEL_HISTORY, isFreshInput } from "@/lib/wheelIntent";

/** Wheel input that pauses this long ends a gesture. A trackpad's glide sends events every frame until it stops, and
 * a mouse wheel spun in one go sends its notches closer than this, so each counts as one gesture. */
const GESTURE_GAP_MS = 200;
/** Input that keeps coming without a pause starts a new gesture once the last one has had this long to play, if it
 * is fresh input rather than a glide dying away (owner, 28 Nov 2026: steady scrolling with the cursor still stopped
 * the slider, because without a pause every stroke counted as the first one). */
const RENEW_MS = 650;

/**
 * One wheel or trackpad gesture moves the family slider by one family at most; steady input moves on one family
 * at a time (RENEW_MS) (owner, 28 Nov 2026: a slightly
 * bigger scroll ran through two families). At the start of each gesture we work out how far it may go
 * (`gestureBounds`), then trim every delta of that gesture to stay inside; the rest of the glide is dropped, with its
 * default prevented so the page does not scroll natively instead. Outside the stage, and on from the last family,
 * nothing is trimmed. Touch, pinch-zoom (ctrl + wheel) and sideways input pass untouched.
 */
export function oneFamilyPerGesture(
  lenis: Lenis,
  range: () => { start: number; end: number } | undefined,
  count: number,
  takeHeading: () => number | null,
) {
  let last = -Infinity;
  let began = -Infinity;
  let speeds: number[] = [];
  let bounds: [number, number] = [-Infinity, Infinity];
  return (data: VirtualScrollData) => {
    const { event, deltaY } = data;
    if (!(event instanceof WheelEvent) || event.ctrlKey || Math.abs(data.deltaX) > Math.abs(deltaY)) return true;
    const stage = range();
    if (!stage) return true;
    const from = lenis.targetScroll;
    // Lenis adds the delta to where the page is now. A gesture that starts during a settle or jump counts from where
    // that is heading instead, so its first delta also carries the rest of the way there.
    let base = from;
    const now = event.timeStamp;
    const paused = now - last > GESTURE_GAP_MS;
    if (paused) speeds = [];
    speeds.push(Math.abs(deltaY));
    if (speeds.length > WHEEL_HISTORY) speeds.shift();
    if (paused || (now - began > RENEW_MS && isFreshInput(speeds))) {
      base = takeHeading() ?? from;
      bounds = gestureBounds(base, stage.start, stage.end, count);
      began = now;
      if (!paused) speeds = [];
    }
    last = now;
    const [lo, hi] = bounds;
    const step = Math.min(hi, Math.max(lo, base + deltaY)) - base;
    const move = base + step - from;
    // Nothing left of this gesture's family, or the page is already past it (a jump): drop the input. Lenis ignores a
    // zero delta without preventing the event, which would let the browser scroll natively, so we prevent it here.
    if (Math.abs(step) < 0.5 || Math.sign(step) !== Math.sign(deltaY) || Math.abs(move) < 0.5) {
      if (event.cancelable) event.preventDefault();
      return false;
    }
    data.deltaY = move;
    return true;
  };
}
