/**
 * Locales. English is served without a prefix (keeps every existing
 * aimsuae.me URL); Arabic lives under /ar. src/proxy.ts rewrites unprefixed
 * paths to /en internally.
 */
export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/**
 * The Dubai location page keeps both of its aimsuae.me URLs (Master Plan 12 #32 and #35): English at
 * /zkteco-distributor-in-dubai, Arabic at /ar/zkteco-dubai. localePath pairs them, so links, hreflang and
 * the language switch never build /ar/zkteco-distributor-in-dubai.
 */
export const DUBAI_PATHS = { en: "/zkteco-distributor-in-dubai", ar: "/ar/zkteco-dubai" } as const;
const DUBAI_ALIASES: readonly string[] = [DUBAI_PATHS.en, DUBAI_PATHS.ar, "/zkteco-dubai"];

export const hasLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

/** Public path for a locale: "/products" (en) or "/ar/products" (ar). */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const pathname = clean.split(/[?#]/)[0];
  if (DUBAI_ALIASES.includes(pathname)) return DUBAI_PATHS[locale] + clean.slice(pathname.length);
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
