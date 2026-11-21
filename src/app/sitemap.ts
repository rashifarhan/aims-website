import type { MetadataRoute } from "next";
import { products } from "@/content/catalogue";
import { builtRoutes } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

/**
 * Generated on the canonical host (the current sitemap points at
 * mssolution.me and misses 59 products: Plan A17). English URLs only until
 * Arabic pages carry translated content; compare views are excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set([
    ...builtRoutes()
      .map((r) => r.path)
      .filter((p) => !p.startsWith("/ar") && p !== "/products/compare"),
    ...products().map((p) => `/product/${p.slug}`),
  ]);
  return [...paths].map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}` }));
}
