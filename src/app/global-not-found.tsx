import type { Metadata } from "next";
import Link from "next/link";
import { archivo, inter, plexArabic } from "./fonts";
import "./globals.css";
import "@/components/ui/actions.css";

/**
 * Last-resort 404. Unknown paths normally render [lang]/not-found inside the shell through the
 * [lang]/[...missing] catch-all; this page only answers what never reaches a locale (docs:
 * global-not-found). It cannot know the locale, so it carries one Arabic line.
 */
export const metadata: Metadata = {
  title: "Page not found | AIMS Security Systems",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable} ${plexArabic.variable}`}>
      <body>
        <main id="main" className="wrap py-24">
          <Link
            href="/"
            aria-label="AIMS Security Systems, home"
            className="ui-display inline-flex min-h-11 items-center text-xl font-extrabold tracking-wordmark"
          >
            <span dir="ltr">
              AIMS<span className="text-lime">.</span>
            </span>
          </Link>
          <h1 className="ui-display mt-10 text-page-title-mobile tracking-tight lg:text-page-title">Page not found</h1>
          <p className="mt-3 max-w-lg text-ink-600">
            The page may have moved. Try searching for a model code, or browse all products.
          </p>
          <p lang="ar" dir="rtl" className="mt-2 max-w-lg font-arabic text-ink-600">
            الصفحة غير موجودة. تصفح جميع المنتجات.
          </p>
          <Link href="/products" className="home-button mt-8">
            Browse products
          </Link>
        </main>
      </body>
    </html>
  );
}
