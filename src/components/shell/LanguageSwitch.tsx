"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";

/** Path of the same page in the other language: /x ↔ /ar/x. */
export function counterpartPath(browserPath: string, target: Locale): string {
  const bare = browserPath.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  return target === "ar" ? (bare === "/" ? "/ar" : `/ar${bare}`) : bare;
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
    () => window.location.pathname,
    () => null,
  );
  const href = browserPath === null ? (target === "ar" ? "/ar" : "/") : counterpartPath(browserPath, target);
  return (
    <Link href={href} hrefLang={target} lang={target} className={className}>
      {label}
    </Link>
  );
}
