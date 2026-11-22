import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { keyFacts } from "@/content/facts";
import type { Product } from "@/content/schema";
import { cutoutFor } from "@/content/cutouts";

export type MethodTile = {
  /** The method or type this tile stands for, shown as its heading. */
  label: string;
  product: Product;
  /** The listing that shows every model of this kind, and its line. */
  all: { href: string; label: string };
};

type Props = { id: string; heading: string; lead: string; tiles: MethodTile[] };

/**
 * T3 rows 3 and 4 (Master Plan 14): the choose-your-method guide with one recommended terminal
 * for each method, each with Add to quote and a link to every model of that kind. Facts are the
 * catalogue's own spec rows; a model without them says "Specs on request" (CLAUDE.md §1).
 */
export async function MethodTiles({ id, heading, lead, tiles }: Props) {
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
  return (
    <section className="section method-section" id={id} aria-labelledby={`${id}-h`}>
      <div className="wrap stack-6">
        <div className="section-head section-head--split">
          <h2 id={`${id}-h`}>{heading}</h2>
          <p className="t-lead">{lead}</p>
        </div>
        <ul className="method-tiles grid">
          {tiles.map(({ label, product: p, all }) => {
            const image = cutoutFor(p);
            const facts = keyFacts(p);
            const href = localePath(locale, `/product/${p.slug}`);
            return (
              <li key={p.slug} className="span-4 tile">
                <Link href={href} className="tile__media m-zoom" tabIndex={-1} aria-hidden="true">
                  {image && (
                    <Image
                      src={image.src}
                      alt=""
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 1024px) 400px, 90vw"
                    />
                  )}
                </Link>
                <div className="tile__head">
                  <h3>{label}</h3>
                  <Link href={href} className="link mono" dir="ltr">
                    {p.model}
                  </Link>
                </div>
                {facts.length ? (
                  <dl className="tile__facts method-tiles__facts" lang="en">
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
                  <p className="tile__facts">{t.catalogue.specsOnRequest}</p>
                )}
                <div className="method-tiles__actions">
                  <AddToQuote slug={p.slug} name={p.name} labels={labels} size="md" look="kit" />
                  <Link href={all.href} className="link">
                    {all.label}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
