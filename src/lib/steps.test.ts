import { describe, expect, it } from "vitest";
import { stepAt, stepCentre, stepSnap } from "./steps";

describe("pinned steps", () => {
  it("gives each of n steps an equal stretch", () => {
    expect(stepAt(0, 5)).toBe(0);
    expect(stepAt(0.39, 5)).toBe(1);
    expect(stepAt(1, 5)).toBe(4);
    expect(stepCentre(2, 5)).toBeCloseTo(0.5);
  });

  it("settles between the first and last centres only", () => {
    expect(stepSnap(0.05, 5)).toBeNull();
    expect(stepSnap(0.95, 5)).toBeNull();
    expect(stepSnap(0.33, 5)).toBeCloseTo(0.3);
    expect(stepSnap(0.42, 5)).toBeCloseTo(0.5);
    expect(stepSnap(0.5, 5)).toBeNull();
  });
});
