import MiniSearch from "minisearch";
import type { ProductCard } from "@/content/cards";

/**
 * Client-side product search (Plan ch. 16: MiniSearch over the catalogue).
 * Model codes are written many ways ("SA20", "SA-20", "sa 20"), so the
 * tokenizer also emits each pair of neighbouring tokens joined together.
 */
export function tokenize(text: string): string[] {
  const parts = text
    .toLowerCase()
    .split(/[^a-z0-9؀-ۿ]+/)
    .filter(Boolean);
  const joined = parts.slice(1).map((p, i) => parts[i] + p);
  return [...parts, ...joined];
}

type Doc = ProductCard & { familyName: string };

export function createIndex(cards: ProductCard[], familyNames: Record<string, string>) {
  const index = new MiniSearch<Doc>({
    idField: "slug",
    fields: ["model", "name", "keywords", "familyName"],
    storeFields: ["slug"],
    tokenize,
    searchOptions: {
      // Queries use plain tokens; joined pairs are an index-side aid only.
      tokenize: (text) =>
        text
          .toLowerCase()
          .split(/[^a-z0-9\u0600-\u06ff]+/)
          .filter(Boolean),
      boost: { model: 4, name: 3, keywords: 1, familyName: 1 },
      prefix: (term) => term.length >= 2,
      fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
      combineWith: "AND",
    },
  });
  index.addAll(cards.map((c) => ({ ...c, familyName: familyNames[c.family] ?? c.family })));
  return index;
}

export type ProductIndex = ReturnType<typeof createIndex>;

/** Slugs in relevance order; an empty query returns null (no search applied). */
export function searchSlugs(index: ProductIndex, query: string): string[] | null {
  const q = query.trim();
  if (!q) return null;
  let hits = index.search(q);
  // "SA-20" / "sa 20": retry with separators removed ("sa20").
  const compact = q.replace(/[^a-z0-9\u0600-\u06ff]+/gi, "");
  if (!hits.length && compact !== q) hits = index.search(compact);
  return hits.map((r) => String(r.id));
}

/**
 * "Closest models" for a search that found nothing: any word may match, and a word of 3+ characters tolerates
 * one slip ("F19" finds F18). Blank query → none.
 */
export function closestSlugs(index: ProductIndex, query: string, limit = 3): string[] {
  const q = query.trim();
  if (!q) return [];
  return index
    .search(q, { combineWith: "OR", prefix: true, fuzzy: (term) => (term.length >= 3 ? 0.34 : false) })
    .slice(0, limit)
    .map((r) => String(r.id));
}
