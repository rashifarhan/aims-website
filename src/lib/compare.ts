import type { Product } from "@/content/schema";
import { specHint, type SpecHints } from "@/content/glossary";

export const NOT_LISTED = null;

export type CompareRow = {
  label: string;
  hint?: string;
  /** One value per product, in column order; null = not listed by AIMS. */
  values: (string | null)[];
  /** True when the listed values differ, or some product doesn't list it. */
  differs: boolean;
  /** True when every product lists this row. */
  shared: boolean;
};

/** "3000 Templates" and "3,000" are the same value: ignore separators and count nouns. */
const norm = (v: string) =>
  v
    .toLowerCase()
    .replace(/\b(templates?|transactions?|records?|users?|logs?|cards?|faces?|fingerprints?|events?)\b/g, "")
    .replace(/[\s,]/g, "");

/**
 * Aligns spec rows across 2–3 products (Design Doc 9, compare table).
 * Rows every product lists come first, in the first product's order;
 * the rest follow. Missing values are explicit, never blank.
 */
/** `hints` is the page dictionary's product.specHints, so Arabic pages explain specs in Arabic. */
export function compareRows(products: Pick<Product, "specs">[], hints?: SpecHints): CompareRow[] {
  const maps = products.map((p) => new Map(p.specs.flatMap((g) => g.rows).map((r) => [r.label, r.value] as const)));
  const labels: string[] = [];
  for (const m of maps) for (const l of m.keys()) if (!labels.includes(l)) labels.push(l);

  const rows = labels.map((label) => {
    const values = maps.map((m) => m.get(label) ?? NOT_LISTED);
    const listed = values.filter((v): v is string => v !== NOT_LISTED);
    const shared = listed.length === values.length;
    return {
      label,
      hint: specHint(label, hints),
      values,
      shared,
      differs: !shared || new Set(listed.map(norm)).size > 1,
    };
  });
  return [...rows.filter((r) => r.shared), ...rows.filter((r) => !r.shared)];
}
