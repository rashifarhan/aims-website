"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCard as Card } from "@/content/cards";
import type { QuoteContext } from "@/lib/quote/context";
import { splitModel } from "@/lib/modelCode";
import { AddToQuote, type AddToQuoteLabels } from "./AddToQuote";
// The card's plinth and phone-row rules travel with it (a location page shows it outside the listing).
import "./catalogue.css";

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
 * description after the code ("ALF B21 - Exit Button"), or the imported model field carries one
 * ("LH4000 Smart Hotel Door Lock", splitModel), that description replaces the type line, so no words are
 * lost and nothing is said twice.
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
  const model = splitModel(card.model);
  const description = model.description || describe(card);
  return (
    // From 640px the home tile: the photograph full-bleed on its plinth, the facts inset below (catalogue.css).
    <article className="product-card ui-card ui-card-interactive spotlight-card grid w-full grid-cols-[88px_1fr] gap-4 py-4 sm:flex sm:flex-col sm:gap-0 sm:overflow-clip sm:p-0">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="ui-card-photo catalogue-plinth relative block aspect-square overflow-hidden rounded-md sm:aspect-5/4 sm:rounded-none"
      >
        {card.image && (
          <Image
            src={card.image.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 88px"
            className="object-contain p-2 sm:px-[14%] sm:py-[10%]"
            loading={eager ? "eager" : "lazy"}
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col sm:p-(--card-pad)">
        {BRAND_LINE[card.brand] && (
          <p className="text-brand font-semibold tracking-brand text-ink-600 uppercase">{BRAND_LINE[card.brand]}</p>
        )}
        <h3 className="mt-0.5 text-base leading-snug font-medium text-ink sm:text-lg">
          {/* The negative margin cancels the padding, so the link is a 44px target without moving the line box
              (CLAUDE.md §4); the underline draws in rather than snapping on (taste House rule 5). */}
          <Link
            href={href}
            dir="ltr"
            className="-my-3 inline-block min-w-11 py-3 font-mono break-words underline decoration-transparent underline-offset-[0.2em] transition-[color,text-decoration-color] duration-(--duration-hover) hover:text-green-700 hover:decoration-current"
          >
            {model.code}
          </Link>
        </h3>
        {/* Product data is English (CLAUDE.md 7); the type label comes from the dictionary. */}
        <p className="mt-0.5 text-sm text-ink-600" lang={description ? "en" : undefined}>
          {description || subtitle}
        </p>

        {card.facts.length > 0 ? (
          <dl className="mt-3 grid gap-1.5 text-sm">
            {card.facts.map((f) => (
              // Product data is English: keep "label value" order on Arabic pages too. A value too long for
              // the row wraps under its label and, in Arabic, lines up with the card's end edge (Design Doc 13).
              <div key={f.label} dir="ltr" lang="en" className="flex flex-wrap gap-x-1.5 rtl:justify-end">
                <dt className="text-ink-600">{f.label}</dt>
                <dd className="min-w-0 font-medium text-ink tabular-nums rtl:text-end">{f.value}</dd>
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
