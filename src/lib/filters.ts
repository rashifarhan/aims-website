import { z } from "zod";
import { CONNECTIVITY, METHODS } from "@/content/schema";
import { FAMILIES, PRODUCT_TYPES } from "@/content/taxonomy";
import type { ProductCard } from "@/content/cards";

/**
 * Listing state lives in the URL (Design Doc 10, T4): shareable, and Back
 * restores it. Unknown values are dropped rather than failing the page.
 *   ?q=f18&family=access-control&type=panel&brand=zkteco&verify=face,card&conn=wifi&outdoor=1&cmp=f18,bio-pro-sa20
 * `sort=name|family` and `page=2` are omitted when they are the default (relevance, page 1).
 */
const BRANDS = ["zkteco", "alpha"] as const;
export const MAX_COMPARE = 3;
export const SORT_KEYS = ["relevance", "name", "family"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

const list = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .optional()
    .transform((s) => {
      const allowed = new Set<string>(values);
      return [...new Set((s ?? "").split(",").filter((v) => allowed.has(v)))] as T[number][];
    });

const FilterSchema = z.object({
  q: z
    .string()
    .optional()
    .transform((s) => (s ?? "").slice(0, 80)),
  family: z
    .enum(FAMILIES.map((f) => f.slug) as [string, ...string[]])
    .optional()
    .catch(undefined),
  type: list(PRODUCT_TYPES),
  brand: list(BRANDS),
  verify: list(METHODS),
  conn: list(CONNECTIVITY),
  outdoor: z
    .string()
    .optional()
    .transform((s) => s === "1"),
  cmp: z
    .string()
    .optional()
    .transform((s) => [...new Set((s ?? "").split(",").filter((v) => /^[a-z0-9-]+$/.test(v)))].slice(0, MAX_COMPARE)),
  sort: z.enum(SORT_KEYS).catch("relevance"),
  // 1-based; anything that isn't a positive whole number is page 1. The listing clamps the upper end.
  page: z
    .string()
    .optional()
    .transform((s) => (s && /^[1-9]\d{0,5}$/.test(s) ? Number(s) : 1)),
});

export type FilterState = z.infer<typeof FilterSchema>;
export type FacetGroup = "family" | "type" | "brand" | "verify" | "conn";

export function parseFilters(params: URLSearchParams | Record<string, string | string[] | undefined>): FilterState {
  const get = (k: string) => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k];
    return Array.isArray(v) ? v[0] : (v ?? undefined);
  };
  return FilterSchema.parse(Object.fromEntries(Object.keys(FilterSchema.shape).map((k) => [k, get(k)])));
}

export function serializeFilters(state: Partial<FilterState>): string {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.family) p.set("family", state.family);
  for (const k of ["type", "brand", "verify", "conn", "cmp"] as const) {
    const v = state[k];
    if (v?.length) p.set(k, v.join(","));
  }
  if (state.outdoor) p.set("outdoor", "1");
  if (state.sort && state.sort !== "relevance") p.set("sort", state.sort);
  if (state.page && state.page > 1) p.set("page", String(state.page));
  const s = p.toString().replace(/%2C/g, ",");
  return s ? `?${s}` : "";
}

/** Number of filters applied, for the "Filters (n)" button. Search and compare don't count. */
export const activeFilterCount = (s: FilterState) =>
  (s.family ? 1 : 0) + s.type.length + s.brand.length + s.verify.length + s.conn.length + (s.outdoor ? 1 : 0);

function matches(card: ProductCard, s: FilterState, skip?: FacetGroup): boolean {
  if (skip !== "family" && s.family && card.family !== s.family) return false;
  if (skip !== "type" && s.type.length && !s.type.some((t) => card.types.includes(t))) return false;
  if (skip !== "brand" && s.brand.length && !s.brand.includes(card.brand as (typeof BRANDS)[number])) return false;
  // Within a group, options combine with OR; groups combine with AND.
  if (skip !== "verify" && s.verify.length && !s.verify.some((m) => card.verify.includes(m))) return false;
  if (skip !== "conn" && s.conn.length && !s.conn.some((c) => card.conn.includes(c))) return false;
  if (s.outdoor && !card.outdoor) return false;
  return true;
}

/**
 * Filter cards. `searchOrder` (slugs from search, relevance first) both
 * restricts and orders the results; null means no search.
 */
export function applyFilters(cards: ProductCard[], s: FilterState, searchOrder: string[] | null): ProductCard[] {
  const base = searchOrder ? orderBy(cards, searchOrder) : defaultOrder(cards);
  return base.filter((c) => matches(c, s));
}

const FAMILY_RANK = new Map<string, number>(FAMILIES.map((f, i) => [f.slug, i]));
const completeness = (c: ProductCard) => (c.image && c.facts.length > 0 ? 0 : 1);

/**
 * Order with no search (site polish T5): cards with a photo and published key facts first, so the first
 * screen isn't a row of "Specs on request"; then families in FAMILIES order. Array sort is stable, so
 * import order holds within each group. It only reorders: the same products appear.
 */
export function defaultOrder(cards: ProductCard[]): ProductCard[] {
  return [...cards].sort(
    (a, b) => completeness(a) - completeness(b) || (FAMILY_RANK.get(a.family) ?? 0) - (FAMILY_RANK.get(b.family) ?? 0),
  );
}

function orderBy(cards: ProductCard[], slugs: string[]): ProductCard[] {
  const bySlug = new Map(cards.map((c) => [c.slug, c]));
  return slugs.map((s) => bySlug.get(s)).filter((c): c is ProductCard => !!c);
}

/** Counts per option, as if only that group's selection changed (standard faceting). */
export function facetCounts(
  cards: ProductCard[],
  s: FilterState,
  searchOrder: string[] | null,
  group: FacetGroup,
): Map<string, number> {
  const base = (searchOrder ? orderBy(cards, searchOrder) : cards).filter((c) => matches(c, s, group));
  const counts = new Map<string, number>();
  for (const c of base) {
    const values: string[] =
      group === "family" ? [c.family] : group === "brand" ? [c.brand] : group === "type" ? c.types : c[group];
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return counts;
}

/** Toggle one option in a multi-value group. */
export function toggle<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}
