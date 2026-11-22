import { expect, it } from "vitest";
import { localePath } from "@/i18n/config";
import { counterpartPath } from "@/components/shell/LanguageSwitch";
import { alternates } from "./seo";
import { buildRedirects } from "./redirects";

const en = "/zkteco-distributor-in-dubai";
const ar = "/ar/zkteco-dubai";

it("pairs the preserved Dubai URLs rather than prefixing the English slug", () => {
  expect(localePath("ar", en)).toBe(ar);
  expect(counterpartPath(en, "ar")).toBe(ar);
  expect(counterpartPath(ar, "en")).toBe(en);
});

it("preserves query and hash while switching a Dubai page", () => {
  expect(counterpartPath(`${en}?visit=1#showroom`, "ar")).toBe(`${ar}?visit=1#showroom`);
  expect(counterpartPath(`${ar}?visit=1#showroom`, "en")).toBe(`${en}?visit=1#showroom`);
  expect(localePath("ar", "/products?q=F18")).toBe("/ar/products?q=F18");
});

it("switches locale roots with query and hash suffixes", () => {
  expect(counterpartPath("/ar?utm=1", "en")).toBe("/?utm=1");
  expect(counterpartPath("/ar#main", "en")).toBe("/#main");
  expect(counterpartPath("/?utm=1#main", "ar")).toBe("/ar?utm=1#main");
});

it("uses self-canonical and reciprocal hreflang for Arabic Dubai", () => {
  expect(alternates("ar", en)).toMatchObject({
    canonical: ar,
    languages: { en, ar, "x-default": en },
  });
});

it("redirects only the Dubai aliases directly to their canonical URLs", () => {
  const redirects = buildRedirects();
  expect(redirects).toContainEqual({ source: "/ar/zkteco-distributor-in-dubai", destination: ar, statusCode: 301 });
  expect(redirects).toContainEqual({ source: "/zkteco-dubai", destination: en, statusCode: 301 });
  expect(redirects.filter((r) => [en, ar].includes(r.source))).toEqual([]);
});
