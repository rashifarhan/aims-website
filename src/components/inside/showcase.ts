import type { FamilySlug } from "@/content/taxonomy";

/**
 * The six families as the home dive shows them inside the terminal's screen (direction 2; handoff, client order:
 * access control first, time attendance second). Each shows AIMS's own photograph of a real model, cut out of its
 * white studio background (public/images/cutouts, lifted with Apple's Vision subject lift: docs/handoff/lift). Words, lines and facts are copy
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
    productSlug: "zkteco-speedface-v5l-qr",
    image: cut("speedface-v5l", 352, 765),
  },
  {
    slug: "time-attendance",
    model: "iFace 990 Plus",
    productSlug: "zkteco-iface-990-plus",
    image: cut("zkteco-iface-990-plus", 672, 673),
  },
  {
    slug: "entrance-control",
    model: "MARS-B1200",
    productSlug: "zkteco-mars-b1200-double-swing-barrier-gate",
    image: cut("zkteco-mars-b1200-double-swing-barrier-gate", 493, 581),
  },
  {
    slug: "door-locks",
    model: "TL700",
    productSlug: "zkteco-tl700-fingerprint-smart-door-lock",
    image: cut("zkteco-tl700-fingerprint-smart-door-lock", 734, 693),
  },
  {
    slug: "door-hardware",
    model: "AL 280D",
    productSlug: "al-280d-led-electric-magnetic-door-lock-model",
    image: cut("al-280d-led-electric-magnetic-door-lock-model", 726, 392),
  },
  { slug: "pos", model: "ZKAIO1000", productSlug: "zkaio1000", image: cut("zkaio1000", 209, 268) },
];

/** The cut-outs the stages use outside the showcase. */
export const CUTOUTS = {
  speedface: cut("speedface-v5l", 352, 765),
  card: cut("id-card-thick", 626, 402),
  iface: cut("zkteco-iface-990-plus", 672, 673),
} as const;
