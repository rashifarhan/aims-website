import "server-only";
import type { SolutionSlug } from "@/lib/nav";
import type { FamilySlug } from "./taxonomy";

/** T2 scope: existing catalogue examples, not recommended or preconfigured kits. */
export const SOLUTION_CARDS = [
  { slug: "time-attendance", family: "time-attendance", product: "f18" },
  { slug: "access-control", family: "access-control", product: "zkteco-speedface-v5l-qr" },
  { slug: "entrance-parking", family: "entrance-control", product: "barrier-gates-bgm-1045" },
  { slug: "door-locks", family: "door-locks", product: "zkteco-tl800-wi-fi-smart-digital-lock" },
  { slug: "pos", family: "pos", product: "zkaio1000" },
] as const satisfies readonly { slug: SolutionSlug; family: FamilySlug; product: string }[];

export type SolutionCardData = (typeof SOLUTION_CARDS)[number];
