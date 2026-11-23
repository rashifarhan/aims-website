"use client";

import type { Ref } from "react";
import { WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { MessagePreview } from "./MessagePreview";

type Props = {
  t: Dictionary["quote"];
  countText: string;
  message: string;
  reference: string;
  onWhatsApp: () => void;
  onSend: () => void;
  headingRef: Ref<HTMLHeadingElement>;
};

/**
 * "What AIMS receives" (Design Doc 9, summary card): the exact message,
 * then the two send options, then the preview notice. Review decision 2:
 * "Continue to WhatsApp" says the buyer can still review it there.
 */
export function QuoteSummary({ t, countText, message, reference, onWhatsApp, onSend, headingRef }: Props) {
  return (
    <section aria-labelledby="summary-title" className="ui-panel">
      <h2 id="summary-title" ref={headingRef} tabIndex={-1} className="text-home-subtitle font-card text-ink">
        {t.summaryHeading}
      </h2>
      <p className="mt-1 text-sm text-ink-600 tabular-nums">{countText}</p>
      <p className="mt-4 text-sm font-semibold text-ink">{t.messageHeading}</p>
      <MessagePreview message={message} reference={reference} className="mt-1 max-h-80" />
      {/* "Send enquiry" is the request itself, so it leads; WhatsApp keeps its own colour as the outline
          (site polish, 22 Nov 2026; Design Doc 9 Button: one main action). */}
      <div className="mt-5 grid gap-2.5">
        <button type="button" onClick={onSend} className="home-button">
          {t.sendCta}
        </button>
        <button type="button" onClick={onWhatsApp} className="home-button home-button-outline home-button-whatsapp">
          <WhatsAppIcon width={18} height={18} />
          {t.whatsappCta}
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
