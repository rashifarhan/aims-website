import type { ProductCard } from "@/content/cards";
import { FAMILIES } from "@/content/taxonomy";
import type { Dictionary } from "@/i18n/dictionaries";
import { applyFilters, facetCounts, type FacetGroup, type FilterState } from "@/lib/filters";
import type { FacetGroupView } from "./FacetPanel";

type Input = {
  cards: ProductCard[];
  /** Filter state including the route's family. */
  state: FilterState;
  searchOrder: string[] | null;
  /** Set on a family listing; the family facet is then hidden. */
  family?: string;
  t: Dictionary["catalogue"];
  familyNames: Record<string, string>;
};

/** The groups that start open (design note); any group with a selected option starts open too. */
const OPEN_BY_DEFAULT: string[] = ["family", "type", "verify"];

/**
 * Facet groups with live counts (Design Doc 9 Facet panel). Options with no matches are hidden unless
 * already selected, and a group with a single option is dropped: it filters nothing.
 */
export function facetGroupViews({ cards, state, searchOrder, family, t, familyNames }: Input): FacetGroupView[] {
  const named = (dict: Record<string, string>) => (v: string) => dict[v] ?? v;
  const defs: { id: FacetGroup; legend: string; label: (v: string) => string; order: string[] }[] = [
    ...(family
      ? []
      : [
          {
            id: "family" as const,
            legend: t.facets.family,
            label: named(familyNames),
            order: FAMILIES.map((f) => f.slug),
          },
        ]),
    { id: "type", legend: t.facets.type, label: named(t.types), order: Object.keys(t.types) },
    { id: "brand", legend: t.facets.brand, label: named(t.brands), order: ["zkteco", "alpha"] },
    { id: "verify", legend: t.facets.verify, label: named(t.verify), order: Object.keys(t.verify) },
    { id: "conn", legend: t.facets.conn, label: named(t.conn), order: Object.keys(t.conn) },
  ];

  const groups = defs
    .map((g): FacetGroupView | null => {
      const counts = facetCounts(cards, state, searchOrder, g.id);
      const selected = g.id === "family" ? (state.family ? [state.family] : []) : (state[g.id] as string[]);
      const options = g.order
        .map((value) => ({
          value,
          label: g.label(value),
          count: counts.get(value) ?? 0,
          checked: selected.includes(value),
        }))
        .filter((o) => o.count > 0 || o.checked);
      const anyChecked = options.some((o) => o.checked);
      return options.length > 1 || anyChecked
        ? { id: g.id, legend: g.legend, options, defaultOpen: OPEN_BY_DEFAULT.includes(g.id) || anyChecked }
        : null;
    })
    .filter((g): g is FacetGroupView => g !== null);

  const outdoorCount = applyFilters(cards, { ...state, outdoor: true }, searchOrder).length;
  if (outdoorCount > 0 || state.outdoor) {
    groups.push({
      id: "outdoor",
      legend: t.facets.outdoor,
      options: [{ value: "1", label: t.facets.outdoor, count: outdoorCount, checked: state.outdoor }],
      defaultOpen: state.outdoor,
    });
  }
  return groups;
}
