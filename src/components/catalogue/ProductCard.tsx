"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCard as Card } from "@/content/cards";
import type { QuoteContext } from "@/lib/quote/context";
import { AddToQuote, type AddToQuoteLabels } from "./AddToQuote";

export type CardLabels = AddToQuoteLabels & { compare: string; specsOnRequest: string };

type Props = {
  card: Card;
  href: string;
  subtitle: string;
  labels: CardLabels;
  /** The listing's compare toggle; a curated row outside the listing (a location page) has no compare tray. */
  compare?: { checked: boolean; disabled: boolean; onToggle: () => void };
  /** Passed to AddToQuote: a location page's destination (Design Doc 10.1 T7). */
  preset?: Partial<QuoteContext>;
  /** Above-the-fold cards load eagerly. */
  eager?: boolean;
};

const BRAND_LINE: Record<Card["brand"], string> = { zkteco: "ZKTeco", alpha: "Alpha", other: "" };

/**
 * The heading is the model code (Design Doc 9 card anatomy: "model (mono)"). Where AIMS's name adds a
 * description after the code ("ALF B21 - Exit Button"), that description replaces the type line, so no
 * words from the name are lost and nothing is said twice.
 */
function describe(c: Card): string {
  const title = c.name.replace(/^(ZKTeco|Alpha)\s+/i, "");
  if (!title.toLowerCase().startsWith(c.model.toLowerCase())) return "";
  return title.slice(c.model.length).replace(/^\s*[-–]\s*/, "");
}

/**
 * Product card (Design Doc 9): row on mobile, tile from 640px, in the one card style (actions.css
 * .ui-card). Not one big link: the model is the link, actions are separate controls. Facts are verbatim
 * spec values; missing specs say so.
 */
export function ProductCard({ card, href, subtitle, labels, compare, preset, eager = false }: Props) {
  const description = describe(card);
  return (
    <article className="product-card ui-card ui-card-interactive grid w-full grid-cols-[88px_1fr] gap-4 py-4 sm:flex sm:flex-col sm:gap-0 sm:p-4">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="ui-card-photo relative block aspect-square overflow-hidden rounded-md border border-line bg-paper sm:mb-4 sm:border-0"
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
        <h3 className="mt-0.5 text-base leading-snug font-medium text-ink sm:text-lg">
          <Link href={href} dir="ltr" className="font-mono break-words hover:text-green-700 hover:underline">
            {card.model}
          </Link>
        </h3>
        {/* Product data is English (CLAUDE.md 7); the type label comes from the dictionary. */}
        <p className="mt-0.5 text-sm text-ink-600" lang={description ? "en" : undefined}>
          {description || subtitle}
        </p>

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

        {/* Two fixed rows, so adding to the quote (stepper + "In quote") never moves Compare or changes
            the card's height. The outline button keeps a grid from becoming a wall of filled green. */}
        <div className="mt-auto grid gap-1 pt-4">
          <AddToQuote
            slug={card.slug}
            name={card.name}
            labels={labels}
            variant="outline"
            className="min-h-11"
            preset={preset}
          />
          {compare && (
            <label
              className={`inline-flex min-h-11 items-center gap-2 justify-self-start text-sm ${compare.disabled ? "text-ink-400" : "cursor-pointer text-ink-700"}`}
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
          )}
        </div>
      </div>
    </article>
  );
}
