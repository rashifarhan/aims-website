import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

type Props = { slug: string; label: string; quoteHref: string; compact?: boolean };

/**
 * A real link to the quote that names the platform (/quote?software=<slug>); the quote page adds the line. It works
 * without JavaScript and can be opened in a new tab or shared. No prefetch: query-string links loop through the
 * locale rewrite when prefetched (lib/prefetchSafe.ts).
 */
export function SoftwareEnquiryButton({ slug, label, quoteHref, compact }: Props) {
  return (
    <Link
      href={`${quoteHref}?software=${encodeURIComponent(slug)}`}
      prefetch={false}
      className={compact ? "home-text-link relative z-1 mt-3 min-h-11 self-start" : "home-button"}
    >
      {label}
      {!compact && <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />}
    </Link>
  );
}
