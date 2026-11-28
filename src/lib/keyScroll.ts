/*
 * Keyboard scrolling (owner request, 28 Nov 2026): the keys a browser scrolls the page with, as one intent each, so the
 * smooth scroll (SmoothScroll) and the home dive (DiveMotion) answer them the same way the wheel is answered.
 */

export type KeyIntent =
  { kind: "by"; direction: 1 | -1; size: "line" | "page" } | { kind: "to"; edge: "start" | "end" };

type Keys = { key: string; shiftKey: boolean; altKey: boolean; ctrlKey: boolean; metaKey: boolean };

/** The intent of a key press, or null when the key is not a page scroll (or a modifier gives it another meaning). */
export function keyIntent({ key, shiftKey, altKey, ctrlKey, metaKey }: Keys): KeyIntent | null {
  if (altKey || ctrlKey || metaKey) return null;
  switch (key) {
    case "ArrowDown":
      return shiftKey ? null : { kind: "by", direction: 1, size: "line" };
    case "ArrowUp":
      return shiftKey ? null : { kind: "by", direction: -1, size: "line" };
    case "PageDown":
      return { kind: "by", direction: 1, size: "page" };
    case "PageUp":
      return { kind: "by", direction: -1, size: "page" };
    case " ":
      return { kind: "by", direction: shiftKey ? -1 : 1, size: "page" };
    case "Home":
      return shiftKey ? null : { kind: "to", edge: "start" };
    case "End":
      return shiftKey ? null : { kind: "to", edge: "end" };
    default:
      return null;
  }
}

/** How far a line or a page moves: a page keeps a strip of what was on screen, under the sticky header. */
export function keyDistance(size: "line" | "page", viewport: number, header: number): number {
  return size === "line" ? 120 : Math.max(120, viewport - header - 64);
}
