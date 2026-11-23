import { describe, expect, it } from "vitest";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { POS_PAGE, posTypeCount } from "./posPage";

describe("POS page data", () => {
  it("leads with the hub card's terminal and lists the other terminals, never the mistitled zkbio810", () => {
    expect(POS_PAGE.hero).toBe("zkaio1000");
    expect(productBySlug(POS_PAGE.hero)?.images.length).toBeGreaterThan(0);
    expect(POS_PAGE.products).not.toContain(POS_PAGE.hero);
    expect(POS_PAGE.products).not.toContain("zkbio810");
    expect(new Set(POS_PAGE.products).size).toBe(POS_PAGE.products.length);
    for (const slug of POS_PAGE.products) expect(productBySlug(slug)?.family, slug).toBe("pos");
  });

  it("counts Windows and Android terminals as the listing filter does", () => {
    const windows = posTypeCount("windows");
    const android = posTypeCount("android");
    expect(windows).toBeGreaterThan(0);
    expect(android).toBeGreaterThan(0);
    expect(windows + android).toBe(productsInFamily("pos").length);
  });

  it("names fingerprint verification only where the data does (ZKBio900 series)", () => {
    const product = productBySlug("zkbio900-series");
    expect(JSON.stringify(product?.overview)).toMatch(/fingerprint verification/i);
    expect(productBySlug("zk-h300")?.family).toBe("pos");
  });
});
