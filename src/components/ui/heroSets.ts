/**
 * The inner heroes whose subject is not one product show a set of AIMS's own products instead of a drawing
 * (CLAUDE.md → Design rules → Imagery: "a place is shown by the product that goes there"). Each piece is a catalogue
 * product by slug, placed on the plinth in percent of its 5:4 box: `x`/`y` its top start corner, `w` its width.
 * The photographs' white studio grounds multiply away.
 */
export type SetPiece = { slug: string; x: number; y: number; w: number };

/* One composition for every set: the lead product large at the back, two in front at the corners. Every square photo
   stays inside the 5:4 box (x + w ≤ 100, y + 1.25w ≤ 100; the lead may start above it, into its own white) and the products, which sit in the middle of their
   photographs, never touch. */
const HERO = { x: 17, y: -4, w: 66 };
const FRONT_START = { x: 0, y: 50, w: 40 };
const FRONT_END = { x: 60, y: 50, w: 40 };

export const HERO_SETS = {
  // Supply, installation and support: what an installer fits at one door.
  services: [
    { slug: "speedface-v5l-p", ...HERO },
    { slug: "inbio-pro-260", ...FRONT_START },
    { slug: "alf-b21-exit-button", ...FRONT_END },
  ],
  // The company: one product from across the range AIMS supplies.
  company: [
    { slug: "zkteco-iface-990-plus", ...HERO },
    { slug: "zkteco-tl700-fingerprint-smart-door-lock", ...FRONT_START },
    { slug: "zkaio1000", ...FRONT_END },
  ],
  // The showroom and the offices: what a visitor sees and what ships from them.
  offices: [
    { slug: "zkteco-barrier-gates-bgm-1060", ...HERO },
    { slug: "f18", ...FRONT_START },
    { slug: "zkteco-lh6500-door-lock", ...FRONT_END },
  ],
} as const satisfies Record<string, readonly SetPiece[]>;

export type HeroSetName = keyof typeof HERO_SETS;
