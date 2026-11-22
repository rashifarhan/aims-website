import { describe, expect, it } from "vitest";
import { storyFrame } from "./doorStory";

describe("door-kit story timeline", () => {
  it("starts with nothing built and the door shut", () => {
    const f = storyFrame(0);
    expect(f.step).toBe(0);
    expect(f.parts.every((o) => o === 0)).toBe(true);
    expect(f.leaf).toBe(1);
    expect(f.granted).toBe(0);
    expect(f.pulse).toBeNull();
  });

  it("ends on the prototype's final frame: every part, door open, access granted, event logged", () => {
    const f = storyFrame(1);
    expect(f.step).toBe(5);
    expect(f.parts.every((o) => o === 1)).toBe(true);
    expect(f.wires.every((w) => w === 1)).toBe(true);
    expect(f.card).toEqual({ dx: 0, dy: 0, rotate: 0, opacity: 1 });
    expect(f.readerLed && f.lockLed).toBe(true);
    expect(f.leaf).toBeCloseTo(0.74);
    expect(f.granted).toBe(1);
    expect(f.log).toBe(1);
  });

  it("runs the pulse only while the credential is being checked", () => {
    const during = storyFrame(4.6 / 6.2);
    expect(during.step).toBe(4);
    expect(during.pulse).not.toBeNull();
    expect(storyFrame(3.9 / 6.2).pulse).toBeNull();
  });

  it("clamps progress outside 0–1", () => {
    expect(storyFrame(-1)).toEqual(storyFrame(0));
    expect(storyFrame(2)).toEqual(storyFrame(1));
  });
});
