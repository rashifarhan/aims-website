import type { Locale } from "@/i18n/config";

/** Attributes for English product data shown inside a page. */
export type DataAttrs = { lang?: "en"; dir?: "ltr" };

/**
 * Product data is English (CLAUDE.md 7). On Arabic pages it is marked `lang="en"` for pronunciation and
 * `dir="ltr"` so the bidi algorithm doesn't reorder "3000 Templates" or move an ellipsis to the line start
 * (audit G4, same as ProductCard).
 */
export const englishData = (locale: Locale): DataAttrs => (locale === "en" ? {} : { lang: "en", dir: "ltr" });
