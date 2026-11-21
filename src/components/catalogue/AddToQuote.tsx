"use client";

import { useState } from "react";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { fmt } from "@/i18n/format";
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

type Props = { slug: string; name: string; labels: AddToQuoteLabels; size?: "md" | "sm"; className?: string };

/**
 * "Add to quote" that becomes a quantity stepper + "✓ In quote" once
 * added (Design Doc 9). Never "Buy" or "Order". Changes are announced.
 */
export function AddToQuote({ slug, name, labels, size = "sm", className = "" }: Props) {
  const quote = useQuote();
  const line = quote.lines.find((l) => l.kind === "product" && l.slug === slug);
  const [status, setStatus] = useState("");

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
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
            dispatchQuote({ type: "add", slug, qty: 1 });
            setStatus(fmt(labels.addedAnnounce, { name, qty: 1 }));
          }}
          className={`inline-flex items-center rounded-pill bg-green-700 px-4 font-semibold text-white transition-colors duration-(--duration-fast) hover:bg-green-800 ${size === "md" ? "h-11" : "h-11 text-sm sm:h-9"}`}
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
