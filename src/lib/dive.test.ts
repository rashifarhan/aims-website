import { describe, expect, it } from "vitest";
import { DIVE, SHOW, activeIndex, familyProgress, ramp, slideOffset, slideOpacity, snapProgress, zoom } from "./dive";

describe("dive maths", () => {
  it("ramps within a span and clamps outside it", () => {
    expect(ramp(0, DIVE)).toBe(0);
    expect(ramp(1, DIVE)).toBe(1);
    expect(ramp((DIVE[0] + DIVE[1]) / 2, DIVE)).toBeCloseTo(0.5);
  });

  it("puts each family in front during its own stretch", () => {
    for (let i = 0; i < 6; i++) expect(activeIndex(familyProgress(i, 6), 6)).toBe(i);
    expect(activeIndex(0, 6)).toBe(0);
    expect(activeIndex(1, 6)).toBe(5);
  });

  it("keeps the first family whole as the screen opens and the last as the page leaves", () => {
    expect(slideOffset(SHOW[0], 6, 0)).toBe(0);
    expect(slideOffset(1, 6, 5)).toBe(0);
    expect(slideOpacity(slideOffset(familyProgress(2, 6), 6, 2))).toBe(1);
    expect(slideOpacity(slideOffset(familyProgress(2, 6), 6, 3))).toBe(0);
  });

  it("fades a family only in the outer quarter of its stretch", () => {
    expect(slideOpacity(0.2)).toBe(1);
    expect(slideOpacity(-0.375)).toBeCloseTo(0.5);
    expect(slideOpacity(0.5)).toBe(0);
  });

  it("settles a resting scroll on the hero or the nearest family, and leaves it past the last", () => {
    expect(snapProgress(DIVE[0] + 0.01, 6)).toBe(0);
    // Past the dive's halfway zoom the terminal goes on in, even though the hero is nearer in scroll.
    expect(snapProgress(DIVE[0] + 0.7 * (DIVE[1] - DIVE[0]), 6)).toBe(familyProgress(0, 6));
    expect(snapProgress(SHOW[0] - 0.01, 6)).toBe(familyProgress(0, 6));
    expect(snapProgress(familyProgress(3, 6) + 0.02, 6)).toBe(familyProgress(3, 6));
    expect(snapProgress(familyProgress(3, 6), 6)).toBeNull();
    expect(snapProgress(0.99, 6)).toBeNull();
    expect(snapProgress(0, 6)).toBeNull();
  });

  it("zooms from 1 to k, eased at both ends", () => {
    expect(zoom(0, 9)).toBe(1);
    expect(zoom(1, 9)).toBeCloseTo(9);
    expect(zoom(0.5, 9)).toBeCloseTo(3);
  });
});
