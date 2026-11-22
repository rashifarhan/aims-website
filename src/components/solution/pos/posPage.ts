import "server-only";
import { defineSolutionPage } from "@/content/solutionPages";
import { SOLUTION_CARDS } from "@/content/solutions";
import { productsInFamily } from "@/content/catalogue";
import { typesFor, type ProductType } from "@/content/taxonomy";

/** /solutions/pos (Master Plan 12 #19): the hub card's terminal leads, so hub and page match. */
export const POS_PAGE = defineSolutionPage({
  slug: "pos",
  family: "pos",
  hero: SOLUTION_CARDS.find((card) => card.slug === "pos")?.product ?? "zkaio1000",
  // Windows, Android and handheld terminals, then the receipt printer the counter story prints on. The
  // zkbio810 page is left out: its data is titled "ZKAIO1000", so two cards would carry one name.
  products: ["zkbio900-series", "zk15-series", "zk1515-series", "zkaio1000", "zk-h300", "zkp8001"],
  // POS is supplied and set up rather than installed (prep: hero), so the supply need is preset.
  quote: "/quote?need=supply",
});

/** How many POS terminals the listing's type filter shows (src/content/cards.ts uses the same rule). */
export function posTypeCount(type: ProductType): number {
  return productsInFamily("pos").filter((p) => typesFor(p.sourceCategories).includes(type)).length;
}
