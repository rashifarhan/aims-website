import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { lang } from "next/root-params";
import { inter, plexArabic, plexMono } from "../fonts";
import { LOCALES, dir, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { ContactGuardProvider } from "@/components/contact/ContactGuard";
import "../globals.css";
import "@/components/ui/actions.css";

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
    // The design skill's kind (SKILL.md 1): AIMS sells and installs ZKTeco hardware, so page type
    // "product" and site-kind "tech". The skill's dealers and checker read these two metas.
    other: { "site-kind": "tech", "page-type": "product" },
  };
}

// Pinch-zoom stays enabled (the current site disables it: Plan A15).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const value = await lang();
  const locale = hasLocale(value) ? value : "en";
  const t = await getDictionary();
  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${inter.variable} ${plexMono.variable} ${plexArabic.variable} h-full`}
      // The kit's page attributes (design skill system.md): AIMS's pill buttons (Design Doc 9),
      // the soft radius set, the motion layer on, page type product.
      data-type="product"
      data-radius="soft"
      data-buttons="pill"
      data-motion=""
    >
      <body className="flex min-h-full flex-col">
        <ContactGuardProvider labels={t.contactGuard}>
          <Header />
          {children}
          <Footer />
        </ContactGuardProvider>
        {/* The hero waits for motion.js instead of flashing; after 700ms it stands regardless
            (design skill motion.md, The hero's entrance). The moments get the same guard. */}
        <Script id="kit-enter" strategy="beforeInteractive">
          {`document.documentElement.classList.add('m-enter','mo-js');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700);setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)`}
        </Script>
        {/* The kit's runtime, loaded from public/assets as plain files (SKILL.md 4, step 0). */}
        <Script type="module" src="/assets/system.js" strategy="afterInteractive" />
        <Script type="module" src="/assets/motion/motion.js" strategy="afterInteractive" />
        <Script type="module" src="/assets/layout/layout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
