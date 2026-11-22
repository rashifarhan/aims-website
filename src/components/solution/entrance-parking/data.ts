import "server-only";
import { defineSolutionPage } from "@/content/solutionPages";
import { SOLUTION_CARDS } from "@/content/solutions";
import type { ProductType } from "@/content/taxonomy";

/**
 * /solutions/entrance-parking on the T3 template (Master Plan 12 #17, 14). The route slug is
 * entrance-parking; the catalogue family is entrance-control, so every count comes from that family.
 */
export const EP_PAGE = defineSolutionPage({
  slug: "entrance-parking",
  family: "entrance-control",
  // The hub card's product, so hub and page show the same photograph (as time attendance does).
  hero: SOLUTION_CARDS.find((card) => card.slug === "entrance-parking")?.product ?? "barrier-gates-bgm-1045",
  // One model per kind of lane (tripod, flap, swing, full height, boom, plate recognition); none repeats
  // the hero. An editorial choice, not stock or sales data (CLAUDE.md §1).
  products: [
    "zkteco-ts1022-pro-tripod-turnstile-w-controller-and-combination-of-fingerprint-rfid-reader",
    "fbl5000",
    "zkteco-mars-b1022-single-lane-swing-barrier-turnstile",
    "fht2300d",
    "zkteco-barrier-gates-bgm-1060",
    "lprs4000",
  ],
  // Only the two platforms whose own data names parking (CVSecurity overview, Bio Security 3.2 summary).
  software: [
    { slug: "zkbio-cvsecurity", kind: "platform", purpose: "purposeCvsecurity" },
    { slug: "bio-security-3-2", kind: "platform", purpose: "purposeBioSecurity" },
  ],
  quote: "/quote?need=install",
});

/** A model code shown as a chip; `code` is the short code from the product's own model name. */
type Example = { slug: string; code: string };

/**
 * "Choose the lane": four kinds of lane. The listing's type filter only knows AIMS's own categories
 * (pedestrian, parking), so a card can't carry an honest count of its own; it names two example models
 * and the counts sit on the two filter links below the grid (prep §3).
 */
export const EP_OPTIONS = [
  {
    key: "tripod",
    icon: "M5 10h7v18H5Zm7 4 15-5m-15 5 13 8m-13-8 5 12M3 28h26",
    examples: [
      {
        slug: "zkteco-ts1022-pro-tripod-turnstile-w-controller-and-combination-of-fingerprint-rfid-reader",
        code: "TS1022 Pro",
      },
      { slug: "zkteco-ts1011-pro-tripod-turnstile", code: "TS1011 Pro" },
    ],
  },
  {
    key: "speed",
    icon: "M3 8h6v20H3Zm20 0h6v20h-6ZM9 13h6v9H9Zm8 0h6v9h-6Z",
    examples: [
      { slug: "fbl5000", code: "FBL5000" },
      { slug: "zkteco-mars-b1022-single-lane-swing-barrier-turnstile", code: "MARS-B1022" },
    ],
  },
  {
    key: "full",
    icon: "M5 4h22M5 28h22M8 4v24m16-24v24M16 4v24M8 10h16M8 16h16M8 22h16",
    examples: [
      { slug: "fht2300d", code: "FHT2300D" },
      { slug: "fht2400d", code: "FHT2400D" },
    ],
  },
  {
    key: "vehicle",
    icon: "M5 13h6v15H5Zm6 3 18-7M3 28h26",
    examples: [
      { slug: "zkteco-barrier-gates-bgm-1060", code: "BGM1060" },
      { slug: "lprs4000", code: "LPRS4000" },
    ],
  },
] as const satisfies readonly { key: string; icon: string; examples: readonly Example[] }[];

/** The listing's own type filters under the family, in the order the options use them. */
export const EP_TYPES = ["pedestrian", "parking"] as const satisfies readonly ProductType[];

/** Model codes drawn in the lanes moment; codes stay untranslated (Design Doc 13). */
export const LANE_MODELS = {
  swing: "MARS-B1022",
  plate: "LPRS4000",
  barrier: "BGM1060",
  radar: "VR10",
} as const;
