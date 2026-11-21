import type { Metadata } from "next";
import Link from "next/link";
import { inter, plexArabic } from "./fonts";
import "./globals.css";

/**
 * 404 for unmatched URLs. The root layout sits under a dynamic [lang]
 * segment, so Next renders this page directly instead (docs: global-not-found).
 * It cannot know the locale, so it carries one Arabic line.
 */
export const metadata: Metadata = {
  title: "Page not found | AIMS Security Systems",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${plexArabic.variable}`}>
      <body>
        <main id="main" className="mx-auto w-full max-w-(--container-page) px-4 py-24 sm:px-6">
          <p className="text-xl font-bold tracking-wide">
            AIMS<span className="text-lime">.</span>
          </p>
          <h1 className="mt-10 text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-3 max-w-lg text-ink-600">
            The page may have moved. Try searching for a model code, or browse all products.
          </p>
          <p lang="ar" dir="rtl" className="mt-2 max-w-lg font-arabic text-ink-600">
            الصفحة غير موجودة. تصفح جميع المنتجات.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex h-11 items-center rounded-pill bg-green-700 px-5 font-medium text-white hover:bg-green-800"
          >
            Browse products
          </Link>
        </main>
      </body>
    </html>
  );
}
