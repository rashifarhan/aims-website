"use client";

import type { Ref } from "react";
import { WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  t: Dictionary["quote"];
  countText: string;
  message: string;
  onWhatsApp: () => void;
  onSend: () => void;
  headingRef: Ref<HTMLHeadingElement>;
};

/**
 * "What AIMS receives" (Design Doc 9, summary card): the exact message,
 * then the two send options, then the preview notice. Review decision 2:
 * "Continue to WhatsApp" says the buyer can still review it there.
 */
export function QuoteSummary({ t, countText, message, onWhatsApp, onSend, headingRef }: Props) {
  return (
    <section aria-labelledby="summary-title" className="rounded-lg border border-line bg-paper p-4 sm:p-6">
      <h2 id="summary-title" ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-ink">
        {t.summaryHeading}
      </h2>
      <p className="mt-1 text-sm text-ink-600 tabular-nums">{countText}</p>
      <p className="mt-4 text-sm font-semibold text-ink">{t.messageHeading}</p>
      <pre
        aria-live="off"
        className="mt-1 max-h-80 overflow-auto rounded-md bg-green-50 p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink"
      >
        {message}
      </pre>
      <div className="mt-5 grid gap-2.5">
        <button
          type="button"
          onClick={onWhatsApp}
          className="flex h-12 items-center justify-center gap-2 rounded-pill bg-whatsapp font-semibold text-white hover:brightness-95"
        >
          <WhatsAppIcon width={18} height={18} />
          {t.whatsappCta}
        </button>
        <button
          type="button"
          onClick={onSend}
          className="flex h-12 items-center justify-center rounded-pill border border-ink font-semibold text-ink hover:bg-ink hover:text-white"
        >
          {t.sendCta}
        </button>
      </div>
      <p className="mt-3 text-sm text-ink-600">{t.whatsappNote}</p>
      <p className="mt-3 flex gap-2 rounded-md bg-paper-2 p-3 text-sm text-ink-700">
        <span aria-hidden="true" className="font-bold text-warn">
          !
        </span>
        {t.demoNote}
      </p>
    </section>
  );
}
