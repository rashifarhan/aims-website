"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import type { QuoteReceipt } from "@/lib/quote/adapter";
import { MessagePreview } from "./MessagePreview";
import { VerifyMark } from "./VerifyMark";

type Props = {
  receipt: QuoteReceipt;
  message: string;
  /** Items, need and reply channel, as the lines of the VERIFY mark. */
  signals: [string, string, string];
  t: Dictionary["quote"];
  productsHref: string;
  onEdit: () => void;
  onClear: () => void;
};

/** Receipt (Design Doc 9): heading takes focus; the demo boundary is stated first (AT-07). */
export function Receipt({ receipt, message, signals, t, productsHref, onEdit, onClear }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <section aria-labelledby="receipt-title" className="ui-panel mx-auto max-w-2xl">
      <VerifyMark labels={signals} />
      <h2 id="receipt-title" ref={heading} tabIndex={-1} className="mt-6 text-2xl font-bold tracking-tight">
        {t.receipt.title}
      </h2>
      {receipt.demo && <p className="mt-3 rounded-md bg-paper-2 p-3 font-semibold text-warn">{t.receipt.demo}</p>}
      <p className="mt-4 text-ink-700">
        {t.receipt.reference}:{" "}
        <bdi dir="ltr" className="font-mono font-semibold whitespace-nowrap text-ink">
          {receipt.reference}
        </bdi>
      </p>
      <p className="mt-2 text-ink-700">{fmt(t.receipt.body, { channel: t.replyChannels[receipt.channel] })}</p>
      <MessagePreview message={message} reference={receipt.reference} className="mt-4" />
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button type="button" onClick={onEdit} className="home-button home-button-outline home-button-sm">
          {t.receipt.edit}
        </button>
        <button type="button" onClick={onClear} className="home-secondary">
          {t.receipt.clear}
        </button>
        <Link href={productsHref} className="home-secondary">
          {t.receipt.products}
        </Link>
      </div>
    </section>
  );
}
