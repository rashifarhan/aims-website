/**
 * The door kit (Design Doc 10, FIG 10.7; approved prototype docs/prototypes/door-kit): every
 * controlled door takes a reader, an EM lock and an exit button; one InBio Pro panel runs the
 * doors; each user gets a card. Models and door counts come from the catalogue's own spec rows
 * ("Doors controlled": 1, 2 and 4 doors), never from memory (CLAUDE.md §1).
 */

export const KIT_LIMITS = { minDoors: 1, maxDoors: 4, minUsers: 10, maxUsers: 500, userStep: 10 } as const;

/** Panels by the doors they control (InBio Pro 160 / 260 / 460). */
export const CONTROLLERS = [
  { slug: "inbio-pro-160", doors: 1 },
  { slug: "inbio-pro-260", doors: 2 },
  { slug: "inbio-pro-460", doors: 4 },
] as const;

export const KIT_PARTS = {
  reader: "kr602",
  lock: "al-m280",
  exit: "alf-b21-exit-button",
  card: "id-card-thin",
} as const;

export type KitPart = keyof typeof KIT_PARTS | "controller";
export type KitLine = { part: KitPart; slug: string; qty: number };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

/** The smallest panel that runs every door. */
export function controllerFor(doors: number): (typeof CONTROLLERS)[number] {
  const d = clamp(doors, KIT_LIMITS.minDoors, KIT_LIMITS.maxDoors);
  // The last panel runs four doors, the maximum, so find() always succeeds.
  return CONTROLLERS.find((c) => c.doors >= d) ?? CONTROLLERS[CONTROLLERS.length - 1];
}

/** The product lines a kit adds to the quote, in the order the story shows them. */
export function doorKitLines(doors: number, users: number): KitLine[] {
  const d = clamp(doors, KIT_LIMITS.minDoors, KIT_LIMITS.maxDoors);
  const u = clamp(users, KIT_LIMITS.minUsers, KIT_LIMITS.maxUsers);
  return [
    { part: "reader", slug: KIT_PARTS.reader, qty: d },
    { part: "controller", slug: controllerFor(d).slug, qty: 1 },
    { part: "lock", slug: KIT_PARTS.lock, qty: d },
    { part: "exit", slug: KIT_PARTS.exit, qty: d },
    { part: "card", slug: KIT_PARTS.card, qty: u },
  ];
}

/** Step a count within the kit's limits. */
export function stepKit(key: "doors" | "users", value: number, direction: 1 | -1): number {
  return key === "doors"
    ? clamp(value + direction, KIT_LIMITS.minDoors, KIT_LIMITS.maxDoors)
    : clamp(value + direction * KIT_LIMITS.userStep, KIT_LIMITS.minUsers, KIT_LIMITS.maxUsers);
}
