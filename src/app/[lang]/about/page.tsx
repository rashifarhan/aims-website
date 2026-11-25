import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { AboutStory } from "@/components/company/AboutStory";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { PageHero } from "@/components/ui/PageHero";
import { ReachMap } from "@/components/home/ReachMap";
import { ReachBand } from "@/components/ui/ReachBand";
import { LocationCards } from "@/components/contact/LocationCards";
import { HomeProof } from "@/components/home/HomeProof";
import "@/components/home/sections.css";
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
    <main id="main" className="co-about w-full flex-1">
      <PageHero
        variant="split"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/about"), label: c.crumb },
        ]}
        eyebrow={ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
        title={c.title}
        lead={c.lead}
        primary={{ href: `${href("/about")}#showrooms`, label: c.primary }}
        secondary={{ href: href("/quote"), label: c.secondary }}
        scene="company"
      />
      <AboutStory />
      {/* Premium pass: proof and reach share one night ground, so the page has one night band before the close. */}
      <div className="co-night-pair section-night">
        <HomeProof />
        <ReachBand
          titleId="contact-reach-title"
          heading={t.contactPage.reachTitle}
          lead={t.contactPage.reachLead}
          map={<ReachMap labels={t.home.reach} />}
        />
      </div>
      <LocationCards t={t.contactPage} id="showrooms" />
      <ClosePanel
        id="about-close-title"
        heading={c.closeHeading}
        body={c.closeBody}
        action={{ href: href("/quote"), label: c.closeAction }}
        secondary={{ href: href("/contact"), label: c.closeSecondary }}
      />
    </main>
  );
}
