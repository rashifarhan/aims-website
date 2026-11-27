import { useEffect, useMemo } from "react";
import type { ProductCard as Card } from "@/content/cards";
import type { FamilySlug } from "@/content/taxonomy";
import {
  activeFilterCount,
  applyFilters,
  facetCounts,
  relaxations,
  serializeFilters,
  toggle,
  type FacetGroup,
  type FilterState,
} from "@/lib/filters";
import { withDestination, type QuoteContext } from "@/lib/quote/context";
import { paginate, sortCards } from "@/lib/listing";
import { QUICK_PICKS, applyPreset, isPresetActive, quickPickCounts } from "@/lib/quickPicks";
import { closestSlugs, createIndex, searchSlugs } from "@/lib/search";
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
  const results = useMemo(
    () => sortCards(applyFilters(cards, effective, order), effective.sort),
    [cards, effective, order],
  );

  /* ---------- pages ---------- */
  const paged = paginate(results, state.page);
  // A page past the end (?page=99, or filters that shrank the list) is rewritten to the last page.
  useEffect(() => {
    if (paged.page !== state.page) update({ page: paged.page });
  });

  /* ---------- facets ---------- */
  // The category picker (hub) or the page itself (family page) chooses the family, and once a family is chosen its
  // sub-types are chips over the results, so the rail and the sheet keep only the finer filters.
  const omit: FacetGroup[] = effective.family ? ["family", "type"] : ["family"];
  const groups = facetGroupViews({ cards, state: effective, searchOrder: order, omit, t, familyNames });
  const typeCounts = facetCounts(cards, effective, order, "type");
  const typeChips = effective.family
    ? Object.keys(t.types)
        .filter((k) => (typeCounts.get(k) ?? 0) > 0)
        .map((k) => ({
          value: k,
          label: (t.types as Record<string, string>)[k] ?? k,
          count: typeCounts.get(k) ?? 0,
          pressed: state.type.includes(k as FilterState["type"][number]),
        }))
    : [];
  const typeTotal = applyFilters(cards, { ...effective, type: [] }, order).length;
  const onType = (value: string | undefined) =>
    update({ type: value ? [value as FilterState["type"][number]] : [], page: 1 });
  const onFamily = (value: FamilySlug | undefined) => update({ family: value, type: [], page: 1 });

  const onToggle = (groupId: string, value: string) => {
    if (groupId === "outdoor") return update({ outdoor: !state.outdoor });
    if (groupId === "family") return update({ family: state.family === value ? undefined : (value as FamilySlug) });
    const key = groupId as Exclude<FacetGroup, "family">;
    update({ [key]: toggle(state[key] as string[], value) } as Partial<FilterState>);
  };

  // The chosen category is not a filter to clear: "Clear filters" keeps it, and it is not counted.
  const filterCount = activeFilterCount({ ...state, family: undefined, type: effective.family ? [] : state.type });
  const clearFilters = () => update({ type: [], brand: [], verify: [], conn: [], outdoor: false });
  const onSort = (sort: FilterState["sort"]) => update({ sort });
  const onGoToPage = (n: number) => {
    update({ page: n }, { push: true });
    const heading = document.getElementById("results-heading");
    heading?.scrollIntoView({ block: "start" });
    heading?.focus({ preventScroll: true });
  };
  const hrefForPage = (n: number) =>
    withDestination(`${hrefs.listing}${serializeFilters({ ...state, page: n })}`, preset);

  /* ---------- quick picks (not on a family page: its facets are already narrow) ---------- */
  const pickCounts = useMemo(() => quickPickCounts(cards), [cards]);
  const picks = family
    ? []
    : QUICK_PICKS.filter((p) => (pickCounts.get(p.id) ?? 0) > 0).map((p) => ({
        id: p.id,
        label: t.picks[p.id],
        count: pickCounts.get(p.id) ?? 0,
        pressed: isPresetActive(state, p.preset),
      }));
  const onPick = (id: string) => {
    const preset = QUICK_PICKS.find((p) => p.id === id)?.preset;
    if (!preset) return;
    // A pressed pick is a toggle: pressing it again clears the filters it set.
    const next = applyPreset(state, isPresetActive(state, preset) ? {} : preset);
    update({
      family: next.family,
      type: next.type,
      brand: next.brand,
      verify: next.verify,
      conn: next.conn,
      outdoor: next.outdoor,
      page: 1,
    });
  };

  /* ---------- compare ---------- */
  const bySlug = useMemo(() => new Map(cards.map((c) => [c.slug, c])), [cards]);
  const compareItems = state.cmp.map((s) => bySlug.get(s)).filter((c): c is Card => !!c);
  const listingUrl =
    typeof window === "undefined"
      ? ""
      : withDestination(`${window.location.pathname}${serializeFilters(state)}`, preset);
  const compareHref = `${hrefs.compare}?items=${compareItems.map((c) => c.slug).join(",")}${listingUrl ? `&from=${encodeURIComponent(listingUrl)}` : ""}`;

  /* ---------- zero-results recovery ---------- */
  const noResults = results.length === 0;
  // Close models only when the search itself found nothing (a typo or near code), not when filters emptied it.
  const closest =
    noResults && order && order.length === 0
      ? closestSlugs(index, state.q)
          .map((slug) => bySlug.get(slug))
          .filter((c): c is Card => !!c)
          .map((c) => ({ slug: c.slug, name: c.name, href: withDestination(`${hrefs.product}/${c.slug}`, preset) }))
      : [];
  const optionLabel = (group: string, value: string) =>
    groups.find((g) => g.id === group)?.options.find((o) => o.value === value)?.label ?? value;
  const relax =
    noResults && filterCount > 0
      ? relaxations(cards, state, order).map((r) => ({
          key: `${r.group}-${r.value}`,
          label: optionLabel(r.group, r.value),
          count: r.count,
          onRemove: () => onToggle(r.group, r.value),
        }))
      : [];

  return {
    state,
    update,
    effective,
    results,
    picks,
    onPick,
    closest,
    relax,
    pageResults: paged.items,
    paged,
    onSort,
    onGoToPage,
    hrefForPage,
    groups,
    onToggle,
    typeChips,
    typeTotal,
    onType,
    onFamily,
    filterCount,
    clearFilters,
    compareItems,
    compareHref,
  };
}
