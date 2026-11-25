import { describe, expect, it } from "vitest";
import { journeyStep } from "./journeyStep";

describe("journeyStep", () => {
  it("holds the first step through the lead-in and most of the first move", () => {
    expect(journeyStep(0, 0.3, 5)).toBe(0);
    expect(journeyStep(0.3, 0.3, 5)).toBe(0);
    expect(journeyStep(1.04, 0.3, 5)).toBe(0);
  });

  it("names the next step from a quarter unit before it arrives", () => {
    expect(journeyStep(1.05, 0.3, 5)).toBe(1);
    expect(journeyStep(2.3, 0.3, 5)).toBe(2);
    expect(journeyStep(3.3, 0.3, 5)).toBe(3);
  });

  it("never runs past the last step or before the first", () => {
    expect(journeyStep(4.3, 0.3, 5)).toBe(4);
    expect(journeyStep(9, 0.3, 5)).toBe(4);
    expect(journeyStep(-1, 0.3, 5)).toBe(0);
  });
});
