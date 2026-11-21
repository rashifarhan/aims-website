"use client";

import { NavigationLink as Link } from "./NavigationLink";
import { ListIcon } from "@/components/icons";
import { useQuote } from "@/lib/quote/useQuote";

type Props = { externalLabel: string; href: string; label: string; itemsLabel: string; className?: string };

/** Header "Quote" pill with a live item count (0 on the server, real after hydration). */
export function QuoteLink({ href, label, itemsLabel, externalLabel, className = "" }: Props) {
  const count = useQuote().lines.length;
  return (
    <Link
      externalLabel={externalLabel}
      href={href}
      className={`inline-flex h-11 items-center gap-2 rounded-pill border border-ink px-4 text-sm font-semibold text-ink transition-colors duration-(--duration-fast) hover:bg-ink hover:text-white ${className}`}
    >
      <ListIcon width={18} height={18} className="hidden sm:block" />
      <span>{label}</span>
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-green-700 px-1.5 text-xs font-semibold text-white tabular-nums">
          {count}
          {/* Accessible name "Quote 3 items" keeps the visible "Quote 3" in it (WCAG 2.5.3). */}
          <span className="sr-only"> {itemsLabel}</span>
        </span>
      )}
    </Link>
  );
}
