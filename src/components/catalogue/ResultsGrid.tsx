"use client";

import type { ProductCard as Card } from "@/content/cards";
import type { Dictionary } from "@/i18n/dictionaries";
import { withDestination, type QuoteContext } from "@/lib/quote/context";
import { ProductCard, type CardLabels } from "./ProductCard";

type Props = {
  results: Card[];
  productHref: string;
  /** The market the buyer arrived with: it follows them to each product and into Add. */
  preset?: Partial<QuoteContext>;
  subtitle: (c: Card) => string;
  labels: CardLabels;
  compare: (c: Card) => { checked: boolean; disabled: boolean; onToggle: () => void };
};

/** The card's strings, picked from the catalogue dictionary. */
export const cardLabels = (t: Dictionary["catalogue"]): CardLabels => ({
  add: t.add,
  inQuote: t.inQuote,
  addedAnnounce: t.addedAnnounce,
  qtyAnnounce: t.qtyAnnounce,
  qty: t.qty,
  decrease: t.decrease,
  increase: t.increase,
  compare: t.compare,
  specsOnRequest: t.specsOnRequest,
});

/**
 * Only the first card loads eagerly. React preloads every eager image, and CLAUDE.md §5 allows one preloaded image
 * per page; the rest of the first row is in view at load, so the browser fetches them at once anyway.
 */
const EAGER = 1;

/**
 * The results on the one card (Design Doc 10, T4): rows divided by hairlines on a phone, a grid of equal-height
 * tiles from 640px (each list item stretches its card, catalogue.css).
 */
export function ResultsGrid({ results, productHref, preset, subtitle, labels, compare }: Props) {
  return (
    <ul className="mt-4 grid border-t border-line sm:grid-cols-2 sm:gap-5 sm:border-0 lg:grid-cols-2 xl:grid-cols-3">
      {results.map((c, i) => (
        <li key={c.slug} className="flex">
          <ProductCard
            card={c}
            href={withDestination(`${productHref}/${c.slug}`, preset)}
            preset={preset}
            subtitle={subtitle(c)}
            labels={labels}
            eager={i < EAGER}
            compare={compare(c)}
          />
        </li>
      ))}
    </ul>
  );
}
