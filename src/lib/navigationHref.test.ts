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
  it("uses the built showroom section and live software/contact destinations", () => {
    expect(navigationHref("/ar/locations")).toBe("/ar#showrooms");
    // /contact is built (T9), so it stays local; unbuilt services and support still use AIMS's enquiry page.
    expect(navigationHref("/contact")).toBe("/contact");
    expect(navigationHref("/support")).toBe("https://aimsuae.me/enquiry");
    expect(navigationHref("/ar/software")).toBe("https://aimsuae.me/swcategory/zk-teco");
    expect(navigationHref("/ar/software/biotime-9-5")).toBe("https://aimsuae.me/software/biotime-9-5");
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
