"use client";

import { useEffect, useRef, useState } from "react";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { fmt } from "@/i18n/format";
import { destinationFromSearch, type QuoteContext } from "@/lib/quote/context";
import { dispatchQuote, useQuote } from "@/lib/quote/useQuote";

export type AddToQuoteLabels = {
  add: string;
  inQuote: string;
  addedAnnounce: string;
  qtyAnnounce: string;
  qty: string;
  decrease: string;
  increase: string;
};

type Props = {
  slug: string;
  name: string;
  labels: AddToQuoteLabels;
  size?: "md" | "sm";
  /** A card's own action is the outline button, so a grid never shows a wall of filled green (DESIGN.md). */
  variant?: "primary" | "outline";
  className?: string;
  /** A location page's destination (Design Doc 10.1 T7): saved with the add unless the buyer already chose a need. */
  preset?: Partial<QuoteContext>;
};

/**
 * "Add to quote" that becomes a quantity stepper + "✓ In quote" once
 * added (Design Doc 9). Never "Buy" or "Order". Changes are announced.
 */
export function AddToQuote({ slug, name, labels, size = "sm", variant = "primary", className = "", preset }: Props) {
  const quote = useQuote();
  const line = quote.lines.find((l) => l.kind === "product" && l.slug === slug);
  const [status, setStatus] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const justAdded = useRef(false);

  // The button unmounts once the line exists; keep keyboard focus on the control that replaced it
  // (WCAG 2.4.3) instead of dropping it to the page. The "+" button, not the field, so a phone doesn't
  // open its keyboard.
  useEffect(() => {
    if (!line || !justAdded.current) return;
    justAdded.current = false;
    root.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [line]);

  // The outline is always the small one; it only appears inside cards.
  const button = `home-button ${variant === "outline" ? "home-button-outline home-button-sm" : size === "sm" ? "home-button-sm" : ""}`;

  return (
    <div ref={root} className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      {line ? (
        <>
          <QtyStepper
            size={size}
            value={line.qty}
            label={`${labels.qty}, ${name}`}
            decreaseLabel={labels.decrease}
            increaseLabel={labels.increase}
            onChange={(qty) => {
              dispatchQuote({ type: "setQty", key: slug, qty });
              setStatus(fmt(labels.qtyAnnounce, { name, qty }));
            }}
          />
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">
            <span aria-hidden="true">✓</span> {labels.inQuote}
          </span>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            justAdded.current = true;
            dispatchQuote({
              type: "add",
              slug,
              qty: 1,
              preset: preset ?? destinationFromSearch(window.location.search),
            });
            setStatus(fmt(labels.addedAnnounce, { name, qty: 1 }));
          }}
          className={button}
        >
          {labels.add}
        </button>
      )}
      <span role="status" className="sr-only">
        {status}
      </span>
    </div>
  );
}
