"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { localePath, type Locale } from "@/i18n/config";

/**
 * Path of the same page in the other language: /x ↔ /ar/x, keeping ?query and #hash so a filtered
 * listing or a section stays where it was. localePath pairs the Dubai page's two URLs.
 */
export function counterpartPath(browserPath: string, target: Locale): string {
  const at = browserPath.search(/[?#]/);
  const pathname = at < 0 ? browserPath : browserPath.slice(0, at);
  const suffix = at < 0 ? "" : browserPath.slice(at);
  const bare = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  return localePath(target, bare) + suffix;
}

const noop = () => () => {};

/**
 * Language link. The proxy rewrites URLs, so the browser path is only
 * known on the client (Next docs: usePathname with rewrites). The server
 * renders the other language's home page; the link updates on hydration.
 */
export function LanguageSwitch({
  target,
  label,
  className = "",
}: {
  target: Locale;
  label: string;
  className?: string;
}) {
  usePathname(); // re-render on client navigation
  const browserPath = useSyncExternalStore(
    noop,
    () => window.location.pathname + window.location.search + window.location.hash,
    () => null,
  );
  const href = browserPath === null ? (target === "ar" ? "/ar" : "/") : counterpartPath(browserPath, target);
  return (
    // No prefetch: prefetching the other language's page through the proxy rewrite loops in this Next version
    // (~2,000 requests in 5 s on /ar/locations and /ar/contact, reproduced 23 Nov 2026; see prefetchSafe).
    <Link href={href} hrefLang={target} lang={target} className={className} prefetch={false}>
      {label}
    </Link>
  );
}
