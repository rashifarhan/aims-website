import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { COMPANY_NAME, CONTACT, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { HomeStage } from "@/components/home/HomeStage";
import { HomeFigures } from "@/components/home/HomeFigures";
import { HomeFamilies } from "@/components/home/HomeFamilies";
import { HomePlaces } from "@/components/home/HomePlaces";
import { HomeSoftware } from "@/components/home/HomeSoftware";
import { HomeJourney } from "@/components/home/HomeJourney";
import { HomeVisit } from "@/components/home/HomeVisit";
import { HomeClose } from "@/components/home/HomeClose";
import { ModelStrip } from "@/components/ui/ModelStrip";
import "@/components/home/home.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.home.metaTitle,
    description: t.home.metaDescription,
    alternates: alternates(await getLocale(), "/"),
  };
}

/**
 * T1, direction 3 (CLAUDE.md → Design rules; home mockups approved 27 Nov 2026): the pinned family slider, then
 * reading sections that alternate chalk and family grounds, never two alike side by side: figures and reviews
 * (chalk) · model codes (time) · the six families (chalk) · places (entry) · software (chalk) · the five-step journey
 * (time) · visit or call (chalk) · the closing QUOTE flood (access). Factual Organization data: Plan AT-12.
 */
export default async function Home() {
  return (
    <main id="main" className="home-flood">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: COMPANY_NAME,
          url: SITE_URL,
          email: CONTACT.email,
          telephone: CONTACT.lines.headOffice.tel,
        }}
      />
      <HomeStage />
      <HomeFigures />
      <ModelStrip />
      <HomeFamilies />
      <HomePlaces />
      <HomeSoftware />
      <HomeJourney />
      <HomeVisit />
      <HomeClose />
    </main>
  );
}
