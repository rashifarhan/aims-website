import "server-only";
import type { Product } from "./schema";
import { products } from "./catalogue";
import { namesSoftware, type BuiltSoftware } from "@/lib/software";

/** Families each platform serves first, so a page leads with the terminals its buyers fit. */
const FAMILY_ORDER: Record<BuiltSoftware, string[]> = {
  "biotime-9-5": ["time-attendance", "access-control"],
  biotimecloud: ["time-attendance"],
  "zkaccess-3-5": ["access-control", "time-attendance", "door-hardware"],
};

/** Model codes long enough to be a product name don't fit the diagram's nodes. */
const SHORT_MODEL = 16;

/**
 * Terminals whose own AIMS product text names the platform (CLAUDE.md §1: no inferred
 * compatibility). BioTime Cloud is named by no product page, so it lists the terminals that
 * name BioTime, and its copy asks buyers to confirm cloud support (Plan 12 #30).
 */
export function terminalsFor(slug: BuiltSoftware, limit = 4): Product[] {
  const named = slug === "biotimecloud" ? "biotime-9-5" : slug;
  const order = FAMILY_ORDER[slug];
  const rank = (p: Product) => {
    const i = order.indexOf(p.family);
    return i < 0 ? order.length : i;
  };
  return products()
    .filter((p) => namesSoftware(p, named) && order.includes(p.family) && p.images.length > 0)
    .filter((p) => p.model.length <= SHORT_MODEL)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}
