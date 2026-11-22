import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { keyFacts } from "@/content/facts";
import { TA_PRODUCTS } from "@/content/timeAttendance";

/**
 * T3 row 4: recommended products with Add (Plan 14). Facts are verbatim spec rows; a model
 * without them says "Specs on request" (CLAUDE.md §1). Phones scroll the row sideways with the
 * next card visible, never automatically (no carousel).
 */
export async function SolutionProducts() {
  const t = await getDictionary();
  const c = t.solutionTimeAttendance.products;
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
  const products = TA_PRODUCTS.flatMap((slug) => productBySlug(slug) ?? []);
  return (
    <section className="t3-section page-container" aria-labelledby="ta-products-title">
      <div className="t3-heading t3-heading-row">
        <div>
          <h2 id="ta-products-title" className="t3-title">
            {c.heading}
          </h2>
          <p className="t3-lead">{c.lead}</p>
        </div>
        <Link href={localePath(locale, "/products/time-attendance")} className="home-text-link">
          {fmt(c.all, { count: productsInFamily("time-attendance").length })}
        </Link>
      </div>
      <ul className="pick-row">
        {products.map((p) => {
          const image = p.images[0];
          const facts = keyFacts(p);
          const href = localePath(locale, `/product/${p.slug}`);
          return (
            <li key={p.slug} className="pick-card">
              <Link href={href} tabIndex={-1} aria-hidden="true" className="pick-image">
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
              <p className="pick-methods">
                <span className="sr-only">{c.methods}: </span>
                {p.methods.map((m) => t.catalogue.verify[m]).join(" · ")}
              </p>
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
    </section>
  );
}
