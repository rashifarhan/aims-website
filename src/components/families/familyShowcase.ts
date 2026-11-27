import type { FamilySlug } from "@/content/taxonomy";

/**
 * The six product families as direction 3 stages them (CLAUDE.md → Design rules; after MotionSites "Smoothie
 * Slider"), access control first and time attendance second at the client's request: one giant word, one ground
 * token, AIMS's own photograph of a real model in that family (cut out of its white studio background,
 * public/images/cutouts) and real accessories that float around it. Names, summaries, counts and range lines come
 * from the dictionary and the catalogue at render time; nothing here is a claim.
 */
export type Cutout = { src: string; w: number; h: number };
export type Bit = { img: Cutout; x: number; y: number; width: number; rotate: number; depth: number; blur?: boolean };

export type FamilyShow = {
  slug: FamilySlug;
  /** The giant word, a mark rather than copy: it stays Latin on Arabic pages (Design rules → Type). */
  word: string;
  /** The word's advance width in em, measured in Archivo 900 at 125% with the giant tracking, so CSS can fit it. */
  wordEm: number;
  /** A `--color-ground-*` token. */
  ground: string;
  hero: Cutout & { model: string; productSlug: string; x: number; y: number; width: number };
  /** The hero product's width on a family tile, as a share of the tile. */
  tileWidth: number;
  bits: Bit[];
};

const c = (file: string, w: number, h: number): Cutout => ({ src: `/images/cutouts/${file}.png`, w, h });

const CARD = c("id-card-thick", 629, 403);
const READER = c("kr600", 376, 575);
const EXIT = c("alf-b21-exit-button", 513, 509);
const MAG = c("al-280d-led-electric-magnetic-door-lock-model", 730, 442);
const PANEL = c("inbio-pro-260", 822, 529);
const BARRIER = c("zkteco-barrier-gates-bgm-1060", 818, 292);
const HOTEL = c("zkteco-lh6500-door-lock", 411, 719);
const POS2 = c("zk1515-series", 243, 273);

/* Positions are in the 1440 × 900 design frame. The headline owns the top-left corner (x < 460, y < 330), so no
   piece sits there. Depth sets how far a piece drifts with the pointer. */
export const FAMILY_SHOW: FamilyShow[] = [
  {
    slug: "access-control",
    word: "ACCESS",
    wordEm: 5.206,
    ground: "var(--color-ground-access)",
    hero: {
      ...c("speedface-v5l", 362, 776),
      model: "SpeedFace V5L-P",
      productSlug: "speedface-v5l-p",
      x: 580,
      y: 150,
      width: 280,
    },
    tileWidth: 34,
    bits: [
      { img: PANEL, x: 260, y: 330, width: 190, rotate: -10, depth: 0.6 },
      { img: READER, x: 1000, y: 230, width: 115, rotate: 10, depth: 0.8 },
      { img: CARD, x: 300, y: 560, width: 150, rotate: 12, depth: 0.5 },
      { img: MAG, x: 960, y: 610, width: 220, rotate: -8, depth: 0.7 },
      { img: PANEL, x: -60, y: 640, width: 300, rotate: 14, depth: 1.4, blur: true },
      { img: CARD, x: 1280, y: 50, width: 200, rotate: -16, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "time-attendance",
    word: "TIME",
    wordEm: 3.17,
    ground: "var(--color-ground-time)",
    hero: {
      ...c("zkteco-iface-990-plus", 675, 650),
      model: "iFace 990 Plus",
      productSlug: "zkteco-iface-990-plus",
      x: 500,
      y: 270,
      width: 440,
    },
    tileWidth: 44,
    bits: [
      { img: CARD, x: 300, y: 345, width: 140, rotate: -14, depth: 0.6 },
      { img: READER, x: 1010, y: 220, width: 110, rotate: 9, depth: 0.8 },
      { img: EXIT, x: 280, y: 540, width: 120, rotate: -8, depth: 0.5 },
      { img: MAG, x: 980, y: 620, width: 200, rotate: -12, depth: 0.7 },
      { img: CARD, x: -40, y: 630, width: 280, rotate: 18, depth: 1.4, blur: true },
      { img: READER, x: 1290, y: 40, width: 170, rotate: -10, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "entrance-control",
    word: "ENTRY",
    wordEm: 4.448,
    ground: "var(--color-ground-entry)",
    hero: {
      ...c("zkteco-mars-b1200-double-swing-barrier-gate", 500, 588),
      model: "MARS-B1200",
      productSlug: "zkteco-mars-b1200-double-swing-barrier-gate",
      x: 450,
      y: 190,
      width: 540,
    },
    tileWidth: 60,
    bits: [
      { img: CARD, x: 290, y: 345, width: 140, rotate: -14, depth: 0.6 },
      { img: READER, x: 1040, y: 210, width: 105, rotate: 10, depth: 0.8 },
      { img: BARRIER, x: 1000, y: 630, width: 300, rotate: -4, depth: 0.7 },
      { img: EXIT, x: 260, y: 580, width: 110, rotate: -8, depth: 0.5 },
      { img: CARD, x: -40, y: 640, width: 280, rotate: 20, depth: 1.4, blur: true },
      { img: READER, x: 1290, y: 40, width: 170, rotate: -12, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "door-locks",
    word: "LOCKS",
    wordEm: 4.378,
    ground: "var(--color-ground-locks)",
    hero: {
      ...c("zkteco-tl700-fingerprint-smart-door-lock", 739, 698),
      model: "TL700",
      productSlug: "zkteco-tl700-fingerprint-smart-door-lock",
      x: 470,
      y: 250,
      width: 500,
    },
    tileWidth: 52,
    bits: [
      { img: HOTEL, x: 320, y: 300, width: 90, rotate: -10, depth: 0.6 },
      { img: CARD, x: 1010, y: 230, width: 150, rotate: 12, depth: 0.8 },
      { img: EXIT, x: 300, y: 580, width: 110, rotate: -8, depth: 0.5 },
      { img: CARD, x: 1000, y: 620, width: 150, rotate: -16, depth: 0.7 },
      { img: HOTEL, x: -20, y: 580, width: 190, rotate: 16, depth: 1.4, blur: true },
      { img: CARD, x: 1280, y: 50, width: 200, rotate: -14, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "door-hardware",
    word: "PARTS",
    wordEm: 4.266,
    ground: "var(--color-ground-parts)",
    hero: {
      ...c("al-280d-led-electric-magnetic-door-lock-model", 730, 442),
      model: "AL 280D(LED)",
      productSlug: "al-280d-led-electric-magnetic-door-lock-model",
      x: 400,
      y: 310,
      width: 640,
    },
    tileWidth: 70,
    bits: [
      { img: EXIT, x: 250, y: 330, width: 115, rotate: -10, depth: 0.6 },
      { img: READER, x: 1030, y: 210, width: 110, rotate: 10, depth: 0.8 },
      { img: CARD, x: 190, y: 660, width: 150, rotate: 14, depth: 0.5 },
      { img: MAG, x: 980, y: 630, width: 210, rotate: -10, depth: 0.7 },
      { img: EXIT, x: -20, y: 620, width: 230, rotate: 16, depth: 1.4, blur: true },
      { img: READER, x: 1290, y: 40, width: 170, rotate: -12, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "pos",
    word: "POS",
    wordEm: 2.65,
    ground: "var(--color-ground-pos)",
    hero: {
      ...c("zkaio1000", 215, 274),
      model: "ZKAIO1000",
      productSlug: "zkaio1000",
      x: 540,
      y: 220,
      width: 360,
    },
    tileWidth: 36,
    bits: [
      { img: POS2, x: 290, y: 330, width: 150, rotate: -10, depth: 0.6 },
      { img: CARD, x: 1030, y: 230, width: 150, rotate: 12, depth: 0.8 },
      { img: READER, x: 300, y: 580, width: 105, rotate: -8, depth: 0.5 },
      { img: POS2, x: 1010, y: 600, width: 160, rotate: 10, depth: 0.7 },
      { img: CARD, x: -40, y: 640, width: 280, rotate: 18, depth: 1.4, blur: true },
      { img: POS2, x: 1290, y: 40, width: 170, rotate: -12, depth: 1.3, blur: true },
    ],
  },
];

/** The closing band's word and pieces (the home page's last flood). */
export const QUOTE_WORD = { word: "QUOTE", wordEm: 4.537 } as const;
export const QUOTE_BITS: Bit[] = [
  { img: CARD, x: 250, y: 170, width: 150, rotate: -14, depth: 0.6 },
  { img: EXIT, x: 1180, y: 650, width: 110, rotate: 10, depth: 0.7 },
  { img: CARD, x: -40, y: 600, width: 280, rotate: 18, depth: 1.4, blur: true },
  { img: READER, x: 1260, y: 40, width: 170, rotate: -10, depth: 1.3, blur: true },
];
