import { describe, expect, it } from "vitest";
import { navigationHref } from "./navigationHref";
import { prefetchSafe } from "./prefetchSafe";

describe("preview navigation", () => {
  it("keeps built pages local, including the quote list", () => {
    expect(navigationHref("/quote")).toBe("/quote");
    expect(navigationHref("/ar/quote")).toBe("/ar/quote");
  });
  it("keeps catalogue paths and URL state unchanged", () => {
    expect(navigationHref("/ar/products?verify=face")).toBe("/ar/products?verify=face");
  });
  it("keeps the hub and all five built solution pages local", () => {
    for (const slug of ["time-attendance", "access-control", "entrance-parking", "door-locks", "pos"])
      expect(navigationHref(`/ar/solutions/${slug}`)).toBe(`/ar/solutions/${slug}`);
    expect(navigationHref("/solutions")).toBe("/solutions");
    expect(navigationHref("/ar/solutions")).toBe("/ar/solutions");
  });
  it("keeps the built software pages local, with the type filter", () => {
    expect(navigationHref("/software")).toBe("/software");
    expect(navigationHref("/ar/software?type=access-control")).toBe("/ar/software?type=access-control");
    expect(navigationHref("/ar/software/biotime-9-5")).toBe("/ar/software/biotime-9-5");
  });
  it("keeps the built about, legal and blog pages local", () => {
    expect(navigationHref("/about")).toBe("/about");
    expect(navigationHref("/ar/about")).toBe("/ar/about");
    expect(navigationHref("/privacy-policy")).toBe("/privacy-policy");
    expect(navigationHref("/ar/terms-and-conditions")).toBe("/ar/terms-and-conditions");
    expect(navigationHref("/ar/blog")).toBe("/ar/blog");
  });
  it("uses the built showroom section and live destinations for pages not built yet", () => {
    expect(navigationHref("/ar/locations")).toBe("/ar#showrooms");
    // /contact is built (T9), so it stays local, and unbuilt services and support land on it too.
    expect(navigationHref("/contact")).toBe("/contact");
    expect(navigationHref("/support")).toBe("/contact");
    expect(navigationHref("/ar/services")).toBe("/ar/contact");
    // Software pages AIMS lists but this site hasn't built still open AIMS's own page.
    expect(navigationHref("/ar/software/zkbio-cvaccess")).toBe("https://aimsuae.me/software/zkbio-cvaccess");
  });
});

describe("prefetch guard", () => {
  it("turns prefetch off for the solutions hub, the legal pages and filtered listings only", () => {
    expect(prefetchSafe("/solutions")).toBe(false);
    expect(prefetchSafe("/ar/solutions")).toBe(false);
    expect(prefetchSafe("/products?q=F18")).toBe(false);
    expect(prefetchSafe("/privacy-policy")).toBe(false);
    expect(prefetchSafe("/ar/terms-and-conditions")).toBe(false);
    expect(prefetchSafe("/solutions/time-attendance")).toBe(true);
    expect(prefetchSafe("/products")).toBe(true);
    expect(prefetchSafe("/ar")).toBe(true);
  });
});
