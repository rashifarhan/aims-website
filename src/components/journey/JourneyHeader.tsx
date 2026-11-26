"use client";

import Link from "next/link";
import { useQuoteCount } from "./AddToQuote";

/** The journey's own header: dark glass over the film, AIMS's authorization always in sight, the quote list one tap away. */
export function JourneyHeader({ authorized, paths }: { authorized: string; paths: { home: string; products: string; services: string; quote: string } }) {
  const count = useQuoteCount();
  return (
    <header className="jh">
      <Link href={paths.home} className="jh-mark">
        AIMS
      </Link>
      <span className="jh-badge">{authorized}</span>
      <nav className="jh-nav" aria-label="Site">
        <Link href={paths.products}>Products</Link>
        <Link href={paths.services}>Installation</Link>
        <a href="#your-system">Skip the tour</a>
        <Link href={paths.quote} className="jh-quote">
          Quote list{count > 0 ? <span className="jh-count">{count}</span> : null}
        </Link>
      </nav>
    </header>
  );
}
