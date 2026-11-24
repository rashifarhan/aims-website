import type { ProductCard } from "@/content/cards";
import { applyFilters, parseFilters, type FilterState } from "./filters";

/**
 * Quick picks (design note: "Popular"): one-click presets for the needs buyers name most, built only from the
 * existing facet values, so each one is a normal, shareable filter URL.
 */
export type QuickPickId = "face" | "fingerprint" | "turnstiles" | "parking" | "panels" | "smart" | "hotel" | "pos";

export type QuickPickPreset = Partial<Pick<FilterState, "family" | "type" | "verify">>;

export const QUICK_PICKS: { id: QuickPickId; preset: QuickPickPreset }[] = [
  { id: "face", preset: { verify: ["face"] } },
  { id: "fingerprint", preset: { verify: ["fingerprint"] } },
  { id: "turnstiles", preset: { type: ["pedestrian"] } },
  { id: "parking", preset: { type: ["parking"] } },
  { id: "panels", preset: { type: ["panel"] } },
  { id: "smart", preset: { type: ["smart"] } },
  { id: "hotel", preset: { type: ["hotel"] } },
  { id: "pos", preset: { family: "pos" } },
];

const FILTER_FIELDS = ["family", "type", "brand", "verify", "conn", "outdoor"] as const;

/** The filters a preset stands for: every filter field cleared, then the preset's own values. */
function presetFilters(preset: QuickPickPreset) {
  return { family: undefined, type: [], brand: [], verify: [], conn: [], outdoor: false, ...preset };
}

/** Replace the buyer's filters with the preset. Search, sort and compare stay; the page goes back to 1. */
export function applyPreset(state: FilterState, preset: QuickPickPreset): FilterState {
  return { ...state, ...presetFilters(preset), page: 1 };
}

/** True when the filters are exactly the preset's (search, sort, page and compare don't matter). */
export function isPresetActive(state: FilterState, preset: QuickPickPreset): boolean {
  const want = presetFilters(preset);
  return FILTER_FIELDS.every((k) => JSON.stringify(state[k]) === JSON.stringify(want[k]));
}

/** How many products each pick would show, against the whole catalogue (the current search is ignored). */
export function quickPickCounts(cards: ProductCard[]): Map<QuickPickId, number> {
  const empty = parseFilters({});
  return new Map(
    QUICK_PICKS.map((p) => [p.id, applyFilters(cards, applyPreset(empty, p.preset), null).length] as const),
  );
}
