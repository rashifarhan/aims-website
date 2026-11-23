import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { LOCATION_MODELS, LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";
import { productBySlug } from "@/content/catalogue";
import { toCard } from "@/content/cards";
import { AddToQuote } from "@/components/catalogue/AddToQuote";

export async function LocationProducts({ market }: { market: LocationMarket }) {
  const all = await getDictionary();
  const locale = await getLocale();
  const t = all.locationPage;
  return (
    <section id="models" className="locations-section location-products">
      <div className="wrap page-container">
        <h2>{t.modelsTitle}</h2>
        <p className="locations-lead">{t.modelsLead}</p>
        <div className="location-product-grid">
          {LOCATION_MODELS.map((slug) => {
            const product = productBySlug(slug);
            if (!product) return null;
            const card = toCard(product);
            return (
              <article key={slug} data-model={slug} className="ui-card ui-card-interactive">
                <Link
                  href={localePath(locale, `/product/${slug}`)}
                  className="location-product-photo ui-card-photo"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {card.image && (
                    <Image
                      data-source="client"
                      data-subject={card.name}
                      src={card.image.src}
                      width={card.image.width}
                      height={card.image.height}
                      alt=""
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 80vw"
                    />
                  )}
                </Link>
                <h3>
                  <Link href={localePath(locale, `/product/${slug}`)} className="locations-link" dir="ltr">
                    {card.model}
                  </Link>
                </h3>
                <dl lang="en" dir="ltr">
                  {card.facts.slice(0, 2).map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <AddToQuote
                  slug={slug}
                  name={card.name}
                  labels={all.catalogue}
                  context={LOCATION_PAGES[market].context}
                  variant="outline"
                />
              </article>
            );
          })}
        </div>
        <div className="locations-actions">
          <Link prefetch={false} href={localePath(locale, LOCATION_PAGES[market].quote)} className="locations-primary">
            {t.quoteReview}
          </Link>
          <Link href={localePath(locale, "/products")} className="locations-link">
            {t.catalogue}
          </Link>
        </div>
      </div>
    </section>
  );
}
