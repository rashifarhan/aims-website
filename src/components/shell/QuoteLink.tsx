"use client";

import { NavigationLink as Link } from "./NavigationLink";
import { useQuote } from "@/lib/quote/useQuote";

type Props = { externalLabel: string; href: string; label: string; itemsLabel: string; className?: string };

/**
 * The header's one filled button: the main action, worded as everywhere else on the page
 * (skill copy rule 5), with the live item count (0 on the server, real after hydration).
 * The kit's .btn carries the hover step and press (motion.md); no transform of our own.
 */
export function QuoteLink({ href, label, itemsLabel, externalLabel, className = "" }: Props) {
  const count = useQuote().lines.length;
  return (
    <Link externalLabel={externalLabel} href={href} className={`btn btn--primary gap-2 ${className}`}>
      <span>{label}</span>
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-paper px-1.5 text-xs font-semibold text-green-800 tabular-nums">
          {count}
          {/* The accessible name keeps the visible words and the count in it (WCAG 2.5.3). */}
          <span className="sr-only"> {itemsLabel}</span>
        </span>
      )}
    </Link>
  );
}
