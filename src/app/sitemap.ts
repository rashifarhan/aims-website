import type { MetadataRoute } from "next";
import { products } from "@/content/catalogue";
import { articles } from "@/content/pages";
import { builtRoutes } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

/**
 * Generated on the canonical host (the current sitemap points at
 * mssolution.me and misses 59 products: Plan A17). English URLs only until
 * Arabic pages carry translated content; compare and quote (personal pages) are excluded. Every blog article AIMS
 * published is listed from the article collection (audit B7: the route registry names only one of the 19); each keeps
 * its live aimsuae.me URL and a self-canonical.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set([
    ...builtRoutes()
      .map((r) => r.path)
      .filter((p) => !p.startsWith("/ar") && p !== "/products/compare" && p !== "/quote"),
    ...products().map((p) => `/product/${p.slug}`),
    ...articles().map((a) => `/blog/${a.slug}`),
  ]);
  return [...paths].map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}` }));
}
