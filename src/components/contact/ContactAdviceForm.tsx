"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { dispatchQuote } from "@/lib/quote/useQuote";
import type { ContactNeed } from "@/lib/site";

type Props = { t: Dictionary["contactPage"]; need: ContactNeed; quoteHref: string };

const fieldClass =
  "w-full rounded-md border border-line-strong bg-paper px-3.5 text-base text-ink focus:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700";

/**
 * "Or leave a short message" (Design Doc 10.1, T9): the message becomes an advice line in the quote
 * request, so everything is sent together. The confirmation belongs to the need it was added under, so
 * it clears when the buyer picks another need; a half-typed message is kept.
 */
export function ContactAdviceForm({ t, need, quoteHref }: Props) {
  const [message, setMessage] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState(false);
  const [addedFor, setAddedFor] = useState<ContactNeed | null>(null);
  const added = addedFor === need;

  const addAdvice = () => {
    if (!message.trim()) {
      setError(true);
      document.getElementById("contact-message")?.focus();
      return;
    }
    const text =
      fmt(t.advicePrefix, { need: t.needs[need].label, message: message.trim() }) +
      (need === "visit" && day.trim() ? fmt(t.visitSuffix, { day: day.trim() }) : "");
    dispatchQuote({ type: "addCustom", id: `advice-${Date.now()}`, text, qty: 1 });
    if (need === "export") dispatchQuote({ type: "setContext", patch: { need: "export" } });
    setMessage("");
    setDay("");
    setError(false);
    setAddedFor(need);
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        addAdvice();
      }}
      className="mt-6 border-t border-line pt-5"
    >
      <h3 className="font-semibold text-ink">{t.formTitle}</h3>
      <p className="mt-1 text-sm text-ink-600">{t.formLead}</p>
      <label htmlFor="contact-message" className="mt-4 mb-1.5 block text-sm font-semibold text-ink">
        {t.message}
      </label>
      <textarea
        id="contact-message"
        value={message}
        maxLength={160}
        rows={3}
        onChange={(e) => {
          setMessage(e.target.value);
          if (error && e.target.value.trim()) setError(false);
        }}
        aria-invalid={error || undefined}
        aria-describedby={error ? "contact-message-hint contact-message-error" : "contact-message-hint"}
        className={`${fieldClass} py-3 aria-invalid:border-error`}
      />
      <p id="contact-message-hint" className="mt-1.5 text-sm text-ink-600">
        {t.messageHint}
      </p>
      {error && (
        <p id="contact-message-error" className="mt-1.5 text-sm font-medium text-error">
          {t.errorMessage}
        </p>
      )}
      {need === "visit" && (
        <>
          <label htmlFor="contact-day" className="mt-4 mb-1.5 block text-sm font-semibold text-ink">
            {t.visitDay}
          </label>
          <input
            id="contact-day"
            value={day}
            maxLength={40}
            onChange={(e) => setDay(e.target.value)}
            className={`${fieldClass} h-12`}
          />
        </>
      )}
      {/* Outline: the channel buttons above are this panel's main action (Design Doc 9 Button). */}
      <button type="submit" className="home-button home-button-outline home-button-sm mt-4">
        {t.submit}
      </button>
      <p role="status" className="mt-3 text-sm text-ink-700 empty:hidden">
        {added && (
          <>
            {t.added}{" "}
            <Link href={quoteHref} className="ui-link">
              {t.review}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
