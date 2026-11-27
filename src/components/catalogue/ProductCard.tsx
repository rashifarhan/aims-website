"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import Link from "next/link";
import type { ProductCard as Card } from "@/content/cards";
import type { QuoteContext } from "@/lib/quote/context";
import { splitModel } from "@/lib/modelCode";
import { FAMILY_GROUND } from "@/components/families/grounds";
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
  /** The family's name, shown on the photo panel where the list mixes families (the hub with no category). */
  familyLabel?: string;
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
 * Product card: a row on a phone, a tile from 640px. Not one big link: the model is the link, actions are separate
 * controls. Facts are verbatim spec values; missing specs say so.
 */
export function ProductCard({ card, href, subtitle, labels, compare, preset, eager = false, familyLabel }: Props) {
  const model = splitModel(card.model);
  const description = model.description || describe(card);
  return (
    // Direction 3's product card (CLAUDE.md → Design rules → Components): a white card on chalk; AIMS's own studio
    // photograph multiplied onto a light panel tinted by the family's ground (the main site's method, owner 27 Nov
    // 2026: clean edges, no cut-out halo), then the model in mono, the brand and only the catalogue's facts.
    <article className="product-card pc" style={{ "--g": FAMILY_GROUND[card.family] } as CSSProperties}>
      <Link href={href} tabIndex={-1} aria-hidden="true" className="pc-panel">
        {familyLabel && <span className="pc-family">{familyLabel}</span>}
        {card.image && (
          <Image
            src={card.image.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 96px"
            className="pc-photo"
            loading={eager ? "eager" : "lazy"}
          />
        )}
      </Link>

      <div className="pc-body">
        {BRAND_LINE[card.brand] && <p className="pc-brand">{BRAND_LINE[card.brand]}</p>}
        <h3 className="pc-model">
          {/* The negative margin cancels the padding, so the link is a 44px target without moving the line box. */}
          <Link href={href} dir="ltr" className="pc-model-link">
            {model.code}
          </Link>
        </h3>
        {/* Product data is English (CLAUDE.md 5); the type label comes from the dictionary. */}
        <p className="pc-sub" lang={description ? "en" : undefined}>
          {description || subtitle}
        </p>

        {card.facts.length > 0 ? (
          <dl className="pc-facts">
            {card.facts.map((f) => (
              // Product data is English: keep "label value" order on Arabic pages too.
              <div key={f.label} dir="ltr" lang="en">
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="pc-facts pc-none">{labels.specsOnRequest}</p>
        )}

        {/* Two fixed controls: adding (stepper + "On your list") never moves Compare. */}
        <div className="pc-actions">
          <AddToQuote slug={card.slug} name={card.name} labels={labels} className="min-h-11" preset={preset} />
          {compare && (
            <label className={`pc-compare ${compare.disabled ? "is-disabled" : ""}`}>
              <input
                type="checkbox"
                checked={compare.checked}
                disabled={compare.disabled}
                onChange={compare.onToggle}
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
