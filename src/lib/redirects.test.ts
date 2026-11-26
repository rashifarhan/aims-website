import { describe, expect, it } from "vitest";
import products from "../../content/products.json";
import { buildRedirects } from "./redirects";
import { ROUTES } from "./routes";
import { FAMILIES } from "@/content/taxonomy";

const redirects = buildRedirects();
const routePaths = new Set(ROUTES.map((r) => r.path));
const productSlugs = new Set(
  (products as { slug: string; duplicateOf?: string }[]).filter((p) => !p.duplicateOf).map((p) => p.slug),
);
const familyPaths = new Set(FAMILIES.map((f) => `/products/${f.slug}`));

/** A destination is valid if it is a designed route (or its Arabic mirror under /ar), a family listing, or a live product. */
function resolves(destination: string): boolean {
  const full = destination.split(/[?#]/)[0];
  if (routePaths.has(full)) return true;
  const path = full.replace(/^\/ar(?=\/)/, "");
  if (routePaths.has(path) || familyPaths.has(path)) return true;
  const m = /^\/product\/([a-z0-9-]+)$/.exec(path);
  return !!m && productSlugs.has(m[1]);
}

describe("redirect map (AT-13)", () => {
  it("uses 301 for every entry", () => {
    expect(redirects.every((r) => r.statusCode === 301)).toBe(true);
  });

  it("has no duplicate sources", () => {
    const sources = redirects.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("never points at another redirect (no chains)", () => {
    const sources = new Set(redirects.map((r) => r.source));
    expect(redirects.filter((r) => sources.has(r.destination.split(/[?#]/)[0]))).toEqual([]);
  });

  it("only points at routes the site will serve", () => {
    expect(redirects.filter((r) => !resolves(r.destination)).map((r) => r.destination)).toEqual([]);
  });

  it("covers all 16 old categories and the duplicate products", () => {
    expect(redirects.filter((r) => r.source.startsWith("/category/"))).toHaveLength(16);
    expect(redirects.find((r) => r.source === "/product/f18-1")?.destination).toBe("/product/f18");
  });

  it("does not redirect product, software or location URLs that keep their address", () => {
    const kept = ROUTES.map((r) => r.path).filter((p) => /^\/(product|software)\/|^\/zkteco-/.test(p));
    expect(redirects.filter((r) => kept.includes(r.source))).toEqual([]);
  });
});
