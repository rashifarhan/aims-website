"use client";

import { useRef, useState } from "react";
import type { FamilySlug } from "@/content/taxonomy";
import { serializeFilters, type FilterState } from "@/lib/filters";

/**
 * The listing's filter state, mirrored to the URL (AT-03): clicks update React state at once and the URL
 * shortly after; the URL wins again when it changes from outside (Back/Forward, the header search).
 */
export function useListingState(urlState: FilterState, family: FamilySlug | undefined) {
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
  const update = (patch: Partial<FilterState>) => {
    const next = { ...state, ...patch };
    if (family) next.family = undefined; // the route already says which family
    setState(next);
    // Debounced native history update: no server round trip, and typing
    // doesn't flood the history API.
    clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(
      () => window.history.replaceState(null, "", `${window.location.pathname}${serializeFilters(next)}`),
      150,
    );
  };
  return { state, update };
}
