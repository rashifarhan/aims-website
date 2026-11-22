/**
 * The door-kit scroll story's timeline, ported from the approved prototype
 * (docs/prototypes/door-kit, Design Doc 8.2): scroll progress 0 → 1 maps to six steps, reader →
 * controller → lock → exit button → credential → software. Pure numbers, so the client leaf only
 * writes them to the drawing.
 */

export const STORY_STEPS = 6;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type StoryFrame = {
  /** The step whose text is current, 0–5. */
  step: number;
  /** Opacity of each part group, in story order (the credential step has no group). */
  parts: number[];
  /** Draw progress of the three wires (reader, lock, exit) and the software line, 0–1. */
  wires: [number, number, number, number];
  card: { dx: number; dy: number; rotate: number; opacity: number };
  readerLed: boolean;
  lockLed: boolean;
  /** Where the pulse is on its run: null when hidden; 0–0.5 reader → controller, 0.5–1 controller → lock. */
  pulse: number | null;
  /** Door leaf scale on its hinge: 1 shut, 0.74 open. */
  leaf: number;
  granted: number;
  log: number;
};

/** The card's start, relative to its final place on the reader (prototype: 110,430 → 231,326). */
const CARD_FROM = { dx: -121, dy: 104, rotate: -14 };

export function storyFrame(progress: number): StoryFrame {
  const sf = clamp01(progress) * (STORY_STEPS + 0.2);
  const local = (i: number) => clamp01(sf - i);
  const draw = (i: number) => ease(clamp01(local(i) * 1.4));
  const c = local(4);
  const arrive = ease(clamp01(c / 0.35));
  const open = ease(clamp01((c - 0.78) / 0.2));
  return {
    step: Math.min(STORY_STEPS - 1, Math.floor(sf)),
    parts: [0, 1, 2, 3, 5].map((i) => clamp01(local(i) * 5)),
    wires: [draw(1), draw(2), draw(3), draw(5)],
    card: {
      dx: lerp(CARD_FROM.dx, 0, arrive),
      dy: lerp(CARD_FROM.dy, 0, arrive),
      rotate: lerp(CARD_FROM.rotate, 0, arrive),
      opacity: clamp01(c * 5),
    },
    readerLed: c > 0.36,
    lockLed: c > 0.78,
    pulse: c > 0.38 && c < 0.78 ? (c - 0.38) / 0.4 : null,
    leaf: lerp(1, 0.74, open),
    granted: clamp01((c - 0.8) * 6),
    log: clamp01((sf - 5) * 3 - 0.6),
  };
}
