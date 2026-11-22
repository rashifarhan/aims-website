"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { NEED_CHANNELS, whatsappUrl, type ContactNeed } from "@/lib/site";
import { ContactLink } from "./ContactLink";

const NEEDS: ContactNeed[] = ["sales", "software", "visit", "export"];

type Props = {
  t: Dictionary["contactPage"];
  hrefs: { products: string; quote: string };
  showroom: { address: string; map: string };
};

const digits = (tel: string) => tel.replace(/\D/g, "");

/**
 * T9 "What do you need?" (Design Doc 10.1; Master Plan T9): one choice,
 * then the right channel as large buttons, then a short message that
 * becomes an advice line in the quote request. Channels follow AIMS's own
 * published routing (src/lib/site.ts NEED_CHANNELS).
 */
export function ContactRouter({ t, hrefs, showroom }: Props) {
  const router = useRouter();
  const [need, setNeed] = useState<ContactNeed>("sales");
  const [message, setMessage] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const line = NEED_CHANNELS[need];
  const chatText = t.whatsappText[need];

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
    setAdded(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
      <fieldset>
        <legend className="mb-3 text-lg font-semibold text-ink">{t.needLegend}</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {NEEDS.map((n) => (
            <label
              key={n}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-line-strong bg-paper p-4 has-checked:border-green-700 has-checked:bg-green-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-green-700"
            >
              <input
                type="radio"
                name="contact-need"
                value={n}
                checked={need === n}
                onChange={() => {
                  setNeed(n);
                  setAdded(false);
                }}
                className="mt-1 size-4.5 shrink-0 accent-green-700"
              />
              <span>
                <span className="block font-semibold text-ink">{t.needs[n].label}</span>
                <span className="block text-sm text-ink-600">{t.needs[n].hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <section aria-labelledby="contact-channel-title" className="rounded-lg border border-line bg-paper p-5 sm:p-6">
        <h2 id="contact-channel-title" className="text-xl font-semibold text-ink">
          {t.needs[need].label}
        </h2>

        {/* Design Doc 10.1 T9 mobile: channels as large buttons. */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ContactLink
            kind="whatsapp"
            href={whatsappUrl(chatText, digits(line.tel))}
            target={line.display}
            message={chatText}
            className="flex min-h-12 items-center justify-center gap-2 rounded-pill bg-whatsapp px-4 font-semibold text-white hover:brightness-95"
          >
            <WhatsAppIcon width={18} height={18} />
            <span>{t.whatsapp}</span>
            <span dir="ltr" className="tabular-nums">
              {line.display}
            </span>
          </ContactLink>
          <ContactLink
            kind="phone"
            href={`tel:${line.tel}`}
            target={line.display}
            className="flex min-h-12 items-center justify-center gap-2 rounded-pill border border-ink px-4 font-semibold text-ink hover:bg-ink hover:text-white"
          >
            <PhoneIcon width={18} height={18} />
            <span>{t.call}</span>
            <span dir="ltr" className="tabular-nums">
              {line.display}
            </span>
          </ContactLink>
        </div>

        <div className="mt-4 text-sm text-ink-700">
          {need === "sales" && (
            <p>
              {t.salesNext}{" "}
              <Link href={hrefs.products} className="font-semibold text-green-700 underline underline-offset-2">
                {t.salesCta}
              </Link>
            </p>
          )}
          {need === "software" && <p>{t.softwareNext}</p>}
          {need === "visit" && (
            <div className="flex gap-2.5">
              <PinIcon width={18} height={18} className="mt-0.5 shrink-0 text-ink-400" />
              <p>
                <span className="block font-medium text-ink">{showroom.address}</span>
                {t.visitNext}{" "}
                <a
                  href={showroom.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 underline underline-offset-2"
                >
                  {t.directions}
                  <span className="sr-only"> (Google Maps)</span>
                </a>
              </p>
            </div>
          )}
          {need === "export" && (
            <p>
              {t.exportNext}{" "}
              <button
                type="button"
                onClick={() => {
                  dispatchQuote({ type: "setContext", patch: { need: "export" } });
                  router.push(hrefs.products);
                }}
                className="font-semibold text-green-700 underline underline-offset-2"
              >
                {t.exportCta}
              </button>
            </p>
          )}
        </div>

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
            className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-3 text-base text-ink focus:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700 aria-invalid:border-error"
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
                className="h-12 w-full rounded-md border border-line-strong bg-paper px-3.5 text-base text-ink focus:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700"
              />
            </>
          )}
          <button
            type="submit"
            className="mt-4 inline-flex h-11 items-center rounded-pill bg-green-700 px-5 font-semibold text-white hover:bg-green-800"
          >
            {t.submit}
          </button>
          <p role="status" className="mt-3 text-sm text-ink-700 empty:hidden">
            {added && (
              <>
                {t.added}{" "}
                <Link href={hrefs.quote} className="font-semibold text-green-700 underline underline-offset-2">
                  {t.review}
                </Link>
              </>
            )}
          </p>
        </form>
      </section>
    </div>
  );
}
