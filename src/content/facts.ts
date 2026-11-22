import type { FamilySlug } from "./taxonomy";
import type { Product, SpecRow } from "./schema";

/**
 * Card facts (Design Doc 10, T4 + review decision 5): two values taken
 * verbatim from the spec table, chosen per family so they separate models
 * within that family. First available label wins; nothing is inferred.
 */
export const FACT_LABELS: Record<FamilySlug, string[]> = {
  "time-attendance": [
    "Face capacity",
    "Fingerprint capacity",
    "Palm capacity",
    "User capacity",
    "ID card capacity",
    "Card capacity",
    "Record capacity",
    "Transaction capacity",
    "Display",
  ],
  "access-control": [
    "Doors controlled",
    "Readers supported",
    "Face capacity",
    "Fingerprint capacity",
    "Palm capacity",
    "Card capacity",
    "Card holder capacity",
    "Read range",
    "Reading distance",
    "Communication",
  ],
  "entrance-control": ["Lane width", "Barrier movement", "Type", "Speed of throughput", "Emergency mode", "Material"],
  "door-locks": ["Door thickness", "Card type", "User capacity", "Battery life", "Material", "Communication"],
  "door-hardware": [
    "Holding force",
    "Read range",
    "Reading distance",
    "Frequency",
    "Compatibility",
    "Power supply",
    "Material",
  ],
  pos: ["Operating system", "Display", "Touch screen", "Processor", "CPU", "System memory", "Memory"],
};

/**
 * Product-page tiles show four facts; after the family's own labels, these
 * fill the remaining tiles (still verbatim rows).
 */
const GENERAL_LABELS = [
  "Transaction capacity",
  "Record capacity",
  "Card capacity",
  "Display",
  "Power supply",
  "Dimensions (W × D × H)",
  "Dimensions",
  "Weight",
  "Operating temperature",
];

/** Long values don't fit a card and must not be cut (they are verbatim). */
const MAX_FACT_LENGTH = 48;

export function keyFacts(product: Pick<Product, "family" | "specs">, count = 2): SpecRow[] {
  const rows = new Map(product.specs.flatMap((g) => g.rows).map((r) => [r.label, r] as const));
  const out: SpecRow[] = [];
  const labels = [...(FACT_LABELS[product.family as FamilySlug] ?? []), ...(count > 2 ? GENERAL_LABELS : [])];
  for (const label of labels) {
    const row = rows.get(label);
    if (row && row.value.length <= MAX_FACT_LENGTH && !out.some((f) => f.label === row.label))
      out.push({ label: row.label, value: row.value });
    if (out.length === count) break;
  }
  return out;
}
