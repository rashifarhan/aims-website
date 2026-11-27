import type { FamilySlug } from "@/content/taxonomy";

/**
 * The six families as the home dive shows them inside the terminal's screen (direction 2; handoff, client order:
 * access control first, time attendance second). Each shows AIMS's own photograph of a real model, cut out of its
 * white studio background (public/images/cutouts, docs/handoff/cutout.py). Words, lines and facts are copy
 * (messages: home.inside.families); counts come from the catalogue at render time. Nothing here is invented.
 */
export type Cutout = { src: string; w: number; h: number };

export type ShowcaseFamily = {
  slug: FamilySlug;
  model: string;
  productSlug: string;
  image: Cutout;
};

const cut = (file: string, w: number, h: number): Cutout => ({ src: `/images/cutouts/${file}.png`, w, h });

export const SHOWCASE: readonly ShowcaseFamily[] = [
  {
    slug: "access-control",
    model: "SpeedFace-V5L",
    productSlug: "speedface-v5l-p",
    image: cut("speedface-v5l", 362, 776),
  },
  {
    slug: "time-attendance",
    model: "iFace 990 Plus",
    productSlug: "zkteco-iface-990-plus",
    image: cut("zkteco-iface-990-plus", 675, 650),
  },
  {
    slug: "entrance-control",
    model: "MARS-B1200",
    productSlug: "zkteco-mars-b1200-double-swing-barrier-gate",
    image: cut("zkteco-mars-b1200-double-swing-barrier-gate", 500, 588),
  },
  {
    slug: "door-locks",
    model: "TL700",
    productSlug: "zkteco-tl700-fingerprint-smart-door-lock",
    image: cut("zkteco-tl700-fingerprint-smart-door-lock", 739, 698),
  },
  {
    slug: "door-hardware",
    model: "AL 280D",
    productSlug: "al-280d-led-electric-magnetic-door-lock-model",
    image: cut("al-280d-led-electric-magnetic-door-lock-model", 730, 442),
  },
  { slug: "pos", model: "ZKAIO1000", productSlug: "zkaio1000", image: cut("zkaio1000", 215, 274) },
];

/** The cut-outs the stages use outside the showcase. */
export const CUTOUTS = {
  speedface: cut("speedface-v5l", 362, 776),
  card: cut("id-card-thick", 629, 403),
  iface: cut("zkteco-iface-990-plus", 675, 650),
} as const;
