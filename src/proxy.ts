import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";

/**
 * Locale routing. English has no prefix so existing aimsuae.me URLs keep
 * working (/product/f18); Arabic is under /ar. Internally every page lives
 * under app/[lang], so unprefixed paths are rewritten to /en/…, and anyone
 * visiting /en/… is redirected to the unprefixed URL (one canonical URL).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if ((LOCALES as readonly string[]).includes(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, metadata routes and any path with a file extension.
  matcher: ["/((?!_next/|api/|images/|robots\\.txt|sitemap\\.xml|favicon\\.ico|.*\\.[a-z0-9]+$).*)"],
};
