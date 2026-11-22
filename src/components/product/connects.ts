import type { Product } from "@/content/schema";

export type Connections = {
  /** Connectivity codes from the product's own `connectivity[]` (labels come from the dictionary). */
  links: Product["connectivity"];
  /** Items of the verbatim "Access control interface" spec row, split on commas, text unchanged. */
  door: string[];
};

/**
 * What the "How it connects" diagram may draw: only this product's own data (audit signature SIGNAL).
 * Nothing is inferred, so a product that lists nothing gets no diagram.
 */
export function connections(p: Pick<Product, "connectivity" | "specs">): Connections {
  const iface = p.specs.flatMap((g) => g.rows).find((r) => r.label === "Access control interface")?.value ?? "";
  const door = iface
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { links: [...new Set(p.connectivity)], door: [...new Set(door)] };
}

/** One line per destination; below two the "diagram" would be a single pill and says nothing. */
export const MIN_CONNECTS_NODES = 2;

export const nodeCount = (c: Connections) => c.links.length + c.door.length;
