import Link from "next/link";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { toCard } from "@/content/cards";
import { productBySlug, products } from "@/content/catalogue";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { LOCATION_MODELS } from "@/lib/locationPages";
import type { QuoteContext } from "@/lib/quote/context";

/**
 * T7 "popular models" (Design Doc 10.1), named "models to start from" because AIMS publishes no sales ranking.
 * The catalogue's own card (Design Doc 9): verbatim spec facts, model code in mono, an outline Add that carries
 * the page's destination. No compare here: compare lives with the listing's tray.
 */
export async function LocationModels({ id, preset }: { id: string; preset?: Partial<QuoteContext> }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.locations.common;
  const types = t.catalogue.types as Record<string, string>;
  const labels = {
    add: t.catalogue.add,
    inQuote: t.catalogue.inQuote,
    addedAnnounce: t.catalogue.addedAnnounce,
    qtyAnnounce: t.catalogue.qtyAnnounce,
    qty: t.catalogue.qty,
    decrease: t.catalogue.decrease,
    increase: t.catalogue.increase,
    compare: t.catalogue.compare,
    specsOnRequest: t.catalogue.specsOnRequest,
  };
  const cards = LOCATION_MODELS.flatMap((slug) => productBySlug(slug) ?? []).map(toCard);
  return (
    <section id={id} className="t3-section wrap" aria-labelledby={`${id}-title`}>
      <div className="t3-heading t3-heading-row">
        <div>
          <h2 id={`${id}-title`} className="t3-title">
            {c.modelsHeading}
          </h2>
          <p className="t3-lead">{c.modelsLead}</p>
        </div>
        <Link href={localePath(locale, "/products")} className="home-text-link">
          {fmt(c.modelsAll, { count: products().length })}
        </Link>
      </div>
      <ul className="loc-models">
        {cards.map((card) => (
          <li key={card.slug} className="flex">
            <ProductCard
              card={card}
              href={localePath(locale, `/product/${card.slug}`)}
              subtitle={(card.types[0] ? types[card.types[0]] : t.families[card.family].name) ?? ""}
              labels={labels}
              preset={preset}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
