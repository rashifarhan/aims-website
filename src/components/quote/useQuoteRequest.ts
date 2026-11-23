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
import { destinationFromSearch, needFromSearch } from "@/lib/quote/context";
import { CONTACT, LIVE_CONTACT, whatsappUrl } from "@/lib/site";
import type { CatalogEntry } from "./QuoteItems";

export const noopSubscribe = () => () => {};

/** One reference per page visit, created in the browser only (never during prerender). */
let visitReference: string | null = null;
const getReference = () => (visitReference ??= makeReference());

/**
 * The state and handlers of the quote request (T8): items and the need come from the saved list, contact
 * details live in memory only, and validation runs on send and then live (AT-05).
 */
export function useQuoteRequest(catalog: Record<string, CatalogEntry>, t: Dictionary["quote"]) {
  const quote = useQuote();
  const context = useMemo(() => quote.context ?? {}, [quote.context]);
  const guard = useContactGuard();

  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [attempt, setAttempt] = useState<"enquiry" | "whatsapp" | null>(null);
  const [receipt, setReceipt] = useState<QuoteReceipt | null>(null);
  const [sent, setSent] = useState("");
  const reference = useSyncExternalStore(noopSubscribe, getReference, () => "");
  const summaryRef = useRef<HTMLDivElement>(null);
  const [focusErrors, setFocusErrors] = useState(0);

  const errors: FieldError[] = attempt ? validateRequest(quote.lines, context, contact, attempt) : [];

  useEffect(() => {
    if (focusErrors) summaryRef.current?.focus();
  }, [focusErrors]);

  // A link such as /quote?need=install arrives with that need chosen (Design Doc 12); an export link from a
  // location page also carries its country (Design Doc 10.1 T7 "set destination").
  useEffect(() => {
    const search = window.location.search;
    const need = needFromSearch(search);
    const patch = destinationFromSearch(search) ?? (need && { need });
    if (patch) dispatchQuote({ type: "setContext", patch });
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

  return {
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
  };
}
