"use client";

import { useSyncExternalStore } from "react";
import { dispatchQuote, getQuote, getServerQuote, subscribeQuote } from "./store";

/** The quote list. Empty on the server and during hydration, real afterwards. */
export function useQuote() {
  return useSyncExternalStore(subscribeQuote, getQuote, getServerQuote);
}

export { dispatchQuote };
