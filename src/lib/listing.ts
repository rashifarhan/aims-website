import type { ProductCard } from "@/content/cards";
import { FAMILIES } from "@/content/taxonomy";
import type { SortKey } from "./filters";

/** Products per page on the listing (design note: 12). */
export const PAGE_SIZE = 12;

const FAMILY_RANK = new Map<string, number>(FAMILIES.map((f, i) => [f.slug, i]));
const byName = (a: ProductCard, b: ProductCard) =>
  a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });

/**
 * Apply the buyer's sort. "relevance" is the order the cards already arrive in (search relevance, or the default
 * order), so it returns them untouched. Never mutates the input.
 */
export function sortCards(cards: ProductCard[], sort: SortKey): ProductCard[] {
  if (sort === "name") return [...cards].sort(byName);
  if (sort === "family") {
    return [...cards].sort(
      (a, b) => (FAMILY_RANK.get(a.family) ?? 0) - (FAMILY_RANK.get(b.family) ?? 0) || byName(a, b),
    );
  }
  return cards;
}

/** One page of `items`. `page` is clamped into range; `from` and `to` are 1-based and 0 when there is nothing. */
export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount);
  const start = (current - 1) * size;
  const slice = items.slice(start, start + size);
  return {
    items: slice,
    page: current,
    pageCount,
    from: slice.length ? start + 1 : 0,
    to: slice.length ? start + slice.length : 0,
  };
}

/** Page numbers to show: first, last, and the current page with one neighbour each side; skipped runs are one gap. */
export function pageWindow(current: number, count: number): (number | "gap")[] {
  const keep = new Set([1, count, current - 1, current, current + 1].filter((n) => n >= 1 && n <= count));
  const out: (number | "gap")[] = [];
  let last = 0;
  for (const n of [...keep].sort((a, b) => a - b)) {
    if (n - last > 1) out.push("gap");
    out.push(n);
    last = n;
  }
  return out;
}
