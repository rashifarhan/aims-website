import { describe, expect, it } from "vitest";
import { COUNT_DURATION_MS, countUpValue, easeOutCubic, formatFigure } from "./countUp";

describe("formatFigure", () => {
  it("prints the figure with a thousands comma and its suffix", () => {
    expect(formatFigure(2200, "+")).toBe("2,200+");
    expect(formatFigure(11, "+")).toBe("11+");
    expect(formatFigure(0, "+")).toBe("0+");
    expect(formatFigure(30)).toBe("30");
  });
});

describe("easeOutCubic", () => {
  it("runs from 0 to 1 and is past halfway at the midpoint (ease-out)", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe("countUpValue", () => {
  it("is 0 before the count starts and the exact target once it ends", () => {
    expect(countUpValue(2200, -50)).toBe(0);
    expect(countUpValue(2200, 0)).toBe(0);
    expect(countUpValue(2200, COUNT_DURATION_MS)).toBe(2200);
    expect(countUpValue(2200, COUNT_DURATION_MS * 3)).toBe(2200);
  });

  it("only ever shows whole numbers that rise towards the target", () => {
    let last = 0;
    for (let ms = 0; ms <= COUNT_DURATION_MS; ms += 16) {
      const value = countUpValue(200, ms);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(last);
      expect(value).toBeLessThanOrEqual(200);
      last = value;
    }
  });
});
