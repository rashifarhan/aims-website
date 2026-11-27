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
  /** The family name on each photo panel, when the list mixes families. */
  familyLabel?: (c: Card) => string | undefined;
};

/** The card's strings, picked from the catalogue dictionary. */
export const cardLabels = (t: Dictionary["catalogue"]): CardLabels => ({
  add: t.add,
  inQuote: t.inQuote,
  addedAnnounce: t.addedAnnounce,
  remove: t.remove,
  removedAnnounce: t.removedAnnounce,
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

/** The results: rows on a phone, a grid of equal-height tiles from 640px (catalogue.css .pc-grid). */
export function ResultsGrid({ results, productHref, preset, subtitle, labels, compare, familyLabel }: Props) {
  return (
    <ul className="pc-grid">
      {results.map((c, i) => (
        <li key={c.slug}>
          <ProductCard
            card={c}
            href={withDestination(`${productHref}/${c.slug}`, preset)}
            preset={preset}
            subtitle={subtitle(c)}
            labels={labels}
            eager={i < EAGER}
            compare={compare(c)}
            familyLabel={familyLabel?.(c)}
          />
        </li>
      ))}
    </ul>
  );
}
