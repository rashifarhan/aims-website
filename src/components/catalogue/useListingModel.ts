import { useMemo } from "react";
import type { ProductCard as Card } from "@/content/cards";
import type { FamilySlug } from "@/content/taxonomy";
import {
  activeFilterCount,
  applyFilters,
  serializeFilters,
  toggle,
  type FacetGroup,
  type FilterState,
} from "@/lib/filters";
import { withDestination, type QuoteContext } from "@/lib/quote/context";
import { createIndex, searchSlugs } from "@/lib/search";
import { facetGroupViews } from "./facetGroups";
import { useListingState } from "./useListingState";
import type { ListingProps } from "./Listing";

/**
 * What the listing derives from the URL state: the matching cards, the facet groups with counts, the
 * filter handlers and the compare tray's items and link (AT-03). Filter and compare state stay in the URL.
 */
export function useListingModel({
  cards,
  family,
  t,
  familyNames,
  hrefs,
  urlState,
  preset,
}: ListingProps & { urlState: FilterState; preset?: Partial<QuoteContext> }) {
  const { state, update } = useListingState(urlState, family, preset);

  const effective = useMemo<FilterState>(() => (family ? { ...state, family } : state), [state, family]);
  const index = useMemo(() => createIndex(cards, familyNames), [cards, familyNames]);
  const order = useMemo(() => searchSlugs(index, state.q), [index, state.q]);
  const results = useMemo(() => applyFilters(cards, effective, order), [cards, effective, order]);

  /* ---------- facets ---------- */
  const groups = facetGroupViews({ cards, state: effective, searchOrder: order, family, t, familyNames });

  const onToggle = (groupId: string, value: string) => {
    if (groupId === "outdoor") return update({ outdoor: !state.outdoor });
    if (groupId === "family") return update({ family: state.family === value ? undefined : (value as FamilySlug) });
    const key = groupId as Exclude<FacetGroup, "family">;
    update({ [key]: toggle(state[key] as string[], value) } as Partial<FilterState>);
  };

  const filterCount = activeFilterCount(state);
  const clearFilters = () => update({ family: undefined, type: [], brand: [], verify: [], conn: [], outdoor: false });

  /* ---------- compare ---------- */
  const bySlug = useMemo(() => new Map(cards.map((c) => [c.slug, c])), [cards]);
  const compareItems = state.cmp.map((s) => bySlug.get(s)).filter((c): c is Card => !!c);
  const listingUrl =
    typeof window === "undefined"
      ? ""
      : withDestination(`${window.location.pathname}${serializeFilters(state)}`, preset);
  const compareHref = `${hrefs.compare}?items=${compareItems.map((c) => c.slug).join(",")}${listingUrl ? `&from=${encodeURIComponent(listingUrl)}` : ""}`;

  return { state, update, effective, results, groups, onToggle, filterCount, clearFilters, compareItems, compareHref };
}
