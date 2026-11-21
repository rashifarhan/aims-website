"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCard as Card } from "@/content/cards";
import { AddToQuote, type AddToQuoteLabels } from "./AddToQuote";

export type CardLabels = AddToQuoteLabels & { compare: string; specsOnRequest: string };

type Props = {
  card: Card;
  href: string;
  subtitle: string;
  labels: CardLabels;
  compare: { checked: boolean; disabled: boolean; onToggle: () => void };
  /** Above-the-fold cards load eagerly. */
  eager?: boolean;
};

const BRAND_LINE: Record<Card["brand"], string> = { zkteco: "ZKTeco", alpha: "Alpha", other: "" };

/** Strip the brand from the title; the brand line above already says it. */
const titleOf = (c: Card) => c.name.replace(/^(ZKTeco|Alpha)\s+/i, "");

/**
 * Product card (Design Doc 9): row on mobile, tile from 640px. Not one big
 * link: the title is the link, actions are separate controls. Facts are
 * verbatim spec values; missing specs say so.
 */
export function ProductCard({ card, href, subtitle, labels, compare, eager = false }: Props) {
  const title = titleOf(card);
  return (
    <article className="grid grid-cols-[88px_1fr] gap-4 border-b border-line py-4 sm:flex sm:flex-col sm:gap-0 sm:rounded-lg sm:border sm:bg-paper sm:p-4 sm:transition-shadow sm:hover:shadow-2">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-square overflow-hidden rounded-md border border-line bg-white sm:mb-4"
      >
        {card.image && (
          <Image
            src={card.image.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 88px"
            className="object-contain p-2 sm:p-4"
            loading={eager ? "eager" : "lazy"}
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        {BRAND_LINE[card.brand] && (
          <p className="text-brand font-semibold tracking-brand text-ink-600 uppercase">{BRAND_LINE[card.brand]}</p>
        )}
        <h3 className="mt-0.5 text-base leading-snug font-semibold text-ink sm:text-lg">
          <Link href={href} className="hover:text-green-700 hover:underline">
            {title}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-ink-600">{subtitle}</p>

        {card.facts.length > 0 ? (
          <dl className="mt-3 grid gap-1.5 text-sm">
            {card.facts.map((f) => (
              // Product data is English: keep "label value" order on Arabic pages too.
              <div key={f.label} dir="ltr" lang="en" className="flex flex-wrap gap-x-1.5 rtl:justify-end">
                <dt className="text-ink-600">{f.label}</dt>
                <dd className="font-medium text-ink tabular-nums">{f.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-ink-600">{labels.specsOnRequest}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <AddToQuote slug={card.slug} name={card.name} labels={labels} />
          <label
            className={`inline-flex min-h-11 items-center gap-2 text-sm sm:min-h-9 ${compare.disabled ? "text-ink-400" : "cursor-pointer text-ink-700"}`}
          >
            <input
              type="checkbox"
              checked={compare.checked}
              disabled={compare.disabled}
              onChange={compare.onToggle}
              className="size-4.5 accent-green-700"
            />
            {labels.compare}
            <span className="sr-only">: {card.name}</span>
          </label>
        </div>
      </div>
    </article>
  );
}
