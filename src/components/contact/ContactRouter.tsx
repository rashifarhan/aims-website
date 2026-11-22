"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { CONTACT, NEED_CHANNELS, whatsappUrl, type ContactNeed } from "@/lib/site";
import { ContactAdviceForm } from "./ContactAdviceForm";
import { ContactLink } from "./ContactLink";

const NEEDS: ContactNeed[] = ["sales", "software", "visit", "export"];

type Props = {
  t: Dictionary["contactPage"];
  hrefs: { products: string; quote: string };
  showroom: { address: string; map: string };
};

const digits = (tel: string) => tel.replace(/\D/g, "");

type LineKey = keyof typeof CONTACT.lines;
const LINE_KEYS = Object.keys(CONTACT.lines) as LineKey[];
/** Which published line answers a need: NEED_CHANNELS holds the line itself, so look its name back up. */
const lineFor = (need: ContactNeed) => LINE_KEYS.find((k) => CONTACT.lines[k] === NEED_CHANNELS[need]);

/**
 * T9 "What do you need?" (Design Doc 10.1; Master Plan T9): one choice,
 * then the right channel as large buttons, then a short message that
 * becomes an advice line in the quote request. Channels follow AIMS's own
 * published routing (src/lib/site.ts NEED_CHANNELS).
 */
export function ContactRouter({ t, hrefs, showroom }: Props) {
  const router = useRouter();
  const [need, setNeed] = useState<ContactNeed>("sales");
  const line = NEED_CHANNELS[need];
  const lineKey = lineFor(need);
  const chatText = t.whatsappText[need];

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
                onChange={() => setNeed(n)}
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

      <section
        aria-labelledby="contact-channel-title"
        className="@container rounded-lg border border-line bg-paper p-5 sm:p-6"
      >
        <h2 id="contact-channel-title" className="text-xl font-semibold text-ink">
          {t.needs[need].label}
        </h2>
        {/* Micro (site polish): name the line that answers this need, from AIMS's own routing; no hours. */}
        {lineKey && <p className="mt-1 text-sm text-ink-600">{fmt(t.answeredBy, { line: t.lineNames[lineKey] })}</p>}

        {/* Design Doc 10.1 T9 mobile: channels as large buttons. Side by side only where both fit whole. */}
        <div className="mt-4 grid gap-3 @2xl:grid-cols-2">
          <ContactLink
            kind="whatsapp"
            href={whatsappUrl(chatText, digits(line.tel))}
            target={line.display}
            message={chatText}
            className="home-button home-button-whatsapp"
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
            className="home-button home-button-outline"
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

        <ContactAdviceForm t={t} need={need} quoteHref={hrefs.quote} />
      </section>
    </div>
  );
}
