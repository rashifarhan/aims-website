import { describe, expect, it } from "vitest";
import {
  REST,
  arrival,
  cover,
  settleTarget,
  shownFamily,
  stagePosition,
  stageSnapPoints,
  stageUnits,
} from "./familyStage";

describe("family stage maths", () => {
  it("gives each change one unit and the last family a rest", () => {
    expect(stageUnits(6)).toBeCloseTo(5 + REST);
  });

  it("holds each family still during its rest, then moves through the change", () => {
    const units = stageUnits(6);
    expect(stagePosition(0, 6)).toBe(0);
    expect(stagePosition((REST * 0.9) / units, 6)).toBe(0);
    expect(stagePosition((1 + REST) / units, 6)).toBeCloseTo(1);
    expect(stagePosition((REST + (1 - REST) / 2) / units, 6)).toBeCloseTo(0.5);
    expect(stagePosition(1, 6)).toBe(5);
  });

  it("snaps to the start of every family's rest and to the pin's end", () => {
    const points = stageSnapPoints(6);
    expect(points).toHaveLength(7);
    expect(points[0]).toBe(0);
    expect(points.at(-1)).toBe(1);
    points.slice(0, 6).forEach((p, k) => expect(stagePosition(p, 6)).toBeCloseTo(k));
  });

  it("names the nearest family", () => {
    expect(shownFamily(0.4, 6)).toBe(0);
    expect(shownFamily(0.6, 6)).toBe(1);
    expect(shownFamily(9, 6)).toBe(5);
  });

  it("covers slowly, then quickly, then settles", () => {
    expect(cover(0)).toBe(0);
    expect(cover(1)).toBe(1);
    expect(cover(0.278)).toBeCloseTo(0.047);
    expect(cover(0.62)).toBeCloseTo(0.825);
    for (let t = 0; t < 1; t += 0.05) expect(cover(t + 0.05)).toBeGreaterThanOrEqual(cover(t));
  });

  it("lands the arriving family exactly as the change ends", () => {
    expect(arrival(0.2)).toBe(0);
    expect(arrival(1)).toBe(1);
    expect(arrival(0.7)).toBeGreaterThan(0.5);
  });

  it("settles a stopped scroll on the nearest family's rest, and leaves the page outside the stage alone", () => {
    // Six families: 5.3 units over 0..5300 px, so the rests sit every 1000 px and the pin ends at 5300.
    expect(settleTarget(420, 0, 5300, 6)).toBe(0);
    expect(settleTarget(620, 0, 5300, 6)).toBeCloseTo(1000);
    expect(settleTarget(5200, 0, 5300, 6)).toBe(5300);
    expect(settleTarget(-10, 0, 5300, 6)).toBeNull();
    expect(settleTarget(5400, 0, 5300, 6)).toBeNull();
  });
});
