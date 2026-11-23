"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import { fmt } from "@/i18n/format";
import { dispatchQuote, useQuote } from "@/lib/quote/useQuote";

export type AddSoftwareLabels = { add: string; inQuote: string; added: string; viewQuote: string; line: string };

type Props = { slug: string; name: string; quoteHref: string; labels: AddSoftwareLabels };

/**
 * The software page's main action. No installer file is published yet (CLAUDE.md §1, open question:
 * permission to link software files), so "Add to quote" puts one described line in the quote list:
 * the Plan's "Need licences or installation?" step (Design Doc 11, Download flow). Once added it
 * says so and links to the list; the change is announced.
 */
export function AddSoftwareToQuote({ slug, name, quoteHref, labels }: Props) {
  const quote = useQuote();
  const id = `software-${slug}`;
  const inQuote = quote.lines.some((l) => l.kind === "custom" && l.id === id);
  const [status, setStatus] = useState("");
  const link = useRef<HTMLAnchorElement>(null);
  const justAdded = useRef(false);

  // The button unmounts once the line exists: keep keyboard focus on the link that replaced it
  // (WCAG 2.4.3), as the catalogue's AddToQuote does, instead of dropping it to the page.
  useEffect(() => {
    if (!inQuote || !justAdded.current) return;
    justAdded.current = false;
    link.current?.focus();
  }, [inQuote]);

  return (
    <div className="sw-add">
      {inQuote ? (
        <>
          <span className="sw-in-quote">
            <span aria-hidden="true">✓</span> {labels.inQuote}
          </span>
          <Link ref={link} href={quoteHref} className="home-text-link">
            {labels.viewQuote}
            <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
          </Link>
        </>
      ) : (
        <button
          type="button"
          className="home-button"
          onClick={() => {
            justAdded.current = true;
            dispatchQuote({ type: "requestSoftware", slug, text: fmt(labels.line, { name }) });
            setStatus(fmt(labels.added, { name }));
          }}
        >
          {labels.add}
        </button>
      )}
      <span role="status" className="sr-only">
        {status}
      </span>
    </div>
  );
}
