import { describe, expect, it } from "vitest";
import {
  REST,
  arrival,
  cover,
  gestureBounds,
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

  it("covers nearly evenly, so every bit of scroll shows change", () => {
    expect(cover(0)).toBe(0);
    expect(cover(1)).toBe(1);
    expect(cover(0.5)).toBeCloseTo(0.5);
    expect(cover(0.1)).toBeGreaterThan(0.07);
    for (let t = 0; t < 1; t += 0.05) {
      const step = cover(t + 0.05) - cover(t);
      expect(step).toBeGreaterThan(0.03);
      expect(step).toBeLessThan(0.08);
    }
  });

  it("lands the arriving family exactly as the change ends", () => {
    expect(arrival(0.1)).toBe(0);
    expect(arrival(1)).toBe(1);
    expect(arrival(0.7)).toBeGreaterThan(0.5);
  });

  it("settles the way the visitor was scrolling once they commit, and leaves the page outside the stage alone", () => {
    // Six families: the rests start every 1000 px (60 px each) and the pin ends after the last rest.
    const end = stageUnits(6) * 1000;
    expect(end).toBeCloseTo(5060);
    // 20% into the first change (60 px rest + 188 px): forward goes on, backward returns, still takes the nearer.
    expect(settleTarget(248, 0, end, 6, 1)).toBeCloseTo(1000);
    expect(settleTarget(248, 0, end, 6, -1)).toBe(0);
    expect(settleTarget(248, 0, end, 6, 0)).toBe(0);
    // Only 5% in: not committed, it returns.
    expect(settleTarget(107, 0, end, 6, 1)).toBe(0);
    // Scrolling back: 5% short of the next family still returns to it, 20% short goes back.
    expect(settleTarget(953, 0, end, 6, -1)).toBeCloseTo(1000);
    expect(settleTarget(812, 0, end, 6, -1)).toBe(0);
    // Inside a rest it returns to that family.
    expect(settleTarget(1030, 0, end, 6, 1)).toBeCloseTo(1000);
    // The last family's rest and outside the stage scroll freely.
    expect(settleTarget(5030, 0, end, 6, 1)).toBeNull();
    expect(settleTarget(-10, 0, end, 6)).toBeNull();
    expect(settleTarget(end + 10, 0, end, 6)).toBeNull();
  });

  it("lets one gesture move one family at most", () => {
    // Six families over units × 1000 px from 0: rests at 0, 1000, 2000 … 5000, pin end 5060.
    const end = stageUnits(6) * 1000;
    const bounds = (y: number) => gestureBounds(y, 0, end, 6).map(Math.round);
    expect(bounds(0)).toEqual([-Infinity, 1000]);
    expect(bounds(2000)).toEqual([1000, 3000]);
    expect(bounds(1999.5)).toEqual([1000, 3000]);
    // In the middle of a change, only that change's two families.
    expect(bounds(2500)).toEqual([2000, 3000]);
    // On the last family the page carries on below; coming back from the page, it stops on the last family.
    expect(bounds(5000)).toEqual([4000, Infinity]);
    expect(bounds(9000)).toEqual([4000, Infinity]);
    expect(bounds(-50)).toEqual([-Infinity, 0]);
  });
});
