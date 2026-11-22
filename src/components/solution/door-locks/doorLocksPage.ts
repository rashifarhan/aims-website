import "server-only";
import { defineSolutionPage } from "@/content/solutionPages";
import { SOLUTION_CARDS } from "@/content/solutions";
import { productsInFamily } from "@/content/catalogue";
import { typesFor, type ProductType } from "@/content/taxonomy";

/** /solutions/door-locks (Master Plan 12 #18): the hub card's lock leads, so hub and page match. */
export const DOOR_LOCKS_PAGE = defineSolutionPage({
  slug: "door-locks",
  family: "door-locks",
  hero: SOLUTION_CARDS.find((card) => card.slug === "door-locks")?.product ?? "zkteco-tl800-wi-fi-smart-digital-lock",
  // Smart locks for homes, the glass door lock, the face lock, then two hotel card locks: an editorial pick.
  products: [
    "zkteco-tl700-fingerprint-smart-door-lock",
    "tl100",
    "gl300",
    "zkteco-hbl400",
    "lh4000",
    "zkteco-lh6500-door-lock",
  ],
  quote: "/quote?need=install",
});

/** How many locks the listing's type filter shows (src/content/cards.ts uses the same rule). */
export function lockTypeCount(type: ProductType): number {
  return productsInFamily("door-locks").filter((p) => typesFor(p.sourceCategories).includes(type)).length;
}
