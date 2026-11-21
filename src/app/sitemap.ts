import type { MetadataRoute } from "next";
import { builtRoutes } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

/** Generated on the canonical host (the current sitemap points at mssolution.me: Plan A17). */
export default function sitemap(): MetadataRoute.Sitemap {
  return builtRoutes().map((r) => ({ url: `${SITE_URL}${r.path === "/" ? "" : r.path}` }));
}
