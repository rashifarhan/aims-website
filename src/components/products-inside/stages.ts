import type { FamilySlug } from "@/content/taxonomy";
import type { SolutionSlug } from "@/lib/nav";
import { SHOWCASE, type Cutout } from "@/components/inside/showcase";
import type { LocationMarket } from "@/lib/locationPages";

/**
 * The product each products page stands on its stage (direction 2: a different real AIMS product on every stage).
 * Photographs are AIMS's own, lifted off their studio white (docs/handoff/lift). Model codes are product data and
 * stay as AIMS names them.
 */
export type ProductStage = {
  model: string;
  productSlug: string;
  image: Cutout;
};

const cut = (file: string, w: number, h: number): Cutout => ({ src: `/images/cutouts/${file}.png`, w, h });

export const FAMILY_STAGES: Record<FamilySlug, ProductStage> = {
  "access-control": {
    model: "BioFace B1",
    productSlug: "bioface-b1",
    image: cut("bioface-b1", 331, 697),
  },
  "time-attendance": {
    model: "iFace 990 Plus",
    productSlug: "zkteco-iface-990-plus",
    image: cut("zkteco-iface-990-plus", 672, 673),
  },
  "entrance-control": {
    model: "MARS-B1200",
    productSlug: "zkteco-mars-b1200-double-swing-barrier-gate",
    image: cut("zkteco-mars-b1200-double-swing-barrier-gate", 493, 581),
  },
  "door-locks": {
    model: "TL800",
    productSlug: "zkteco-tl800-wi-fi-smart-digital-lock",
    image: cut("zkteco-tl800", 145, 671),
  },
  "door-hardware": {
    model: "ALF B21",
    productSlug: "alf-b21-exit-button",
    image: cut("alf-b21-exit-button", 504, 509),
  },
  pos: {
    model: "ZK1515",
    productSlug: "zk1515-series",
    image: cut("zk1515-series", 200, 247),
  },
};

/** /solutions: the InBio Pro 260 controller, the box every install wires back to; the dive flies into its face. */
/**
 * The solution pages' stages: again a product no other stage shows (direction 2), each one a part of that need's
 * install: the Horus H1 clocking in, a KR600 reader at the door, the BGM 1060 barrier (it dives into its cabinet's
 * face), the LH6500 hotel lock (its reader panel) and the ZKAIO1000 counter.
 */
export const SOLUTION_STAGES: Record<SolutionSlug, ProductStage> = {
  "time-attendance": {
    model: "Horus H1",
    productSlug: "zkteco-horus-h1",
    image: cut("zkteco-horus-h1", 331, 725),
  },
  "access-control": {
    model: "KR600",
    productSlug: "kr600",
    image: cut("kr600", 368, 570),
  },
  "entrance-parking": {
    model: "BGM 1060",
    productSlug: "zkteco-barrier-gates-bgm-1060",
    image: cut("zkteco-barrier-gates-bgm-1060", 814, 282),
  },
  "door-locks": {
    model: "LH6500",
    productSlug: "zkteco-lh6500-door-lock",
    image: cut("zkteco-lh6500-door-lock", 404, 714),
  },
  pos: {
    model: "ZKAIO1000",
    productSlug: "zkaio1000",
    image: cut("zkaio1000", 209, 268),
  },
};

/** The families in the client's order (handoff: access control first, time attendance second), as on the home page. */
export const FAMILY_ORDER: readonly FamilySlug[] = SHOWCASE.map((f) => f.slug);

/**
 * The location pages' stages (T7): the page's own hero model (lib/locationPages `hero`), lifted like the others.
 * Dubai is the showroom's terminal; Oman and Kenya are supplied from Dubai, so their products are the ones exported.
 */
export const LOCATION_STAGES: Record<LocationMarket, ProductStage> = {
  dubai: {
    model: "ProFace X",
    productSlug: "proface-x",
    image: cut("proface-x", 446, 712),
  },
  oman: {
    model: "SpeedFace V5L-P",
    productSlug: "speedface-v5l-p",
    image: cut("speedface-v5l-p", 318, 725),
  },
  kenya: {
    model: "BioPro MH30",
    productSlug: "biopro-mh30",
    image: cut("biopro-mh30", 596, 617),
  },
};
