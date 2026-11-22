import { describe, expect, it } from "vitest";
import { navigationHref } from "./navigationHref";

describe("preview navigation", () => {
  it("keeps built pages local, including the quote list and contact", () => {
    expect(navigationHref("/quote")).toBe("/quote");
    expect(navigationHref("/contact")).toBe("/contact");
    expect(navigationHref("/ar/contact")).toBe("/ar/contact");
    expect(navigationHref("/ar/quote")).toBe("/ar/quote");
  });
  it("keeps catalogue paths and URL state unchanged", () => {
    expect(navigationHref("/ar/products?verify=face")).toBe("/ar/products?verify=face");
  });
  it("keeps the solutions hub and every built solution page local, in the same locale", () => {
    for (const slug of ["time-attendance", "access-control", "entrance-parking", "door-locks", "pos"]) {
      expect(navigationHref(`/solutions/${slug}`)).toBe(`/solutions/${slug}`);
      expect(navigationHref(`/ar/solutions/${slug}`)).toBe(`/ar/solutions/${slug}`);
    }
    expect(navigationHref("/solutions")).toBe("/solutions");
    expect(navigationHref("/ar/solutions")).toBe("/ar/solutions");
  });
  it("uses the built showroom section and live software destinations", () => {
    expect(navigationHref("/ar/locations")).toBe("/ar#showrooms");
    expect(navigationHref("/ar/software")).toBe("https://aimsuae.me/swcategory/zk-teco");
    expect(navigationHref("/ar/software/biotime-9-5")).toBe("https://aimsuae.me/software/biotime-9-5");
  });
});
