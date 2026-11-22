"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useContactGuard } from "@/components/contact/ContactGuard";
import type { Dictionary } from "@/i18n/dictionaries";
import { countLabel, fmt } from "@/i18n/format";
import { DemoAdapter, type QuoteReceipt } from "@/lib/quote/adapter";
import { messageLabels } from "@/lib/quote/labels";
import { buildQuoteMessage, makeReference } from "@/lib/quote/message";
import { EMPTY_CONTACT, validateRequest, type Contact, type FieldError } from "@/lib/quote/request";
import { dispatchQuote, useQuote } from "@/lib/quote/useQuote";
import { needFromSearch } from "@/lib/quote/context";
import { CONTACT, LIVE_CONTACT, whatsappUrl } from "@/lib/site";
import { EmptyQuote } from "./EmptyQuote";
import { MobileReviewBar } from "./MobileReviewBar";
import type { CatalogEntry } from "./QuoteItems";
import { QuotePanels } from "./QuotePanels";
import { QuoteSummary } from "./QuoteSummary";
import { Receipt } from "./Receipt";

type Props = {
  catalog: Record<string, CatalogEntry>;
  t: Dictionary["quote"];
  stepper: { qty: string; decrease: string; increase: string };
  hrefs: { products: string; productBase: string };
};

const noopSubscribe = () => () => {};

/** One reference per page visit, created in the browser only (never during prerender). */
let visitReference: string | null = null;
const getReference = () => (visitReference ??= makeReference());

/**
 * T8 quote request (Design Doc 10). Items and the need come from the saved
 * list; contact details live in memory only. Validation runs on send and
 * then live, so fixed errors disappear as the buyer types (AT-05).
 */
export function QuoteView({ catalog, t, stepper, hrefs }: Props) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const quote = useQuote();
  const context = useMemo(() => quote.context ?? {}, [quote.context]);
  const guard = useContactGuard();

  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [attempt, setAttempt] = useState<"enquiry" | "whatsapp" | null>(null);
  const [receipt, setReceipt] = useState<QuoteReceipt | null>(null);
  const [sent, setSent] = useState("");
  const reference = useSyncExternalStore(noopSubscribe, getReference, () => "");
  const summaryRef = useRef<HTMLDivElement>(null);
  const summaryHeading = useRef<HTMLHeadingElement>(null);
  const [focusErrors, setFocusErrors] = useState(0);

  const errors: FieldError[] = attempt ? validateRequest(quote.lines, context, contact, attempt) : [];

  useEffect(() => {
    if (focusErrors) summaryRef.current?.focus();
  }, [focusErrors]);

  // A link such as /quote?need=install arrives with that need chosen (Design Doc 12).
  useEffect(() => {
    const need = needFromSearch(window.location.search);
    if (need) dispatchQuote({ type: "setContext", patch: { need } });
  }, []);

  const products = useMemo(
    () => Object.fromEntries(Object.entries(catalog).map(([k, v]) => [k, { name: v.name, model: v.model }])),
    [catalog],
  );
  // The WhatsApp chat is itself the reply channel; the enquiry states how to reply.
  const buildMessage = (mode: "enquiry" | "whatsapp") =>
    buildQuoteMessage({
      reference,
      lines: quote.lines,
      products,
      context,
      contact: {
        name: contact.name,
        company: contact.company,
        replyBy: mode === "enquiry" ? contact.replyBy : undefined,
      },
      labels: messageLabels(t),
    });
  const message = buildMessage("whatsapp");

  const units = quote.lines.reduce((n, l) => n + l.qty, 0);
  // Each count takes its own singular or plural, so one line of one unit reads "1 item · 1 unit".
  const countText = fmt(t.itemsSummary, {
    items: countLabel(quote.lines.length, t.itemOne, t.itemMany),
    units: countLabel(units, t.unitOne, t.unitMany),
  });
  const fail = (mode: "enquiry" | "whatsapp") => {
    setAttempt(mode);
    if (validateRequest(quote.lines, context, contact, mode).length) {
      setFocusErrors((n) => n + 1);
      return true;
    }
    return false;
  };

  const onWhatsApp = () => {
    if (fail("whatsapp")) return;
    const text = buildMessage("whatsapp");
    const href = whatsappUrl(text);
    if (LIVE_CONTACT || !guard) window.open(href, "_blank", "noopener,noreferrer");
    else guard({ kind: "whatsapp", href, target: CONTACT.lines.mobile.display, message: text });
  };

  const onSend = async () => {
    if (fail("enquiry")) return;
    const text = buildMessage("enquiry");
    setSent(text);
    setReceipt(await DemoAdapter.submit({ reference, lines: quote.lines, context, contact, message: text }));
  };

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
