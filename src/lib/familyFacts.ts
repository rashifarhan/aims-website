import type { ProductCard } from "@/content/cards";
import type { ProductType } from "@/content/taxonomy";
import type { Method } from "@/content/schema";

/** How many cards carry each value, in the order given, leaving out values no card carries. */
function tally<T extends string>(
  cards: ProductCard[],
  order: readonly T[],
  pick: (c: ProductCard) => readonly string[],
) {
  return order
    .map((value) => ({ value, count: cards.filter((c) => pick(c).includes(value)).length }))
    .filter((e) => e.count > 0);
}

export const VERIFY_ORDER: readonly Method[] = ["face", "palm", "fingerprint", "card", "qr", "pin", "mobile"];

/**
 * A family's facts for its ticket (direction 2, family pages): counts read from the catalogue cards only (CLAUDE.md,
 * Truth). Verification methods held by a single model are left out of the headline, so the row stays short.
 */
export function familyFacts(cards: ProductCard[], typeOrder: readonly ProductType[]) {
  return {
    total: cards.length,
    verify: tally(cards, VERIFY_ORDER, (c) => c.verify).filter((e) => e.count > 1),
    types: tally(cards, typeOrder, (c) => c.types),
    outdoor: cards.filter((c) => c.outdoor).length,
    brands: tally(cards, ["zkteco", "alpha"] as const, (c) => [c.brand]),
  };
}
