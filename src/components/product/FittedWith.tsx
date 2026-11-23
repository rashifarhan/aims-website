import Image from "next/image";
import { MarketLink } from "./MarketLink";
import { AddToQuote, type AddToQuoteLabels } from "@/components/catalogue/AddToQuote";
import type { Product } from "@/content/schema";
import type { DataAttrs } from "./englishData";

type Props = {
  items: Product[];
  heading: string;
  note: string;
  href: (path: string) => string;
  addLabels: AddToQuoteLabels;
  data: DataAttrs;
};

/**
 * "Often fitted with" (Design Doc 10, T5): the one card style, each with the outline Add, so the page's
 * filled green stays the product's own "Add to quote" (one main action per screen, audit T2).
 */
export function FittedWith({ items, heading, note, href, addLabels, data }: Props) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="fitted" className="mt-14">
      <h2 id="fitted" className="text-2xl font-bold tracking-tight">
        {heading}
      </h2>
      <p className="mt-1 text-sm text-ink-600">{note}</p>
      <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <li key={f.slug} className="ui-card ui-card-interactive ui-card-photo flex items-center gap-4 p-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-white">
              {f.images[0] && <Image src={f.images[0].src} alt="" fill sizes="80px" className="object-contain p-1" />}
            </div>
            <div className="min-w-0 flex-1">
              <MarketLink
                href={href(`/product/${f.slug}`)}
                {...data}
                className="block font-semibold wrap-anywhere text-ink hover:text-green-700 hover:underline rtl:text-end"
              >
                {f.name}
              </MarketLink>
              <AddToQuote slug={f.slug} name={f.name} labels={addLabels} variant="outline" className="mt-2" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
