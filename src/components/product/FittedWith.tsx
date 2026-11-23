import Image from "next/image";
import Link from "next/link";
import { AddToQuote, type AddToQuoteLabels } from "@/components/catalogue/AddToQuote";
import type { Product } from "@/content/schema";
import type { DataAttrs } from "./englishData";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Props = {
  items: Product[];
  heading: string;
  note: string;
  href: (path: string) => string;
  addLabels: AddToQuoteLabels;
  data: DataAttrs;
  ground: "paper" | "band";
};

/**
 * "Often fitted with" (Design Doc 10, T5): the one card style with each product's photograph whole, each with
 * the outline Add, so the page's
 * filled green stays the product's own "Add to quote" (one main action per screen, audit T2).
 */
export function FittedWith({ items, heading, note, href, addLabels, data, ground }: Props) {
  if (items.length === 0) return null;
  return (
    <Section ground={ground} labelledBy="fitted">
      <SectionHeader id="fitted" title={heading} lead={note} />
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          // A row on a phone (photo beside the name), a tile from 640px with the product whole above it.
          <li
            key={f.slug}
            className="ui-card ui-card-interactive grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 p-(--card-pad-tight) sm:flex sm:flex-col sm:items-stretch sm:p-(--card-pad)"
          >
            <div className="ui-card-photo relative aspect-square overflow-hidden rounded-md bg-paper sm:aspect-4/3">
              {f.images[0] && (
                <Image
                  src={f.images[0].src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 6rem"
                  className="object-contain p-2 sm:p-4"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col sm:mt-4">
              <Link
                href={href(`/product/${f.slug}`)}
                {...data}
                className="block text-home-card leading-snug font-card wrap-anywhere text-ink hover:text-green-700 hover:underline rtl:text-end"
              >
                {f.name}
              </Link>
              <AddToQuote
                slug={f.slug}
                name={f.name}
                labels={addLabels}
                variant="outline"
                className="mt-3 sm:mt-auto sm:pt-4"
              />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
