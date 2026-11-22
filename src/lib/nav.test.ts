import { describe, expect, it } from "vitest";
import { ROUTES } from "./routes";
import { FAMILY_SLUGS, SOFTWARE_LINKS, SOLUTIONS, familyPath, solutionPath } from "./nav";

const routePaths = new Set(ROUTES.map((r) => r.path));

describe("navigation model", () => {
  it("every solution link is a designed route", () => {
    expect(SOLUTIONS.map(solutionPath).filter((p) => !routePaths.has(p))).toEqual([]);
  });

  it("every software link is a designed route", () => {
    expect(SOFTWARE_LINKS.map((s) => s.path).filter((p) => !routePaths.has(p))).toEqual([]);
  });

  it("company and utility links are designed routes", () => {
    const fixed = [
      "/products",
      "/solutions",
      "/software",
      "/services",
      "/about",
      "/support",
      "/locations",
      "/blog",
      "/contact",
      "/quote",
      "/privacy-policy",
      "/terms-and-conditions",
    ];
    expect(fixed.filter((p) => !routePaths.has(p))).toEqual([]);
  });

  it("family listings use the six family slugs", () => {
    expect(FAMILY_SLUGS.map(familyPath)).toHaveLength(6);
  });
});
