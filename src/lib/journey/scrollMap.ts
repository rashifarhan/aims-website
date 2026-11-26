import { z } from "zod";

/**
 * The scroll film's structure, written by Blender (3d/building.py --export-timeline) from 3d/aims3d/journey.py.
 * Validated here because it crosses from the 3D pipeline into the app.
 */
export const TimelineSchema = z.object({
  fps: z.number().int().positive(),
  frames: z.number().int().positive(),
  step: z.number().int().positive(),
  cut: z.number().int(),
  moments: z.array(z.object({ key: z.string(), frame: z.number().int() })),
  lift: z.object({ from: z.number().int(), to: z.number().int(), floor: z.number().int() }),
  chapters: z.array(z.object({ key: z.string(), from: z.number().int(), to: z.number().int(), topics: z.array(z.string()) })),
  beats: z.array(
    z.object({
      key: z.string(),
      chapter: z.string(),
      from: z.number().int(),
      to: z.number().int(),
      slug: z.string().nullable(),
      kind: z.enum(["product", "software"]),
    }),
  ),
});
export type Timeline = z.infer<typeof TimelineSchema>;

/** A stretch of film and how much scroll (in screens) it takes. */
export type Segment = { from: number; to: number; weight: number };

/**
 * Scroll length follows interest, not film time (3D plan, responsiveness rules): every product beat takes
 * `beatScreens` of scroll whatever its length, and travel between beats is compressed to `travelPerSecond`
 * screens per second of film, so nobody scrolls through an empty corridor.
 */
export function buildSegments(t: Timeline, beatScreens = 1, travelPerSecond = 0.2): Segment[] {
  const beats = [...t.beats].sort((a, b) => a.from - b.from);
  const segments: Segment[] = [];
  const travel = (from: number, to: number) => {
    if (to > from) segments.push({ from, to, weight: ((to - from) / t.fps) * travelPerSecond });
  };
  let cursor = 1;
  for (const beat of beats) {
    travel(cursor, beat.from);
    segments.push({ from: beat.from, to: beat.to, weight: beatScreens });
    cursor = beat.to;
  }
  travel(cursor, t.frames);
  return segments;
}

export const totalScreens = (segments: Segment[]) => segments.reduce((sum, s) => sum + s.weight, 0);

/** The film frame (fractional) at a scroll progress of 0..1 through the whole film section. */
export function frameAt(segments: Segment[], progress: number): number {
  const total = totalScreens(segments);
  let remaining = Math.min(Math.max(progress, 0), 1) * total;
  for (const s of segments) {
    if (remaining <= s.weight) return s.from + (s.to - s.from) * (s.weight ? remaining / s.weight : 0);
    remaining -= s.weight;
  }
  const last = segments.at(-1);
  return last ? last.to : 1;
}

/** The scroll progress (0..1) at which a film frame is shown: the inverse of frameAt, for chapter jumps. */
export function progressAt(segments: Segment[], frame: number): number {
  const total = totalScreens(segments);
  if (!total) return 0;
  let before = 0;
  for (const s of segments) {
    if (frame <= s.to) {
      const within = s.to > s.from ? (Math.max(frame, s.from) - s.from) / (s.to - s.from) : 0;
      return (before + within * s.weight) / total;
    }
    before += s.weight;
  }
  return 1;
}
