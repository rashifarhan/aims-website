import type { FamilySlug } from "@/content/taxonomy";

/**
 * The six product families as the two hero explorations show them (client exploration, 26 Nov 2026, branch
 * claude/hero-options), access control first and time attendance second at the client's request: one short word, one ground colour, AIMS's own photograph of a real model in that family
 * (cut out of its white studio background, public/images/cutouts), and real accessories that float around it.
 * Counts are read from the catalogue at render time; nothing here is invented.
 */
export type Cutout = { src: string; w: number; h: number; alt: string };
export type Bit = { img: Cutout; x: number; y: number; width: number; rotate: number; depth: number; blur?: boolean };

export type FamilyShow = {
  slug: FamilySlug;
  word: string;
  name: string;
  line: string;
  ground: string;
  hero: Cutout & { model: string; productSlug: string; x: number; y: number; width: number };
  facts: [string, string][];
  bits: Bit[];
};

const c = (file: string, w: number, h: number, alt: string): Cutout => ({
  src: `/images/cutouts/${file}.png`,
  w,
  h,
  alt,
});

const CARD = c("id-card-thick", 629, 403, "");
const READER = c("kr600", 376, 575, "");
const EXIT = c("alf-b21-exit-button", 513, 509, "");
const MAG = c("al-280d-led-electric-magnetic-door-lock-model", 730, 442, "");
const PANEL = c("inbio-pro-260", 822, 529, "");
const BARRIER = c("zkteco-barrier-gates-bgm-1060", 818, 292, "");
const HOTEL = c("zkteco-lh6500-door-lock", 411, 719, "");
const POS2 = c("zk1515-series", 243, 273, "");

/* Positions are in a 1440 × 900 design frame. Depth sets how far a piece drifts with the pointer and on a change. */
export const FAMILY_SHOW: FamilyShow[] = [
  {
    slug: "access-control",
    word: "ACCESS",
    name: "Access control",
    line: "Door readers, face terminals and controllers that decide who opens which door, and when.",
    ground: "#0f1f17",
    hero: {
      ...c("speedface-v5l", 362, 776, "ZKTeco SpeedFace-V5L face recognition terminal"),
      model: "SpeedFace-V5L",
      productSlug: "speedface-v5l-p",
      x: 580,
      y: 110,
      width: 280,
    },
    facts: [
      ["Verifies", "Face · palm · fingerprint · card"],
      ["Type", "Access control terminal"],
    ],
    bits: [
      { img: PANEL, x: 250, y: 200, width: 240, rotate: -10, depth: 0.6 },
      { img: READER, x: 1000, y: 210, width: 115, rotate: 10, depth: 0.8 },
      { img: CARD, x: 300, y: 540, width: 150, rotate: 12, depth: 0.5 },
      { img: MAG, x: 960, y: 590, width: 220, rotate: -8, depth: 0.7 },
      { img: PANEL, x: -60, y: 620, width: 300, rotate: 14, depth: 1.4, blur: true },
      { img: CARD, x: 1280, y: 30, width: 200, rotate: -16, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "time-attendance",
    word: "TIME",
    name: "Time attendance",
    line: "Face, palm, fingerprint and card terminals that clock staff in, synced to BioTime.",
    ground: "#26703a",
    hero: {
      ...c("zkteco-iface-990-plus", 675, 650, "ZKTeco iFace 990 Plus attendance terminal"),
      model: "iFace 990 Plus",
      productSlug: "zkteco-iface-990-plus",
      x: 500,
      y: 250,
      width: 440,
    },
    facts: [
      ["Type", "Multi-biometric terminal"],
      ["Use", "Attendance and access"],
    ],
    bits: [
      { img: CARD, x: 330, y: 170, width: 150, rotate: -14, depth: 0.6 },
      { img: READER, x: 1010, y: 200, width: 110, rotate: 9, depth: 0.8 },
      { img: EXIT, x: 280, y: 520, width: 120, rotate: -8, depth: 0.5 },
      { img: MAG, x: 980, y: 600, width: 200, rotate: -12, depth: 0.7 },
      { img: CARD, x: -40, y: 610, width: 280, rotate: 18, depth: 1.4, blur: true },
      { img: READER, x: 1290, y: 20, width: 170, rotate: -10, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "entrance-control",
    word: "ENTRY",
    name: "Entrance & parking",
    line: "Speed gates, turnstiles and parking barriers that let the right people and cars through.",
    ground: "#2c5a4d",
    hero: {
      ...c("zkteco-mars-b1200-double-swing-barrier-gate", 500, 588, "ZKTeco MARS-B1200 swing barrier gate"),
      model: "MARS-B1200",
      productSlug: "zkteco-mars-b1200-double-swing-barrier-gate",
      x: 450,
      y: 170,
      width: 540,
    },
    facts: [
      ["Type", "Double swing barrier"],
      ["Range", "Gates · turnstiles · barriers"],
    ],
    bits: [
      { img: CARD, x: 300, y: 180, width: 150, rotate: -14, depth: 0.6 },
      { img: READER, x: 1040, y: 190, width: 105, rotate: 10, depth: 0.8 },
      { img: BARRIER, x: 1000, y: 610, width: 300, rotate: -4, depth: 0.7 },
      { img: EXIT, x: 260, y: 560, width: 110, rotate: -8, depth: 0.5 },
      { img: CARD, x: -40, y: 620, width: 280, rotate: 20, depth: 1.4, blur: true },
      { img: READER, x: 1290, y: 20, width: 170, rotate: -12, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "door-locks",
    word: "LOCKS",
    name: "Smart & hotel locks",
    line: "Fingerprint and keypad smart locks for offices and homes, RFID locks for hotels.",
    ground: "#4b5a34",
    hero: {
      ...c("zkteco-tl700-fingerprint-smart-door-lock", 739, 698, "ZKTeco TL700 fingerprint smart door lock"),
      model: "TL700",
      productSlug: "zkteco-tl700-fingerprint-smart-door-lock",
      x: 470,
      y: 230,
      width: 500,
    },
    facts: [
      ["Opens with", "Fingerprint"],
      ["Also in range", "RFID hotel locks"],
    ],
    bits: [
      { img: HOTEL, x: 290, y: 160, width: 120, rotate: -10, depth: 0.6 },
      { img: CARD, x: 1010, y: 210, width: 150, rotate: 12, depth: 0.8 },
      { img: EXIT, x: 300, y: 560, width: 110, rotate: -8, depth: 0.5 },
      { img: CARD, x: 1000, y: 600, width: 150, rotate: -16, depth: 0.7 },
      { img: HOTEL, x: -20, y: 560, width: 190, rotate: 16, depth: 1.4, blur: true },
      { img: CARD, x: 1280, y: 30, width: 200, rotate: -14, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "door-hardware",
    word: "PARTS",
    name: "Door hardware & accessories",
    line: "EM locks, exit buttons, readers, cards and power supplies for every controlled door.",
    ground: "#32453c",
    hero: {
      ...c("al-280d-led-electric-magnetic-door-lock-model", 730, 442, "Alpha AL-280D electromagnetic door lock"),
      model: "AL 280D",
      productSlug: "al-280d-led-electric-magnetic-door-lock-model",
      x: 400,
      y: 290,
      width: 640,
    },
    facts: [
      ["Type", "Electromagnetic lock"],
      ["Brands", "Alpha · ZKTeco"],
    ],
    bits: [
      { img: EXIT, x: 300, y: 170, width: 125, rotate: -10, depth: 0.6 },
      { img: READER, x: 1030, y: 190, width: 110, rotate: 10, depth: 0.8 },
      { img: CARD, x: 190, y: 640, width: 150, rotate: 14, depth: 0.5 },
      { img: MAG, x: 980, y: 610, width: 210, rotate: -10, depth: 0.7 },
      { img: EXIT, x: -20, y: 600, width: 230, rotate: 16, depth: 1.4, blur: true },
      { img: READER, x: 1290, y: 20, width: 170, rotate: -12, depth: 1.3, blur: true },
    ],
  },
  {
    slug: "pos",
    word: "POS",
    name: "POS systems",
    line: "Windows and Android point-of-sale terminals and the peripherals around them.",
    ground: "#1d3b31",
    hero: {
      ...c("zkaio1000", 215, 274, "ZKTeco ZKAIO1000 all-in-one POS terminal"),
      model: "ZKAIO1000",
      productSlug: "zkaio1000",
      x: 540,
      y: 200,
      width: 360,
    },
    facts: [
      ["Runs", "Android"],
      ["Type", "All-in-one POS"],
    ],
    bits: [
      { img: POS2, x: 300, y: 190, width: 170, rotate: -10, depth: 0.6 },
      { img: CARD, x: 1030, y: 210, width: 150, rotate: 12, depth: 0.8 },
      { img: READER, x: 300, y: 560, width: 105, rotate: -8, depth: 0.5 },
      { img: POS2, x: 1010, y: 580, width: 160, rotate: 10, depth: 0.7 },
      { img: CARD, x: -40, y: 620, width: 280, rotate: 18, depth: 1.4, blur: true },
      { img: POS2, x: 1290, y: 20, width: 170, rotate: -12, depth: 1.3, blur: true },
    ],
  },
];
