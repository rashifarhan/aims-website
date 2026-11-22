import { describe, expect, it } from "vitest";
import { navigationHref, prefetchSafe } from "./navigationHref";

describe("preview navigation", () => {
  it("keeps built pages local, including the quote list", () => {
    expect(navigationHref("/quote")).toBe("/quote");
    expect(navigationHref("/ar/quote")).toBe("/ar/quote");
  });
  it("keeps catalogue paths and URL state unchanged", () => {
    expect(navigationHref("/ar/products?verify=face")).toBe("/ar/products?verify=face");
  });
  it("routes solution categories to available catalogue families in the same locale", () => {
    expect(navigationHref("/ar/solutions/entrance-parking")).toBe("/ar/products/entrance-control");
    expect(navigationHref("/solutions")).toBe("/solutions");
    expect(navigationHref("/ar/solutions")).toBe("/ar/solutions");
  });
  it("keeps the built software pages local, with the type filter", () => {
    expect(navigationHref("/software")).toBe("/software");
    expect(navigationHref("/ar/software?type=access-control")).toBe("/ar/software?type=access-control");
    expect(navigationHref("/ar/software/biotime-9-5")).toBe("/ar/software/biotime-9-5");
  });
  it("keeps the built company pages local", () => {
    for (const path of ["/about", "/services", "/support", "/locations", "/privacy-policy", "/blog"]) {
      expect(navigationHref(path)).toBe(path);
      expect(navigationHref(`/ar${path}`)).toBe(`/ar${path}`);
    }
  });
  it("uses live destinations for pages not built yet", () => {
    expect(navigationHref("/contact")).toBe("https://aimsuae.me/enquiry");
    expect(navigationHref("/ar/software/zkbio-cvaccess")).toBe("https://aimsuae.me/software/zkbio-cvaccess");
  });
});

describe("prefetch guard", () => {
  it("turns prefetch off for the solutions hub and filtered listings only", () => {
    expect(prefetchSafe("/solutions")).toBe(false);
    expect(prefetchSafe("/ar/solutions")).toBe(false);
    expect(prefetchSafe("/products?q=F18")).toBe(false);
    expect(prefetchSafe("/solutions/time-attendance")).toBe(true);
    expect(prefetchSafe("/products")).toBe(true);
    expect(prefetchSafe("/ar")).toBe(true);
  });
});
