import { describe, expect, it } from "vitest";
import { navigationHref } from "./navigationHref";

describe("preview navigation", () => {
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
    expect(navigationHref("/quote")).toBe("https://aimsuae.me/enquiry");
    expect(navigationHref("/ar/software")).toBe("https://aimsuae.me/swcategory/zk-teco");
    expect(navigationHref("/ar/software/biotime-9-5")).toBe("https://aimsuae.me/software/biotime-9-5");
  });
});
