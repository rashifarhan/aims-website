"use client";

import { useEffect, useRef, useState } from "react";
import type { FamilySlug } from "@/content/taxonomy";
import { serializeFilters, type FilterState } from "@/lib/filters";
import { withDestination, type QuoteContext } from "@/lib/quote/context";

/**
 * The listing's filter state, mirrored to the URL (AT-03): clicks update React state at once and the URL
 * shortly after; the URL wins again when it changes from outside (Back/Forward, the header search). The market
 * the buyer arrived with (`preset`) stays in the URL with the filters.
 */
export function useListingState(urlState: FilterState, family: FamilySlug | undefined, preset?: Partial<QuoteContext>) {
  const [state, setState] = useState(urlState);
  // Follow the URL only when the URL itself changes (Back, header search);
  // our own debounced writes arrive matching the state already.
  const urlKey = serializeFilters(urlState);
  const [lastUrlKey, setLastUrlKey] = useState(urlKey);
  if (urlKey !== lastUrlKey) {
    setLastUrlKey(urlKey);
    if (urlKey !== serializeFilters(state)) setState(urlState);
  }

  const urlTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(urlTimer.current), []);
  const update = (patch: Partial<FilterState>) => {
    const next = { ...state, ...patch };
    if (family) next.family = undefined; // the route already says which family
    setState(next);
    // Native history update, no server round trip. Only typing needs debouncing; a compare selection must be
    // reflected in history before the buyer can follow the tray link.
    clearTimeout(urlTimer.current);
    const href = withDestination(`${window.location.pathname}${serializeFilters(next)}`, preset);
    const writeUrl = () => window.history.replaceState(null, "", href);
    if (patch.q !== undefined) urlTimer.current = setTimeout(writeUrl, 150);
    else writeUrl();
  };
  return { state, update };
}
