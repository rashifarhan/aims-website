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
        {/* One text run, so in a flex link a wrapped label keeps the arrow after its last word. The arrow
            mirrors in Arabic (Design Doc 13). */}
        <span>
          {children}
          <span aria-hidden="true" className="ms-1 inline-block rtl:-scale-x-100">
            ↗
          </span>
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
