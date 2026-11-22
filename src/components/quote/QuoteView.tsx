"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useContactGuard } from "@/components/contact/ContactGuard";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { DemoAdapter, type QuoteReceipt } from "@/lib/quote/adapter";
import { messageLabels } from "@/lib/quote/labels";
import { buildQuoteMessage, makeReference } from "@/lib/quote/message";
import { EMPTY_CONTACT, validateRequest, type Contact, type FieldError, type FieldId } from "@/lib/quote/request";
import { dispatchQuote, useQuote } from "@/lib/quote/useQuote";
import { needFromSearch } from "@/lib/quote/context";
import { CONTACT, LIVE_CONTACT, whatsappUrl } from "@/lib/site";
import { DetailsPanel } from "./DetailsPanel";
import { ErrorSummary } from "./ErrorSummary";
import { Panel } from "./fields";
import { NeedPanel } from "./NeedPanel";
import { QuoteItems, type CatalogEntry } from "./QuoteItems";
import { QuoteSummary } from "./QuoteSummary";
import { Receipt } from "./Receipt";

type Props = {
  catalog: Record<string, CatalogEntry>;
  t: Dictionary["quote"];
  stepper: { qty: string; decrease: string; increase: string };
  hrefs: { products: string; productBase: string };
};

const FIELD_TARGET: Record<FieldId, string> = {
  items: "quote-items",
  need: "need",
  emirate: "quote-emirate",
  country: "quote-country",
  name: "quote-name",
  phone: "quote-phone",
  email: "quote-email",
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
  const errorText = (field: FieldId) => {
    const e = errors.find((x) => x.field === field);
    return e ? t.errors[e.code] : undefined;
  };

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
  const countText =
    quote.lines.length === 1
      ? fmt(t.itemsSummaryOne, { units })
      : fmt(t.itemsSummary, { count: quote.lines.length, units });

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

  if (!quote.lines.length && !attempt) {
    return (
      <div className="mt-8 rounded-lg border border-line bg-paper-2 p-6 sm:p-8">
        {/* Arriving from "Request an installation / export quote": say what to do first, since the
            need is already chosen and the buyer may not know any model yet (critique, 22 Nov 2026). */}
        {context.need === "install" || context.need === "export" ? (
          <p className="mb-4 max-w-2xl text-base text-ink-700">
            {context.need === "install" ? t.presetInstall : t.presetExport}
          </p>
        ) : null}
        <p className="text-lg font-semibold text-ink">{t.empty}</p>
        <Link
          href={hrefs.products}
          className="mt-4 inline-flex h-11 items-center rounded-pill bg-green-700 px-5 font-semibold text-white hover:bg-green-800"
        >
          {t.browse}
        </Link>
        <div className="mt-6 border-t border-line pt-4">
          <QuoteItems
            lines={[]}
            catalog={catalog}
            t={t}
            stepper={stepper}
            productHref={(s) => `${hrefs.productBase}/${s}`}
            productsHref={hrefs.products}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pb-24 lg:pb-0">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8">
        <div className="space-y-4">
          {errors.length > 0 && (
            <ErrorSummary
              ref={summaryRef}
              heading={errors.length === 1 ? t.errorsOne : fmt(t.errorsHeading, { count: errors.length })}
              errors={errors.map((e) => ({ fieldId: FIELD_TARGET[e.field], message: t.errors[e.code] }))}
            />
          )}
          <Panel n={1} id="panel-items" title={`${t.itemsHeading} · ${quote.lines.length}`}>
            <QuoteItems
              lines={quote.lines}
              catalog={catalog}
              t={t}
              stepper={stepper}
              productHref={(s) => `${hrefs.productBase}/${s}`}
              productsHref={hrefs.products}
              error={errorText("items")}
            />
          </Panel>
          <Panel n={2} id="panel-need" title={t.needHeading}>
            <NeedPanel
              context={context}
              t={t}
              errors={{ need: errorText("need"), emirate: errorText("emirate"), country: errorText("country") }}
            />
          </Panel>
          <Panel n={3} id="panel-details" title={t.detailsHeading}>
            <DetailsPanel
              contact={contact}
              onChange={(patch) => setContact((c) => ({ ...c, ...patch }))}
              t={t}
              errors={{ name: errorText("name"), phone: errorText("phone"), email: errorText("email") }}
            />
          </Panel>
        </div>
        <div id="quote-summary" className="mt-4 lg:sticky lg:top-24 lg:mt-0">
          <QuoteSummary
            t={t}
            countText={countText}
            message={message}
            onWhatsApp={onWhatsApp}
            onSend={onSend}
            headingRef={summaryHeading}
          />
        </div>
      </div>

      {/* Mobile: sticky "n items · units · Review quote request" (Design Doc 6, review decision 2). */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-line bg-paper/96 px-4 py-3 shadow-3 backdrop-blur-md lg:hidden">
        <p className="min-w-0 flex-1 text-sm font-semibold text-ink tabular-nums">{countText}</p>
        <button
          type="button"
          onClick={() => {
            document.getElementById("quote-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
            summaryHeading.current?.focus({ preventScroll: true });
          }}
          className="h-11 shrink-0 rounded-pill bg-green-700 px-5 font-semibold text-white"
        >
          {t.reviewCta}
        </button>
      </div>
    </div>
  );
}
