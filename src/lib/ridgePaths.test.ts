import { describe, expect, it } from "vitest";
import { RIDGE_VIEWBOX, ridgePath, ridgePaths } from "./ridgePaths";

describe("ridgePaths", () => {
  it("draws one closed curve per ring", () => {
    const paths = ridgePaths();
    expect(paths).toHaveLength(28);
    for (const d of paths) expect(d).toMatch(/^M\d+ \d+(C(\d+ ){5}\d+)+Z$/);
  });

  it("closes each ring where it starts", () => {
    const d = ridgePath(5, 16);
    const start = d.match(/^M(\d+ \d+)/)?.[1];
    const end = d.match(/(\d+ \d+)Z$/)?.[1];
    expect(end).toBe(start);
    expect(d.match(/C/g)).toHaveLength(16);
  });

  it("keeps every ring inside the viewBox and grows outward", () => {
    const paths = ridgePaths();
    const extent = (d: string) => d.match(/-?\d+/g)?.map(Number) ?? [];
    for (const d of paths) {
      const values = extent(d);
      expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...values)).toBeLessThanOrEqual(RIDGE_VIEWBOX);
    }
    const width = (d: string) => {
      const xs = extent(d).filter((_, i) => i % 2 === 0);
      return Math.max(...xs) - Math.min(...xs);
    };
    expect(width(paths[26])).toBeGreaterThan(width(paths[3]));
  });

  it("writes whole units only, so the inline drawing stays small", () => {
    expect(ridgePaths().join("")).not.toMatch(/\./);
    expect(ridgePaths().join("").length).toBeLessThan(10_000);
  });
});
