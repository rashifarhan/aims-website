import type { Metadata } from "next";
import Link from "next/link";
import { ContactLink } from "@/components/contact/ContactLink";
import { CompanyClose } from "@/components/company/CompanyClose";
import { SUPPORT_SECTIONS, SupportSections } from "@/components/company/SupportSections";
import { EditorialIntro } from "@/components/editorial/EditorialIntro";
import { OnThisPage } from "@/components/editorial/OnThisPage";
import { MomentTrigger } from "@/components/home/MomentTrigger";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { CONTACT, whatsappUrl } from "@/lib/site";
import "@/components/solution/solution.css";
import "@/components/editorial/editorial.css";
import "@/components/signature/verify-moment.css";
import "@/components/company/company.css";

export async function generateMetadata(): Promise<Metadata> {
  const { support: c } = await getDictionary();
  return { title: c.metaTitle, description: c.metaDescription, alternates: alternates(await getLocale(), "/support") };
}

/**
 * Support & warranty (Master Plan 12 #10, T10; Design Doc 10.1): /zkteco-warranty-policy and /faq 301
 * here (#warranty, #faq). The actions are WhatsApp and email, AIMS's published channels; AIMS names no
 * support phone line, so none is chosen for it (CLAUDE.md open questions). Its dealt moment is the support
 * route in the process section (SupportRoute): the two published channels draw into AIMS's support team.
 */
export default async function Support() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.support;
  const href = (p: string) => localePath(locale, p);
  const headings = { warranty: c.warrantyHeading, process: c.processHeading, faq: c.faqHeading };
  return (
    <main id="main" className="w-full flex-1">
      <EditorialIntro
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/support"), label: c.crumb },
        ]}
        title={c.title}
        lead={c.lead}
      >
        <div className="ed-actions">
          <ContactLink kind="whatsapp" href={whatsappUrl()} target={CONTACT.whatsapp} className="home-button">
            {c.whatsapp}
          </ContactLink>
          <ContactLink kind="email" href={`mailto:${CONTACT.email}`} target={CONTACT.email} className="home-secondary">
            {c.email}
          </ContactLink>
          <Link href={href("/contact")} className="home-secondary">
            {c.closeSecondary}
          </Link>
        </div>
      </EditorialIntro>
      <div className="ed-layout page-container">
        <OnThisPage
          labels={{ wide: t.editorial.onThisPage, narrow: t.editorial.jumpTo }}
          items={SUPPORT_SECTIONS.map((id) => ({ id, text: headings[id] }))}
        />
        <SupportSections />
      </div>
      <CompanyClose
        id="support-close-title"
        heading={c.closeHeading}
        body={c.closeBody}
        action={{ href: href("/quote"), label: c.closeAction }}
        secondary={{ href: href("/contact"), label: c.closeSecondary }}
      />
      <MomentTrigger />
    </main>
  );
}
