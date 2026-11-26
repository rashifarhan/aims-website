import "server-only";
import type { Product } from "./schema";
import { products } from "./catalogue";
import { namesSoftware, type BuiltSoftware } from "@/lib/software";

/** Families each platform serves first, so a page leads with the terminals its buyers fit. */
const FAMILY_ORDER: Record<BuiltSoftware, string[]> = {
  "biotime-9-5": ["time-attendance", "access-control"],
  biotimecloud: ["time-attendance"],
  "zkbio-cvsecurity": ["access-control", "time-attendance", "door-hardware"],
  "zkbio-cvaccess": ["access-control", "time-attendance", "door-hardware"],
};

/** Model codes long enough to be a product name don't fit the diagram's nodes. */
const SHORT_MODEL = 16;

/**
 * Terminals whose own AIMS product text names the platform (CLAUDE.md §1: no inferred
 * compatibility). BioTime Cloud is named by no product page, so it lists none: borrowing
 * BioTime 9.5's terminals would claim cloud support no AIMS page states (Plan 12 #30).
 */
export function terminalsFor(slug: BuiltSoftware, limit = 4): Product[] {
  const order = FAMILY_ORDER[slug];
  const rank = (p: Product) => {
    const i = order.indexOf(p.family);
    return i < 0 ? order.length : i;
  };
  return products()
    .filter((p) => namesSoftware(p, slug) && order.includes(p.family) && p.images.length > 0)
    .filter((p) => p.model.length <= SHORT_MODEL)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}
