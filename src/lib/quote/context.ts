import { z } from "zod";
import { DELIVERY_COUNTRIES } from "@/lib/site";

/**
 * What the buyer needs (Design Doc 10, T8 "Quote list rules"). Saved with
 * the list for 14 days. Contact details are NOT part of this and are never
 * stored.
 */
export const NEEDS = ["supply", "install", "export", "software"] as const;
export const BUYER_TYPES = ["installer", "end-user", "consultant", "distributor"] as const;
export const TIMINGS = ["asap", "two-weeks", "month", "planning"] as const;
export const SITE_TYPES = ["office", "industrial", "retail", "hotel", "residential", "other"] as const;
/** The seven emirates (facts, not AIMS data). */
export const EMIRATES = [
  "abu-dhabi",
  "dubai",
  "sharjah",
  "ajman",
  "umm-al-quwain",
  "ras-al-khaimah",
  "fujairah",
] as const;

const text = (max: number) => z.string().max(max).optional();

export const QuoteContextSchema = z.object({
  need: z.enum(NEEDS).optional(),
  buyerType: z.enum(BUYER_TYPES).optional(),
  timing: z.enum(TIMINGS).optional(),
  // supply
  city: text(80),
  // install
  emirate: z.enum(EMIRATES).optional(),
  siteType: z.enum(SITE_TYPES).optional(),
  doors: text(6),
  users: text(6),
  existing: text(120),
  // export
  country: text(60),
  port: text(80),
  documents: text(160),
});

export type QuoteContext = z.infer<typeof QuoteContextSchema>;
export type Need = (typeof NEEDS)[number];

/**
 * A need preset from a link such as /quote?need=install (Design Doc 12, "Get an installation quote").
 * Anything else in the URL is ignored, so a bad link can't put invalid state into the saved list.
 */
export function needFromSearch(search: string): Need | undefined {
  const parsed = z.enum(NEEDS).safeParse(new URLSearchParams(search).get("need"));
  return parsed.success ? parsed.data : undefined;
}

/**
 * An export link such as /quote?need=export&country=Oman (Design Doc 10.1 T7 "set destination") arrives with
 * that destination. Only a market AIMS lists is accepted; anything else falls back to needFromSearch.
 */
export function destinationFromSearch(search: string): Pick<QuoteContext, "need" | "country" | "emirate"> | undefined {
  const params = new URLSearchParams(search);
  if (params.get("need") === "install" && params.get("emirate") === "dubai") {
    return { need: "install", emirate: "dubai" };
  }
  const country = z.enum(DELIVERY_COUNTRIES).safeParse(params.get("country"));
  return params.get("need") === "export" && country.success ? { need: "export", country: country.data } : undefined;
}

/** Carry only the market hint through internal shopping links, alongside the existing catalogue filters. */
export function withDestination(href: string, preset?: Partial<QuoteContext>): string {
  const params = new URLSearchParams();
  if (preset?.need === "export" && preset.country) {
    params.set("need", "export");
    params.set("country", preset.country);
  } else if (preset?.need === "install" && preset.emirate === "dubai") {
    params.set("need", "install");
    params.set("emirate", "dubai");
  }
  // toString, not .size: URLSearchParams.size is missing before Safari 17, where the market would silently drop.
  const query = params.toString();
  return query ? href + (href.includes("?") ? "&" : "?") + query : href;
}

/**
 * What a page's preset adds to the saved context: nothing once the buyer has chosen a need, so adding a model on
 * the Oman page never overwrites a choice made on the quote page (Design Doc 10, T8 "Quote list rules").
 */
export function presetPatch(
  current: QuoteContext | undefined,
  preset: Partial<QuoteContext> | undefined,
): Partial<QuoteContext> | undefined {
  return current?.need ? undefined : preset;
}
