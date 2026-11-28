import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { lang } from "next/root-params";
import { archivo, inter, plexArabic, plexMono } from "../fonts";
import { LOCALES, dir, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { INDEXABLE, SITE_URL, NEED_CHANNELS, whatsappUrl } from "@/lib/site";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { QuoteTray } from "@/components/shell/QuoteTray";
import { FloatingContact } from "@/components/shell/FloatingContact";
import { localePath } from "@/i18n/config";
import { ContactGuardProvider } from "@/components/contact/ContactGuard";
import { RidgeSymbol } from "@/components/ui/RidgeSymbol";
import { HeadingReveal } from "@/components/motion/HeadingReveal";
import "../globals.css";
import "@/components/ui/actions.css";
import "@/components/ui/sections.css";
import "@/components/ui/journey.css";
import "@/components/ui/reveal.css";
import "@/components/ui/ridges.css";

export function generateStaticParams() {
  return LOCALES.map((l) => ({ lang: l }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.defaultTitle, template: t.meta.titleTemplate },
    description: t.meta.defaultDescription,
    applicationName: t.meta.siteName,
    robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  };
}

// Pinch-zoom stays enabled (the current site disables it: Plan A15).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff", // --color-page, the white page (client decision, 24 Nov 2026)
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const value = await lang();
  const locale = hasLocale(value) ? value : "en";
  const t = await getDictionary();
  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${inter.variable} ${archivo.variable} ${plexMono.variable} ${plexArabic.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-paper focus:px-4 focus:py-2 focus:shadow-2"
        >
          {t.nav.skipToContent}
        </a>
        <RidgeSymbol />
        <ContactGuardProvider labels={t.contactGuard}>
          <Header />
          {children}
          <Footer />
          <QuoteTray href={localePath(locale, "/quote")} labels={t.quoteTray} />
          <FloatingContact whatsappHref={whatsappUrl()} line={NEED_CHANNELS.sales} labels={t.floatingContact} />
        </ContactGuardProvider>
        {/* One leaf for every section title's reveal; it reads the path, so it waits behind its own boundary. */}
        <Suspense fallback={null}>
          <HeadingReveal />
        </Suspense>
      </body>
    </html>
  );
}
