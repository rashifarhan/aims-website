import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from "@/i18n/config";
import { SITE_URL } from "./site";

/** The root layout appends " | AIMS Security Systems" (24 chars); titles stay ≤ 60 (AT-12). */
export const TITLE_SUFFIX_LENGTH = " | AIMS Security Systems".length;
export const MAX_TITLE = 60;

/** Shortens at a word boundary so the full title fits. */
export function fitTitle(title: string, budget = MAX_TITLE - TITLE_SUFFIX_LENGTH): string {
  if (title.length <= budget) return title;
  const cut = title.slice(0, budget - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), budget / 2)).trim()}…`;
}

/** Self-canonical + hreflang pair for a path (Plan ch. 16, AT-12/14). */
export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
      "x-default": localePath(DEFAULT_LOCALE, path),
    },
  };
}

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
