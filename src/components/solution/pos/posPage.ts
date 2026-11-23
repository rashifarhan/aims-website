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
  // The family's terminals minus the hero (shown once) and zkbio810, whose data is titled "ZKAIO1000", so
  // two cards would carry one name. Four cards: counter.css lays them in one row on desktop.
  products: ["zkbio900-series", "zk15-series", "zk1515-series", "zk-h300"],
  // POS is supplied and set up rather than installed (prep: hero), so the supply need is preset.
  quote: "/quote?need=supply",
});

/** How many POS terminals the listing's type filter shows (src/content/cards.ts uses the same rule). */
export function posTypeCount(type: ProductType): number {
  return productsInFamily("pos").filter((p) => typesFor(p.sourceCategories).includes(type)).length;
}
