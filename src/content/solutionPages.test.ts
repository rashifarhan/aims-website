import { describe, expect, it } from "vitest";
import { productBySlug, productsInFamily, softwareBySlug } from "./catalogue";
import { SOLUTION_PAGES, methodCount } from "./solutionPages";

describe("T3 solution page data", () => {
  for (const page of Object.values(SOLUTION_PAGES)) {
    it(`${page.slug}: every product, the hero and the software exist in the catalogue`, () => {
      // The hero is the hub card's product; F18 (time attendance) is filed under access control, so only its photo is required.
      expect(productBySlug(page.hero)?.images.length).toBeGreaterThan(0);
      for (const slug of page.products) expect(productBySlug(slug)?.family, slug).toBe(page.family);
      expect(new Set(page.products).size).toBe(page.products.length);
      // The hero photo is not repeated in the product row (taste: one view once).
      expect(page.products).not.toContain(page.hero);
      for (const { slug } of page.software ?? []) expect(softwareBySlug(slug), slug).toBeDefined();
    });
    it(`${page.slug}: every method option has at least one product`, () => {
      for (const { match } of page.methods ?? []) expect(methodCount(page.family, match)).toBeGreaterThan(0);
    });
  }

  it("counts a product once even when it offers several of an option's methods", () => {
    const both = productsInFamily("time-attendance").filter(
      (p) => p.methods.includes("mobile") || p.methods.includes("qr"),
    );
    expect(methodCount("time-attendance", ["mobile", "qr"])).toBe(both.length);
  });
});
