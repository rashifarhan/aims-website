"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { QtyStepper } from "@/components/ui/QtyStepper";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { isSoftwareLine, lineKey, type QuoteLine } from "@/lib/quote/store";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { DescribeItem } from "./DescribeItem";

export type CatalogEntry = { name: string; model: string; image: string | null };

type Props = {
  lines: QuoteLine[];
  catalog: Record<string, CatalogEntry>;
  t: Dictionary["quote"];
  stepper: { qty: string; decrease: string; increase: string };
  productHref: (slug: string) => string;
  productsHref: string;
  error?: string;
  preset?: "install" | "export";
};

/** Panel 1: quote lines with steppers, remove + undo (5 s), and free-text items. */
export function QuoteItems({ lines, catalog, t, stepper, productHref, productsHref, error, preset }: Props) {
  const [removed, setRemoved] = useState<{ line: QuoteLine; index: number; name: string } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const nameOf = (l: QuoteLine) => (l.kind === "product" ? (catalog[l.slug]?.name ?? l.slug) : l.text);

  const remove = (line: QuoteLine, index: number) => {
    dispatchQuote({ type: "remove", key: lineKey(line) });
    setRemoved({ line, index, name: nameOf(line) });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setRemoved(null), 5000);
  };

  return (
    <div>
      {lines.length > 0 && (
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((l, i) => {
            const p = l.kind === "product" ? catalog[l.slug] : undefined;
            const name = nameOf(l);
            return (
              <li
                key={lineKey(l)}
                className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3"
              >
                <div className="relative size-14 overflow-hidden rounded-sm border border-line bg-white">
                  {p?.image && <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1" />}
                </div>
                <div className="min-w-0">
                  {l.kind === "product" ? (
                    <Link href={productHref(l.slug)} className="block truncate font-semibold text-ink hover:underline">
                      {name}
                    </Link>
                  ) : (
                    <p className="truncate font-semibold text-ink">
                      <span className="me-2 rounded-pill bg-paper-3 px-2 py-0.5 text-xs font-semibold text-ink-700">
                        {isSoftwareLine(l) ? t.needs.software : t.customLine}
                      </span>
                      {name}
                    </p>
                  )}
                  {p && <p className="truncate font-mono text-sm text-ink-600">{p.model}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => remove(l, i)}
                  aria-label={fmt(t.remove, { name })}
                  className="grid size-11 place-items-center rounded-md text-ink-600 hover:bg-paper-2 hover:text-ink"
                >
                  <CloseIcon width={18} height={18} />
                </button>
                <div className="col-start-2 col-end-4">
                  <QtyStepper
                    size="sm"
                    value={l.qty}
                    label={`${stepper.qty}, ${name}`}
                    decreaseLabel={stepper.decrease}
                    increaseLabel={stepper.increase}
                    onChange={(qty) => dispatchQuote({ type: "setQty", key: lineKey(l), qty })}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p role="status" className="min-h-0 text-sm text-ink-700 empty:hidden [&:not(:empty)]:mt-3">
        {removed && (
          <>
            {fmt(t.removed, { name: removed.name })}{" "}
            <button
              type="button"
              onClick={() => {
                dispatchQuote({ type: "restore", line: removed.line, index: removed.index });
                setRemoved(null);
              }}
              className="home-secondary"
            >
              {t.undo}
            </button>
          </>
        )}
      </p>

      {error && (
        <p id="quote-items-error" className="mt-3 text-sm font-medium text-error">
          {error}
        </p>
      )}

      <DescribeItem t={t} productsHref={productsHref} preset={preset} />
    </div>
  );
}
