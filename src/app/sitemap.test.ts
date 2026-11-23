import { describe, expect, it } from "vitest";
import { products } from "@/content/catalogue";
import { articles } from "@/content/pages";
import { SITE_URL } from "@/lib/site";
import sitemap from "./sitemap";

describe("sitemap (audit B7)", () => {
  const urls = sitemap().map((entry) => entry.url);

  it("lists every published blog article once", () => {
    expect(articles().length).toBeGreaterThan(1);
    for (const article of articles()) {
      expect(urls.filter((url) => url === `${SITE_URL}/blog/${article.slug}`)).toHaveLength(1);
    }
  });

  it("still lists every product and keeps personal and Arabic pages out", () => {
    for (const product of products()) expect(urls).toContain(`${SITE_URL}/product/${product.slug}`);
    expect(urls.some((url) => url.includes("/quote") || url.includes("/products/compare"))).toBe(false);
    expect(urls.some((url) => url.startsWith(`${SITE_URL}/ar`))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
