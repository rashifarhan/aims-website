import { describe, expect, it } from "vitest";
import { storyProgress, storyStep } from "./storyProgress";

describe("scroll story geometry", () => {
  it("handles direct entry and reverses with the scrollbar", () => {
    expect(storyProgress(0, 1800, 900)).toBe(0);
    expect(storyProgress(-450, 1800, 900)).toBe(0.5);
    expect(storyProgress(-225, 1800, 900)).toBe(0.25);
  });
  it("clamps before and after the section", () => {
    expect(storyProgress(1200, 1800, 900)).toBe(0);
    expect(storyProgress(-2400, 1800, 900)).toBe(1);
  });
  it("shows the finished picture when there is no scroll range", () => {
    expect(storyProgress(0, 600, 900)).toBe(1);
    expect(storyProgress(0, 900, 900)).toBe(1);
  });
  it("keeps the active stage within the real parts list", () => {
    expect(storyStep(-1, 6)).toBe(1);
    expect(storyStep(0.4, 6)).toBe(3);
    expect(storyStep(0.9, 6)).toBe(6);
    expect(storyStep(1, 6)).toBe(6);
  });
});
