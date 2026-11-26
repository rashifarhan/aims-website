"use client";

import { useSyncExternalStore } from "react";
import { dispatchQuote, getQuote, getServerQuote, lineKey, subscribeQuote } from "@/lib/quote/store";
import type { BeatData } from "./beatData";

const keyOf = (q: BeatData["quote"]) => (q.kind === "product" ? q.slug : `software-${q.slug}`);

/** "+ Add to quote list" on a beat's card, sharing the site's quote list (aims.quote.v1). */
export function AddToQuote({ quote, name }: { quote: BeatData["quote"]; name: string }) {
  const state = useSyncExternalStore(subscribeQuote, getQuote, getServerQuote);
  const added = state.lines.some((l) => lineKey(l) === keyOf(quote));
  const add = () =>
    dispatchQuote(quote.kind === "product" ? { type: "add", slug: quote.slug, qty: 1 } : { type: "requestSoftware", slug: quote.slug, text: quote.text });
  return (
    <button type="button" className="beat-add" data-added={added} onClick={added ? undefined : add} aria-label={added ? `${name} is on your quote list` : `Add ${name} to your quote list`}>
      {added ? "On your quote list ✓" : "+ Add to quote list"}
    </button>
  );
}

/** How many lines are on the quote list (for the header and the finale). */
export function useQuoteCount() {
  const state = useSyncExternalStore(subscribeQuote, getQuote, getServerQuote);
  return state.lines.length;
}

export function useQuoteKeys() {
  const state = useSyncExternalStore(subscribeQuote, getQuote, getServerQuote);
  return new Set(state.lines.map(lineKey));
}

export { keyOf as quoteKeyOf };
