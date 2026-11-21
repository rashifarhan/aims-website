import { z } from "zod";

/**
 * What the buyer needs (Design Doc 10, T8 "Quote list rules"). Saved with
 * the list for 14 days. Contact details are NOT part of this and are never
 * stored.
 */
export const NEEDS = ["supply", "install", "export"] as const;
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
