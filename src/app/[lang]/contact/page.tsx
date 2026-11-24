import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/ui/PageHero";
import { ContactRouter } from "@/components/contact/ContactRouter";
import { ReachMap } from "@/components/home/ReachMap";
import { ReachBand } from "@/components/ui/ReachBand";
import { LocationCards } from "@/components/contact/LocationCards";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { CONTACT } from "@/lib/site";
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
    <main id="main" className="w-full flex-1">
      <PageHero
        variant="compact"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/contact"), label: t.nav.contact },
        ]}
        title={t.contactPage.title}
        lead={t.contactPage.lead}
      />
      {/* Section: the shared rhythm and the same content edges as the header and footer (taste House rule 4). */}
      <Section className="co-contact">
        <ContactRouter
          t={t.contactPage}
          hrefs={{ products: href("/products"), quote: href("/quote") }}
          showroom={{ address: CONTACT.showroomAddress, map: CONTACT.showroomMap }}
        />
      </Section>
      <LocationCards t={t.contactPage} />
      <ReachBand
        titleId="contact-reach-title"
        heading={t.contactPage.reachTitle}
        lead={t.contactPage.reachLead}
        map={<ReachMap labels={t.home.reach} />}
      />
      <MomentTrigger />
    </main>
  );
}
