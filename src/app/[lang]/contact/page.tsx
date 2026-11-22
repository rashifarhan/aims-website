import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactRouter } from "@/components/contact/ContactRouter";
import { ContactReach } from "@/components/contact/ContactReach";
import { LocationCards } from "@/components/contact/LocationCards";
import { MomentTrigger } from "@/components/home/MomentTrigger";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { CONTACT } from "@/lib/site";
import "@/components/contact/channel-button.css";
import "@/components/contact/contact.css";
import "@/components/signature/reach.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.contactPage.metaTitle,
    description: t.contactPage.metaDescription,
    alternates: alternates(await getLocale(), "/contact"),
  };
}

/**
 * T9 Contact (Design Doc 10.1; Master Plan ch. 12 row 8, replaces /enquiry). Its one dealt moment is
 * the reach band after the branches: the SIGNAL routes draw once (taste motion.md).
 */
export default async function ContactPage() {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main" className="w-full flex-1 bg-paper-2">
      {/* page-container: the same content edges as the header and footer (taste House rule 4). */}
      <div className="page-container pt-6 pb-16">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: href("/"), label: t.common.home },
            { href: href("/contact"), label: t.nav.contact },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t.contactPage.title}</h1>
        <p className="mt-2 mb-8 max-w-2xl text-base text-ink-600 sm:text-lg">{t.contactPage.lead}</p>
        <ContactRouter
          t={t.contactPage}
          hrefs={{ products: href("/products"), quote: href("/quote") }}
          showroom={{ address: CONTACT.showroomAddress, map: CONTACT.showroomMap }}
        />
        <LocationCards t={t.contactPage} />
      </div>
      <ContactReach t={t.contactPage} labels={t.home.reach} />
      <MomentTrigger />
    </main>
  );
}
