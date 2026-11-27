"use client";

import Link from "next/link";
import { useState } from "react";
import { ContactLink } from "@/components/contact/ContactLink";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import type { QuoteContext } from "@/lib/quote/context";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { CONTACT, whatsappUrl } from "@/lib/site";

type Props = {
  /** The listing's search text; it fills the field until the buyer types their own. */
  initial: string;
  preset?: Partial<QuoteContext>;
  hrefs: { quote: string; solutions: string; showroom: string };
  t: Dictionary["catalogue"];
};

/**
 * "Can't find your model?" (design note): always at the end of the results, so a buyer is never stuck. It adds a
 * free-text request to the quote list (the same line the empty state's "Ask us about" adds), or opens WhatsApp or a
 * call. It promises only what AIMS says: it will check availability and reply, never that it can source anything.
 */
export function CantFindPanel({ initial, preset, hrefs, t }: Props) {
  const [typed, setTyped] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const text = typed ?? initial;
  const wanted = text.trim();
  const message = wanted ? fmt(t.cantFindWhatsappText, { text: wanted }) : t.cantFindWhatsappGeneric;

  return (
    <section aria-labelledby="cant-find-title" className="ui-panel lst-cantfind">
      <h2 id="cant-find-title" className="ui-display text-home-subtitle leading-tight text-ink">
        {t.cantFindTitle}
      </h2>
      <p className="mt-2 max-w-xl text-ink-700">{t.cantFindBody}</p>

      <form
        className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!wanted) return;
          dispatchQuote({ type: "addCustom", id: `ask-${Date.now()}`, text: wanted, qty: 1, preset });
          setTyped("");
          setAdded(true);
        }}
      >
        <div className="flex-1">
          <label htmlFor="cant-find-field" className="mb-1.5 block text-sm font-medium text-ink">
            {t.cantFindField}
          </label>
          <input
            id="cant-find-field"
            type="text"
            required
            maxLength={200}
            value={text}
            onChange={(e) => {
              setTyped(e.target.value);
              setAdded(false);
            }}
            autoComplete="off"
            className="h-12 w-full rounded-md border border-line-strong bg-paper px-4 text-base text-ink focus:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700"
          />
        </div>
        <button type="submit" className="home-button">
          {t.cantFindSubmit}
        </button>
      </form>

      <p role="status" className="mt-3 min-h-6 text-sm text-ink-700">
        {added && (
          <>
            <span className="font-semibold text-green-700">{t.cantFindAdded}</span>{" "}
            <Link href={hrefs.quote} className="ui-link">
              {t.viewQuote}
            </Link>
          </>
        )}
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        <ContactLink
          kind="whatsapp"
          href={whatsappUrl(message)}
          target={CONTACT.lines.mobile.display}
          message={message}
          className="home-button home-button-outline home-button-whatsapp home-button-sm"
        >
          <WhatsAppIcon width={18} height={18} />
          {t.cantFindWhatsapp}
        </ContactLink>
        <ContactLink
          kind="phone"
          href={`tel:${CONTACT.lines.showroom.tel}`}
          target={CONTACT.lines.showroom.display}
          className="home-button home-button-outline home-button-sm"
        >
          <PhoneIcon width={18} height={18} />
          {t.cantFindCall}
        </ContactLink>
      </div>

      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <Link href={hrefs.solutions} className="ui-link inline-flex min-h-11 items-center">
          {t.cantFindSolutions}
        </Link>
        <Link href={hrefs.showroom} className="ui-link inline-flex min-h-11 items-center">
          {t.cantFindShowroom}
        </Link>
      </p>
    </section>
  );
}
