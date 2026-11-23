import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { AboutStory } from "@/components/company/AboutStory";
import { CompanyClose } from "@/components/company/CompanyClose";
import { CompanyIntro } from "@/components/company/CompanyIntro";
import { ContactReach } from "@/components/contact/ContactReach";
import { LocationCards } from "@/components/contact/LocationCards";
import { HomeProof } from "@/components/home/HomeProof";
import { MomentTrigger } from "@/components/home/MomentTrigger";
import "@/components/home/sections.css";
import "@/components/solution/solution.css";
import "@/components/contact/contact.css";
import "@/components/signature/reach.css";
import "@/components/company/company.css";

export async function generateMetadata(): Promise<Metadata> {
  const { about: c } = await getDictionary();
  return { title: c.metaTitle, description: c.metaDescription, alternates: alternates(await getLocale(), "/about") };
}

/**
 * About & showrooms (Master Plan 12 #7; Design Doc 10.1 T10: story, fact sheet, showrooms, partner
 * status, testimonials). The company-stated figures and AIMS's published reviews are the homepage's
 * proof section, unchanged. The one dealt moment is SIGNAL, the shared reach map, in a band of its
 * own (as on /contact). No team names or photos: AIMS has not supplied them.
 */
export default async function About() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.about;
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main" className="w-full flex-1">
      <CompanyIntro
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/about"), label: c.crumb },
        ]}
        eyebrow={ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
        title={c.title}
        lead={c.lead}
        primary={{ href: `${href("/about")}#showrooms`, label: c.primary }}
        secondary={{ href: href("/quote"), label: c.secondary }}
        photo="proface-x"
      />
      <AboutStory />
      <HomeProof />
      <ContactReach t={t.contactPage} labels={t.home.reach} />
      <div id="showrooms" className="co-showrooms page-container">
        <LocationCards t={t.contactPage} />
      </div>
      <CompanyClose
        id="about-close-title"
        heading={c.closeHeading}
        body={c.closeBody}
        action={{ href: href("/quote"), label: c.closeAction }}
        secondary={{ href: href("/contact"), label: c.closeSecondary }}
      />
      <MomentTrigger />
    </main>
  );
}
