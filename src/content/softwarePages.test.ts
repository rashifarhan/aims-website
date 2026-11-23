import { describe, expect, it, vi } from "vitest";
import { namesSoftware } from "@/lib/software";

vi.mock("server-only", () => ({}));
const { terminalsFor } = await import("./softwarePages");

describe("terminalsFor", () => {
  it("lists only terminals whose own AIMS text names the platform, with a photo", () => {
    for (const slug of ["biotime-9-5", "zkaccess-3-5"] as const) {
      const terminals = terminalsFor(slug);
      expect(terminals.length).toBeGreaterThanOrEqual(2);
      expect(terminals.length).toBeLessThanOrEqual(4);
      for (const p of terminals) {
        expect(namesSoftware(p, slug)).toBe(true);
        expect(p.images.length).toBeGreaterThan(0);
      }
    }
  });

  it("lists no terminal for BioTime Cloud, which no AIMS product page names", () => {
    // Borrowing BioTime 9.5's terminals would claim cloud support no AIMS page states (CLAUDE.md §1).
    expect(terminalsFor("biotimecloud")).toEqual([]);
  });
});
