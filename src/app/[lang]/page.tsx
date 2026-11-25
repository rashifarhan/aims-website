import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { COMPANY_NAME, CONTACT, SITE_URL, whatsappUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { FloatingContact } from "@/components/home/FloatingContact";
import { Hero } from "@/components/home/Hero";
import { HomeFigures } from "@/components/home/HomeFigures";
import { ProductFamilies } from "@/components/home/ProductFamilies";
import { HomeWhereItGoes } from "@/components/home/HomeWhereItGoes";
import { HomeSoftware } from "@/components/home/HomeSoftware";
import { HomeJourney } from "@/components/home/HomeJourney";
import { HomeVisit } from "@/components/home/HomeVisit";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { ModelStrip } from "@/components/ui/ModelStrip";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import "@/components/home/home.css";
import "@/components/home/sections.css";
import "@/components/home/premium.css";
import "@/components/signature/reach.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.home.metaTitle,
    description: t.home.metaDescription,
    alternates: alternates(await getLocale(), "/"),
  };
}

/**
 * T1, the home page previews the header menu (client decision, 25 Nov 2026), one section per item in menu order:
 * hero · four company figures with AIMS's published reviews (About, band) · the model-code strip · six product
 * families (Products) · the photo places, each linked to its solution (Solutions) · software (Software, night) · how
 * AIMS works, the five-step journey (Services, paper) · showroom, offices and the reach map (Locations, night) · the
 * closing call (night). The FAQ, buyer routes and door teaser stay off. Grounds: two night bands mid-page, never side
 * by side; the light journey parts them. Factual Organization data: Plan AT-12.
 */
export default async function Home() {
  const t = await getDictionary();
  const locale = await getLocale();
  const close = t.home.closing;
  return (
    <main id="main" className="home-bands">
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
      <Hero />
      <HomeFigures />
      <ModelStrip />
      <ProductFamilies />
      <HomeWhereItGoes />
      <HomeSoftware />
      <HomeJourney />
      <HomeVisit />
      <ClosePanel
        id="closing-title"
        heading={close.heading}
        body={close.body}
        action={{ href: localePath(locale, "/quote"), label: close.action }}
        secondary={{ href: localePath(locale, "/products"), label: close.secondary }}
      />
      <MomentTrigger />
      <FloatingContact href={whatsappUrl()} labels={t.contactPreview} />
    </main>
  );
}
