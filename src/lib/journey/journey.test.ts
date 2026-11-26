import { describe, expect, it } from "vitest";
import { availableFrames, loadOrder, nearestIndex, nearestLoaded, neighbourhood } from "./frames";
import { buildSegments, frameAt, progressAt, type Timeline, TimelineSchema, totalScreens } from "./scrollMap";
import raw from "./timeline.json";

const timeline: Timeline = TimelineSchema.parse(raw);

describe("scroll map", () => {
  const segments = buildSegments(timeline);

  it("starts at the first frame and ends at the last", () => {
    expect(frameAt(segments, 0)).toBe(1);
    expect(frameAt(segments, 1)).toBeCloseTo(timeline.frames, 6); // fractional frame, summed weights
  });

  it("never runs backwards as the reader scrolls down", () => {
    let previous = 0;
    for (let p = 0; p <= 1; p += 0.001) {
      const f = frameAt(segments, p);
      expect(f).toBeGreaterThanOrEqual(previous);
      previous = f;
    }
  });

  it("gives every product beat one screen of scroll", () => {
    for (const beat of timeline.beats) {
      const span = progressAt(segments, beat.to) - progressAt(segments, beat.from);
      expect(span * totalScreens(segments)).toBeCloseTo(1, 5);
    }
  });

  it("inverts: the frame at a beat's start progress is that beat's first frame", () => {
    for (const beat of timeline.beats) expect(frameAt(segments, progressAt(segments, beat.from))).toBeCloseTo(beat.from, 5);
  });
});

describe("frames", () => {
  const available = availableFrames(timeline.frames, timeline.step);

  it("lists every rendered frame once", () => {
    expect(available[0]).toBe(1);
    expect(available.at(-1)).toBeLessThanOrEqual(timeline.frames);
    expect(new Set(loadOrder(available)).size).toBe(available.length);
  });

  it("loads the whole film coarsely before any detail", () => {
    const order = loadOrder(available);
    const coarse = Math.ceil(available.length / 32);
    expect(order.slice(0, coarse)).toEqual(available.filter((_, i) => i % 32 === 0));
  });

  it("finds the nearest frame and the nearest loaded one", () => {
    expect(available[nearestIndex(available, 100)]).toBe(99);
    const loaded = new Set([1, 401]);
    expect(nearestLoaded(available, (f) => loaded.has(f), 380)).toBe(401);
    expect(nearestLoaded(available, () => false, 380)).toBeNull();
  });

  it("fetches the reader's own place first", () => {
    expect(neighbourhood(available, 500, 2)).toEqual([499, 497, 501, 495, 503]);
  });
});
