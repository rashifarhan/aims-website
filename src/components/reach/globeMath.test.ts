import { describe, expect, it } from "vitest";
import { easeOutExpo, facingPhi, nearestTurn, project, toCartesian } from "./globeMath";

describe("globeMath", () => {
  it("puts the faced place in the middle of the globe, in front", () => {
    const dubai = toCartesian(0, 55.3);
    const p = project(dubai, facingPhi(55.3), 0);
    expect(p.x).toBeCloseTo(0.5, 5);
    expect(p.y).toBeCloseTo(0.5, 5);
    expect(p.depth).toBeCloseTo(1, 5);
  });

  it("hides the far side of the globe", () => {
    const opposite = toCartesian(0, 55.3 - 180);
    expect(project(opposite, facingPhi(55.3), 0).depth).toBeLessThan(0);
  });

  it("puts a northern place above the middle", () => {
    expect(project(toCartesian(25, 55.3), facingPhi(55.3), 0.3).y).toBeLessThan(0.5);
  });

  it("turns the short way round", () => {
    const from = 10 * Math.PI;
    const to = nearestTurn(from, 0.2);
    expect(Math.abs(to - from)).toBeLessThanOrEqual(Math.PI);
    expect(Math.cos(to)).toBeCloseTo(Math.cos(0.2), 10);
  });

  it("eases from 0 to 1", () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    expect(easeOutExpo(0.5)).toBeGreaterThan(0.9);
  });
});
