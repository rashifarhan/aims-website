import { describe, expect, it } from "vitest";
import { STAGE_OPEN, apertureFit, stageSnap } from "./stageDive";

describe("stageSnap", () => {
  it("leaves the top and everything past the open screen alone", () => {
    expect(stageSnap(0)).toBeNull();
    expect(stageSnap(STAGE_OPEN[1])).toBeNull();
    expect(stageSnap(0.9)).toBeNull();
  });
  it("finishes the dive once past halfway, and returns to the stage before that", () => {
    expect(stageSnap(0.1)).toBe(0);
    expect(stageSnap(0.4)).toBe(STAGE_OPEN[1]);
    expect(stageSnap(0.6)).toBe(STAGE_OPEN[1]);
  });
});

describe("apertureFit", () => {
  it("fills the stage's height with a tall screen and centres it", () => {
    const { k, inset } = apertureFit(100, 200, 1000, 800);
    expect(k).toBeCloseTo(3.76);
    expect(inset[0]).toBeCloseTo(24);
    expect(inset[1]).toBeCloseTo(312);
  });
  it("is held by the stage's width for a wide screen", () => {
    const { k, inset } = apertureFit(400, 100, 1000, 800);
    expect(k).toBeCloseTo(2.4);
    expect(inset[1]).toBeCloseTo(20);
  });
});
