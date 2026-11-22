import Link from "next/link";
import type { ComponentProps } from "react";
import { navigationHref, prefetchSafe } from "@/lib/navigationHref";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string; externalLabel: string };

/** Explicit external marker; local destinations retain Next navigation and locale state. */
export function NavigationLink({ href, externalLabel, children, ...props }: Props) {
  const destination = navigationHref(href);
  if (destination.startsWith("https://")) {
    return (
      <a {...props} href={destination} title={externalLabel}>
        {children}
        {/* Design Doc 13: the outward arrow mirrors in Arabic; nowrap keeps it on its label's line. */}
        <span aria-hidden="true" className="ms-1 inline-block whitespace-nowrap rtl:-scale-x-100">
          ↗
        </span>
        <span className="sr-only"> · {externalLabel}</span>
      </a>
    );
  }
  return (
    <Link prefetch={prefetchSafe(destination) ? undefined : false} {...props} href={destination}>
      {children}
    </Link>
  );
}
