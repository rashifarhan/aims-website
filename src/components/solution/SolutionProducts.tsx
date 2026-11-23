import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { keyFacts } from "@/content/facts";
import type { SolutionPageData } from "@/content/solutionPages";
import type { ProductsCopy } from "./types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

/**
 * T3 row 4: recommended products with Add (Plan 14). Facts are verbatim spec rows; a model
 * without them says "Specs on request" (CLAUDE.md §1). Phones scroll the row sideways with the
 * next card visible, never automatically (no carousel).
 */
export async function SolutionProducts({
  idPrefix,
  page,
  copy: c,
}: {
  idPrefix: string;
  page: Pick<SolutionPageData, "family" | "products">;
  copy: ProductsCopy;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const labels = {
    add: t.catalogue.add,
    inQuote: t.catalogue.inQuote,
    addedAnnounce: t.catalogue.addedAnnounce,
    qtyAnnounce: t.catalogue.qtyAnnounce,
    qty: t.catalogue.qty,
    decrease: t.catalogue.decrease,
    increase: t.catalogue.increase,
  };
  const products = page.products.flatMap((slug) => productBySlug(slug) ?? []);
  return (
    <Section
      ground="band"
      labelledBy={`${idPrefix}-products-title`}
      // Three cards sit on a row at 1440: a second row needs the second screen (layout-v4.md 2).
      screens={products.length > 3 ? 2 : 1}
    >
      <SectionHeader
        id={`${idPrefix}-products-title`}
        title={c.heading}
        lead={c.lead}
        link={
          <Link href={localePath(locale, `/products/${page.family}`)} className="home-text-link">
            {fmt(c.all, { count: productsInFamily(page.family).length })}
          </Link>
        }
      />
      <ul className="pick-row">
        {products.map((p) => {
          const image = p.images[0];
          const facts = keyFacts(p);
          const href = localePath(locale, `/product/${p.slug}`);
          return (
            <li key={p.slug} className="pick-card ui-card ui-card-interactive">
              <Link href={href} tabIndex={-1} aria-hidden="true" className="pick-image ui-card-photo">
                {image && (
                  <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1024px) 200px, 160px"
                  />
                )}
              </Link>
              <p className="pick-brand">ZKTeco</p>
              <h3>
                <Link href={href} dir="ltr">
                  {p.model}
                </Link>
              </h3>
              {p.methods.length > 0 && (
                <p className="pick-methods">
                  <span className="sr-only">{c.methods}: </span>
                  {p.methods.map((m) => t.catalogue.verify[m]).join(" · ")}
                </p>
              )}
              {facts.length ? (
                <dl className="pick-facts" lang="en">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt>{f.label}</dt>
                      <dd className="tabular-nums" dir="ltr">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="pick-facts-empty">{t.catalogue.specsOnRequest}</p>
              )}
              <AddToQuote slug={p.slug} name={p.name} labels={labels} className="pick-add" />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
