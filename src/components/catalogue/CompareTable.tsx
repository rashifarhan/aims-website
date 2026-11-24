import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/content/schema";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CompareRow } from "@/lib/compare";
import type { QuoteContext } from "@/lib/quote/context";
import { AddToQuote, type AddToQuoteLabels } from "./AddToQuote";
import { DiffersChip } from "./DiffersChip";

type Props = {
  items: Product[];
  rows: CompareRow[];
  t: Dictionary;
  addLabels: AddToQuoteLabels;
  productHref: (slug: string) => string;
  /** The market carried from the listing, so Add keeps the buyer's destination (market-quote continuity). */
  preset?: Partial<QuoteContext>;
  /** The compare URL without one product, or null when removing it would leave fewer than two. */
  removeHref: (p: Product) => string | null;
  contentLang?: string;
};

/**
 * The compare table from 640px (Design Doc 9): a header row with each product's photograph whole, its name
 * and its outline Add. Fixed layout: the label column is 14rem and the products share the rest equally, so a
 * long value in one product never squeezes the others (site polish T6). Photographs stand on the home tiles'
 * plinth and names take the tile title's display face (catalogue.css; premium pass).
 */
export function CompareTable({ items, rows, t, addLabels, productHref, preset, removeHref, contentLang }: Props) {
  const dataDir = contentLang ? "ltr" : undefined;
  return (
    <div className="mt-6 hidden sm:block">
      <table className="w-full table-fixed border-collapse text-start text-sm" lang={contentLang}>
        <colgroup>
          <col className="w-56" />
          {items.map((p) => (
            <col key={p.slug} />
          ))}
        </colgroup>
        <thead>
          <tr className="align-top">
            <td />
            {items.map((p) => {
              const remove = removeHref(p);
              return (
                <th key={p.slug} scope="col" className="px-3 pb-6 text-start font-normal">
                  <div className="catalogue-plinth relative mb-4 aspect-4/3 w-full max-w-60 overflow-hidden rounded-md">
                    {p.images[0] && (
                      <Image
                        src={p.images[0].src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 15rem, 30vw"
                        className="object-contain p-3"
                      />
                    )}
                  </div>
                  <Link
                    href={productHref(p.slug)}
                    className="catalogue-tile-title flex min-h-11 items-center text-home-card leading-snug text-ink hover:underline"
                  >
                    {p.name}
                  </Link>
                  <span className="block font-mono text-xs text-ink-600">
                    <span dir="ltr">{p.model}</span>
                  </span>
                  <AddToQuote
                    preset={preset}
                    slug={p.slug}
                    name={p.name}
                    labels={addLabels}
                    variant="outline"
                    className="mt-4"
                  />
                  {remove && (
                    <Link href={remove} replace className="home-secondary text-sm">
                      {t.compare.remove}
                      <span className="sr-only"> {p.name}</span>
                    </Link>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className={`border-t border-line align-top ${r.differs ? "bg-paper-2" : ""}`}>
              <th scope="row" className="py-3 ps-3 pe-3 text-start font-normal">
                <span className="font-medium text-ink-700" dir={dataDir}>
                  {r.label}
                </span>
                {r.differs && <DiffersChip label={t.compare.differs} />}
                {r.hint && <span className="mt-1 block text-xs leading-snug text-ink-600">{r.hint}</span>}
              </th>
              {r.values.map((v, i) => (
                <td key={items[i].slug} className="px-3 py-3 break-words text-ink tabular-nums">
                  {/* English data keeps its order on an Arabic page ("5-inch", "3000 Templates"), isolated so the
                      cell still starts at the column's start edge (Design Doc 13). */}
                  {v != null ? (
                    <span dir={dataDir}>{v}</span>
                  ) : (
                    <span className="text-ink-600 italic">{t.product.notListed}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
