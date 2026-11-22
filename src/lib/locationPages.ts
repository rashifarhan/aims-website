import { DUBAI_PATHS } from "@/i18n/config";
import type { QuoteContext } from "./quote/context";
import type { DeliveryMarket } from "./site";

/**
 * The T7 location pages (Master Plan 12 #32–35; Design Doc 10.1 T7). Dubai is the place to visit and the UAE
 * installation route; Oman and Kenya are delivery markets served from Dubai, and no office there is claimed.
 * `hero` is a product slug from content/products.json; `quote` is where both quote actions go; `preset` is what
 * adding a model on the page saves as the quote's destination (see presetPatch).
 */
export const LOCATION_PAGES = {
  dubai: { path: DUBAI_PATHS.en, hero: "proface-x", quote: "/quote?need=install", preset: undefined },
  oman: {
    path: "/zkteco-distributor-in-oman",
    hero: "speedface-v5l-p",
    quote: "/quote?need=export&country=Oman",
    preset: { need: "export", country: "Oman" },
  },
  kenya: {
    path: "/zkteco-distributors-in-kenya",
    hero: "biopro-mh30",
    quote: "/quote?need=export&country=Kenya",
    preset: { need: "export", country: "Kenya" },
  },
} as const satisfies Record<
  string,
  { path: string; hero: string; quote: string; preset: Partial<QuoteContext> | undefined }
>;

export type LocationMarket = keyof typeof LOCATION_PAGES;

/** Two terminals, a door controller and a lock (Plan 12 products): an editorial choice, not a sales ranking. */
export const LOCATION_MODELS = ["f18", "bio-pro-sa20", "inbio-pro-160", "al-m280"] as const;

/** A market with its own aimsuae.me page links there; every other market starts an export quote for it. */
export function marketHref(country: DeliveryMarket): string {
  if (country === "Oman") return LOCATION_PAGES.oman.path;
  if (country === "Kenya") return LOCATION_PAGES.kenya.path;
  return `/quote?need=export&country=${encodeURIComponent(country)}`;
}
