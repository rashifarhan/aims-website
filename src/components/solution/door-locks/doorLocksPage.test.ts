import { describe, expect, it } from "vitest";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { DOOR_LOCKS_PAGE, lockTypeCount } from "./doorLocksPage";

describe("door locks page data", () => {
  it("leads with the hub card's lock and lists six other locks from the family", () => {
    expect(DOOR_LOCKS_PAGE.hero).toBe("zkteco-tl800-wi-fi-smart-digital-lock");
    expect(productBySlug(DOOR_LOCKS_PAGE.hero)?.images.length).toBeGreaterThan(0);
    expect(DOOR_LOCKS_PAGE.products).toHaveLength(6);
    expect(new Set(DOOR_LOCKS_PAGE.products).size).toBe(6);
    expect(DOOR_LOCKS_PAGE.products).not.toContain(DOOR_LOCKS_PAGE.hero);
    for (const slug of DOOR_LOCKS_PAGE.products) expect(productBySlug(slug)?.family, slug).toBe("door-locks");
  });

  it("counts types as the listing filter does, and every product has one", () => {
    const smart = lockTypeCount("smart");
    const hotel = lockTypeCount("hotel");
    expect(smart).toBeGreaterThan(0);
    expect(hotel).toBeGreaterThan(0);
    expect(smart + hotel).toBe(productsInFamily("door-locks").length);
  });

  it("links the glass door card to a product that exists", () => {
    expect(productBySlug("gl300")?.family).toBe("door-locks");
  });
});
