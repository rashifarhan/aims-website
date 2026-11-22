"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { inputClass } from "./fields";

type Props = {
  t: Dictionary["quote"];
  productsHref: string;
  /**
   * Set when an installation or export enquiry arrives with an empty list (/quote?need=install): the
   * buyer may know no model yet, so describing the site leads and browsing follows (site polish T7).
   */
  preset?: "install" | "export";
};

/** "Add a product" and "Describe an item we don't list" (a free-text line), under the quote lines. */
export function DescribeItem({ t, productsHref, preset }: Props) {
  const [describing, setDescribing] = useState(false);
  const [text, setText] = useState("");
  const copy =
    preset === "install"
      ? { action: t.describeSite, label: t.describeSiteLabel, placeholder: t.describeSitePlaceholder }
      : preset === "export"
        ? { action: t.describeExport, label: t.describeExportLabel, placeholder: t.describeExportPlaceholder }
        : { action: `+ ${t.describe}`, label: t.describeLabel, placeholder: t.describePlaceholder };

  const add = () => {
    if (!text.trim()) return;
    dispatchQuote({ type: "addCustom", id: `c-${Date.now()}`, text, qty: 1 });
    setText("");
    setDescribing(false);
  };

  const browse = (
    <Link href={productsHref} className="home-secondary">
      {preset ? t.browse : `+ ${t.addProduct}`}
    </Link>
  );

  return (
    <>
      {preset && (
        <p className="max-w-2xl text-base text-ink-700">{preset === "install" ? t.presetInstall : t.presetExport}</p>
      )}
      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        {preset ? null : browse}
        {/* The id moves from this button to the field, so the error summary's link always lands on it. */}
        {!describing && (
          <button
            type="button"
            id="quote-items"
            onClick={() => setDescribing(true)}
            className={preset ? "home-button home-button-sm" : "home-secondary text-start"}
          >
            {copy.action}
          </button>
        )}
        {preset ? browse : null}
      </div>
      {describing && (
        <div className="motion-disclose mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="quote-items" className="sr-only">
            {copy.label}
          </label>
          <input
            id="quote-items"
            autoFocus
            value={text}
            maxLength={200}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={copy.placeholder}
            className={inputClass}
          />
          <button type="button" onClick={add} className="home-button home-button-outline home-button-sm shrink-0">
            {t.describeAdd}
          </button>
        </div>
      )}
    </>
  );
}
