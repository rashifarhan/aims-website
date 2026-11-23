"use client";

import { useRef, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { EmptyQuote } from "./EmptyQuote";
import { MobileReviewBar } from "./MobileReviewBar";
import type { CatalogEntry } from "./QuoteItems";
import { QuotePanels } from "./QuotePanels";
import { QuoteSummary } from "./QuoteSummary";
import { Receipt } from "./Receipt";
import { noopSubscribe, useQuoteRequest } from "./useQuoteRequest";

type Props = {
  catalog: Record<string, CatalogEntry>;
  /** Software a link may request (/quote?software=<slug>): slug → the line's text. */
  software: Record<string, string>;
  t: Dictionary["quote"];
  stepper: { qty: string; decrease: string; increase: string };
  hrefs: { products: string; productBase: string };
};

/**
 * T8 quote request (Design Doc 10). The state and handlers live in useQuoteRequest; this view decides
 * which of the four states to show: loading, receipt, empty, or the form.
 */
export function QuoteView({ catalog, software, t, stepper, hrefs }: Props) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const summaryHeading = useRef<HTMLHeadingElement>(null);
  const {
    quote,
    context,
    contact,
    setContact,
    errors,
    receipt,
    setReceipt,
    sent,
    attempt,
    setAttempt,
    summaryRef,
    reference,
    message,
    countText,
    onWhatsApp,
    onSend,
  } = useQuoteRequest(catalog, software, t);

  if (!hydrated) return <div className="min-h-96" aria-hidden="true" />;

  if (receipt) {
    return (
      <div className="mt-8">
        <Receipt
          receipt={receipt}
          message={sent}
          // Validation passed, so the need is set; the fallback only satisfies the type.
          signals={[countText, context.need ? t.needs[context.need] : "", t.replyChannels[receipt.channel]]}
          t={t}
          productsHref={hrefs.products}
          onEdit={() => setReceipt(null)}
          onClear={() => {
            dispatchQuote({ type: "clear" });
            setReceipt(null);
            setAttempt(null);
          }}
        />
      </div>
    );
  }

  // An installation or export link (/quote?need=install) opens the form even with nothing listed (site
  // polish T7); once any need is chosen the form stays, so changing it never swaps back to this state.
  if (!quote.lines.length && !attempt && !context.need) return <EmptyQuote t={t} productsHref={hrefs.products} />;

  return (
    <div className="mt-8 pb-24 lg:pb-0">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8">
        <QuotePanels
          lines={quote.lines}
          context={context}
          contact={contact}
          onContact={(patch) => setContact((c) => ({ ...c, ...patch }))}
          errors={errors}
          summaryRef={summaryRef}
          catalog={catalog}
          t={t}
          stepper={stepper}
          hrefs={hrefs}
        />
        <div id="quote-summary" className="mt-4 lg:sticky lg:top-24 lg:mt-0">
          <QuoteSummary
            t={t}
            countText={countText}
            message={message}
            reference={reference}
            onWhatsApp={onWhatsApp}
            onSend={onSend}
            headingRef={summaryHeading}
          />
        </div>
      </div>

      <MobileReviewBar countText={countText} label={t.reviewCta} headingRef={summaryHeading} />
    </div>
  );
}
