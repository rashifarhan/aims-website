import { describe, expect, it } from "vitest";
import { signalOpacity, signalPaths } from "./signalPaths";

const homeDesktop = { width: 1440, height: 760, target: { x: 1146, y: 390 }, count: 26 };
const homeMobile = { width: 390, height: 390, target: { x: 201, y: 210 }, count: 14, mobile: true };

describe("signalPaths", () => {
  it("keeps the home hero's approved curves exactly", () => {
    const desktop = signalPaths(homeDesktop);
    expect(desktop).toHaveLength(26);
    expect(desktop[0]).toBe("M600.0 790.0 C621.9 570.0 954.9 490.0 1146 390");
    expect(desktop[25]).toBe("M1470.0 -40.0 C1361.4 196.5 1259.4 282.5 1146 390");
    const mobile = signalPaths(homeMobile);
    expect(mobile).toHaveLength(14);
    expect(mobile[0]).toBe("M-40.0 420.0 C-3.9 304.5 116.7 262.5 201 210");
    expect(mobile[13]).toBe("M430.0 420.0 C395.6 304.5 281.1 262.5 201 210");
  });

  it("ends every line at the target", () => {
    const target = { x: 1500, y: -60 };
    for (const d of signalPaths({ width: 1440, height: 600, target, count: 12 })) {
      expect(d.endsWith(` ${target.x} ${target.y}`)).toBe(true);
    }
  });
});

describe("signalOpacity", () => {
  it("makes every fifth line stronger and peaks mid-fan", () => {
    expect(signalOpacity(0, 26)).toBeCloseTo(0.65);
    expect(signalOpacity(1, 26)).toBeLessThan(signalOpacity(0, 26));
    expect(signalOpacity(12, 26)).toBeGreaterThan(signalOpacity(2, 26));
  });
});
