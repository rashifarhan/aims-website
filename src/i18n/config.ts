/**
 * Locales. English is served without a prefix (keeps every existing
 * aimsuae.me URL); Arabic lives under /ar. src/proxy.ts rewrites unprefixed
 * paths to /en internally.
 */
export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const hasLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

/** Public path for a locale: "/products" (en) or "/ar/products" (ar). */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
