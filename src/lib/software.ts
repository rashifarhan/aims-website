import { z } from "zod";
import type { Product, Software } from "@/content/schema";
import { SOFTWARE_TYPES, type SoftwareType } from "@/content/taxonomy";

/** Software detail pages built in this preview (Master Plan 12, #29–31). The rest open AIMS's current pages. */
export const BUILT_SOFTWARE = ["biotime-9-5", "biotimecloud", "zkaccess-3-5"] as const;
export type BuiltSoftware = (typeof BUILT_SOFTWARE)[number];
export const isBuiltSoftware = (slug: string): slug is BuiltSoftware =>
  (BUILT_SOFTWARE as readonly string[]).includes(slug);

/**
 * The items of the first list under a heading that matches, from AIMS's own overview blocks.
 * Returns [] when AIMS publishes no such list, so the page leaves the block out (CLAUDE.md §1).
 */
export function listAfter(software: Software, heading: RegExp): string[] {
  const start = software.overview.findIndex((b) => b.type === "h" && heading.test(b.text));
  if (start < 0) return [];
  for (const block of software.overview.slice(start + 1)) {
    if (block.type === "h") return [];
    if (block.type === "ul") return block.items;
  }
  return [];
}

/** AIMS writes some features as "Title: body"; a short prefix before the colon becomes the card title. */
export function splitFeature(item: string): { title: string; body?: string } {
  const match = /^([^:]{3,48}):\s+(.+)$/.exec(item);
  return match ? { title: match[1], body: match[2] } : { title: item };
}

/**
 * How a product's own AIMS text names each platform. BioTime 9.5 matches "BioTime" and "ZKBioTime"
 * but not "BioTime 8.5" or "BioTime Cloud", so no product is claimed for a version it doesn't name.
 * BioTime Cloud has no pattern: no AIMS product page names it.
 */
const NAMED_IN_PRODUCT: Partial<Record<BuiltSoftware, RegExp>> = {
  "biotime-9-5": /\b(?:zk)?biotime\b(?!\s*(?:8\.5|cloud))/i,
  "zkaccess-3-5": /\bzkaccess/i,
};

export function namesSoftware(product: Product, slug: BuiltSoftware): boolean {
  const pattern = NAMED_IN_PRODUCT[slug];
  if (!pattern) return false;
  const specText = product.specs.flatMap((g) => g.rows.map((r) => r.value));
  const overviewText = product.overview.map((b) => (b.type === "ul" ? b.items.join(" ") : b.text));
  return pattern.test([product.summary, ...specText, ...overviewText].join("\n"));
}

const TypeParam = z.enum(SOFTWARE_TYPES);

/** The Download Centre's `?type=` filter (URL state, Plan 12 redirect map). Anything else shows all. */
export function typeFromParam(value: string | null): SoftwareType | null {
  const parsed = TypeParam.safeParse(value);
  return parsed.success ? parsed.data : null;
}
