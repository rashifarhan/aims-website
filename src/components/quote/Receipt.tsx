"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import type { QuoteReceipt } from "@/lib/quote/adapter";

type Props = {
  receipt: QuoteReceipt;
  message: string;
  t: Dictionary["quote"];
  productsHref: string;
  onEdit: () => void;
  onClear: () => void;
};

/** Receipt (Design Doc 9): heading takes focus; the demo boundary is stated first (AT-07). */
export function Receipt({ receipt, message, t, productsHref, onEdit, onClear }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <section
      aria-labelledby="receipt-title"
      className="mx-auto max-w-2xl rounded-lg border border-line bg-paper p-5 sm:p-8"
    >
      <p className="text-4xl text-green-700" aria-hidden="true">
        ✓
      </p>
      <h2 id="receipt-title" ref={heading} tabIndex={-1} className="mt-2 text-2xl font-bold tracking-tight">
        {t.receipt.title}
      </h2>
      {receipt.demo && <p className="mt-3 rounded-md bg-paper-2 p-3 font-semibold text-warn">{t.receipt.demo}</p>}
      <p className="mt-4 text-ink-700">
        {t.receipt.reference}: <span className="font-mono font-semibold text-ink">{receipt.reference}</span>
      </p>
      <p className="mt-2 text-ink-700">{fmt(t.receipt.body, { channel: t.replyChannels[receipt.channel] })}</p>
      <pre className="mt-4 overflow-auto rounded-md bg-green-50 p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {message}
      </pre>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="h-11 rounded-pill border border-ink px-5 font-semibold hover:bg-ink hover:text-white"
        >
          {t.receipt.edit}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="h-11 px-3 font-semibold text-ink-700 underline underline-offset-2"
        >
          {t.receipt.clear}
        </button>
        <Link
          href={productsHref}
          className="inline-flex h-11 items-center px-3 font-semibold text-green-700 underline underline-offset-2"
        >
          {t.receipt.products}
        </Link>
      </div>
    </section>
  );
}
