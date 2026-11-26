"use client";

import Link from "next/link";
import { useQuoteCount } from "./AddToQuote";

/** The one ask at the end: a quote for what the visitor collected on the way (or for the whole system). */
export function QuoteCta({ href }: { href: string }) {
  const count = useQuoteCount();
  return (
    <p className="sys-cta">
      <Link href={href} className="sys-cta-button">
        {count > 0 ? `Request a quote for ${count} item${count === 1 ? "" : "s"}` : "Request a quote"}
      </Link>
      <span>{count > 0 ? "Your list is saved on this device." : "Add the products you need above, or describe your site on the quote form."}</span>
    </p>
  );
}
