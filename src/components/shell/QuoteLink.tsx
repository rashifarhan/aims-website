"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ListIcon } from "@/components/icons";
import { readQuoteCount, subscribeQuote } from "@/lib/quote/storage";

type Props = { href: string; label: string; countLabel: string; className?: string };

/** Header "Quote" pill with a live item count (0 on the server, real after hydration). */
export function QuoteLink({ href, label, countLabel, className = "" }: Props) {
  const count = useSyncExternalStore(subscribeQuote, readQuoteCount, () => 0);
  return (
    <Link
      href={href}
      aria-label={count ? countLabel.replace("{count}", String(count)) : label}
      className={`inline-flex h-10 items-center gap-2 rounded-pill border border-ink px-4 text-sm font-semibold text-ink transition-colors duration-(--duration-fast) hover:bg-ink hover:text-white ${className}`}
    >
      <ListIcon width={18} height={18} className="hidden sm:block" />
      <span>{label}</span>
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-green-700 px-1.5 text-xs font-semibold text-white tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
