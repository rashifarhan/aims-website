import { describe, expect, it } from "vitest";
import { localePath } from "@/i18n/config";
import { counterpartPath } from "@/components/shell/LanguageSwitch";
import { productBySlug } from "@/content/catalogue";
import { HUB_HERO, LOCATION_MODELS, LOCATION_PAGES, marketHref } from "./locationPages";
import { buildRedirects } from "./redirects";
import { ROUTES } from "./routes";
import { alternates } from "./seo";
import { DELIVERY_COUNTRIES } from "./site";

const en = "/zkteco-distributor-in-dubai";
const ar = "/ar/zkteco-dubai";

describe("the Dubai URL pair (Master Plan 12 #32, #35)", () => {
  it("pairs the two kept URLs instead of prefixing the English slug", () => {
    expect(localePath("ar", en)).toBe(ar);
    expect(localePath("en", "/zkteco-dubai")).toBe(en);
    expect(counterpartPath(en, "ar")).toBe(ar);
    expect(counterpartPath(ar, "en")).toBe(en);
  });

  it("gives each language a self-canonical and the reciprocal hreflang", () => {
    expect(alternates("ar", en)).toMatchObject({ canonical: ar, languages: { en, ar, "x-default": en } });
    expect(alternates("en", en)).toMatchObject({ canonical: en, languages: { en, ar } });
  });

  it("sends each alias straight to its pair, and never redirects the kept URLs", () => {
    const redirects = buildRedirects();
    expect(redirects).toContainEqual({ source: "/ar/zkteco-distributor-in-dubai", destination: ar, statusCode: 301 });
    expect(redirects).toContainEqual({ source: "/zkteco-dubai", destination: en, statusCode: 301 });
    expect(redirects.filter((r) => [en, ar].includes(r.source))).toEqual([]);
  });
});

describe("the language switch keeps the query and the section", () => {
  it("on a paired page and on ordinary pages", () => {
    expect(counterpartPath(`${en}?visit=1#showroom`, "ar")).toBe(`${ar}?visit=1#showroom`);
    expect(counterpartPath("/ar/products?q=F18#results", "en")).toBe("/products?q=F18#results");
    expect(localePath("ar", "/products?q=F18")).toBe("/ar/products?q=F18");
  });

  it("at the locale roots", () => {
    expect(counterpartPath("/ar?utm=1", "en")).toBe("/?utm=1");
    expect(counterpartPath("/ar#main", "en")).toBe("/#main");
    expect(counterpartPath("/?utm=1#main", "ar")).toBe("/ar?utm=1#main");
    expect(counterpartPath("/", "ar")).toBe("/ar");
  });
});

describe("location page data", () => {
  it("uses designed routes and real catalogue products", () => {
    const routes = new Set(ROUTES.map((r) => r.path));
    for (const page of Object.values(LOCATION_PAGES)) {
      expect(routes.has(page.path), page.path).toBe(true);
      expect(productBySlug(page.hero)?.images.length, page.hero).toBeGreaterThan(0);
    }
    expect(productBySlug(HUB_HERO)?.images.length).toBeGreaterThan(0);
    for (const slug of LOCATION_MODELS) expect(productBySlug(slug), slug).toBeDefined();
  });

  it("links Oman and Kenya to their pages and every other market to an export quote for it", () => {
    expect(marketHref("Oman")).toBe("/zkteco-distributor-in-oman");
    expect(marketHref("Kenya")).toBe("/zkteco-distributors-in-kenya");
    expect(marketHref("Bahrain")).toBe("/quote?need=export&country=Bahrain");
    expect(DELIVERY_COUNTRIES.map(marketHref).filter((h) => h.startsWith("/quote"))).toHaveLength(6);
  });
});
