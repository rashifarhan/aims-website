import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { keyFacts } from "@/content/facts";
import { splitModel } from "@/lib/modelCode";
import type { SolutionPageData } from "@/content/solutionPages";
import type { ProductsCopy } from "./types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

/**
 * T3 row 4: recommended products with Add (Plan 14). Facts are verbatim spec rows; a model
 * without them says "Specs on request" (CLAUDE.md §1). Phones scroll the row sideways with the
 * next card visible, never automatically (no carousel). Each card is the shared card (actions.css
 * .ui-card: lift, photo zoom, press) with an outline Add, as on the listing (DESIGN.md: no row of filled
 * green buttons); the heading is the model code and any description in the model field goes under it.
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
    <Section ground="band" labelledBy={`${idPrefix}-products-title`}>
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
          const model = splitModel(p.model);
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
                  {model.code}
                </Link>
              </h3>
              {model.description && (
                <p className="pick-description" lang="en" dir="ltr">
                  {model.description}
                </p>
              )}
              {p.methods.length > 0 && (
                <p className="pick-methods">
                  <span className="sr-only">{c.methods}: </span>
                  {p.methods.map((m) => t.catalogue.verify[m]).join(" · ")}
                </p>
              )}
              {facts.length ? (
                <dl className="pick-facts" lang="en">
                  {facts.map((f) => (
                    // One chip is one English fact: label and value share its direction (Design Doc 13).
                    <div key={f.label} dir="ltr">
                      <dt>{f.label}</dt>
                      <dd className="tabular-nums">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="pick-facts-empty">{t.catalogue.specsOnRequest}</p>
              )}
              <AddToQuote slug={p.slug} name={p.name} labels={labels} variant="outline" className="pick-add" />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
