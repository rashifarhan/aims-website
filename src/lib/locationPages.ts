import type { QuoteContext } from "./quote/context";
import { DUBAI_PATHS } from "@/i18n/config";

/** Master Plan ch. 12, T7: UAE visit versus delivery from Dubai. No overseas premises are claimed. */
export const LOCATION_PAGES = {
  dubai: { path: DUBAI_PATHS.en, quote: "/quote?need=install", context: { need: "install", emirate: "dubai" } },
  oman: {
    path: "/zkteco-distributor-in-oman",
    quote: "/quote?need=export&country=Oman",
    context: { need: "export", country: "Oman" },
  },
  kenya: {
    path: "/zkteco-distributors-in-kenya",
    quote: "/quote?need=export&country=Kenya",
    context: { need: "export", country: "Kenya" },
  },
} as const satisfies Record<string, { path: string; quote: string; context: Partial<QuoteContext> }>;

export type LocationMarket = keyof typeof LOCATION_PAGES;

/** Selection across attendance and door access; no unsupported best-seller ranking. */
export const LOCATION_MODELS = ["f18", "bio-pro-sa20", "zkteco-speedface-v5l-qr", "inbio-pro-160"] as const;
