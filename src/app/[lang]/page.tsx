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
import { HomeVisit } from "@/components/home/HomeVisit";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { ModelStrip } from "@/components/ui/ModelStrip";
import "@/components/home/home.css";
import "@/components/home/sections.css";
import "@/components/home/premium.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.home.metaTitle,
    description: t.home.metaDescription,
    alternates: alternates(await getLocale(), "/"),
  };
}

/**
 * T1, premium pass (client decision 6, 24 Nov 2026): hero · four company figures · the model-code strip · six
 * product families · where it goes (stand-in photographs) · software (night) · showroom and offices · the closing
 * call (night) with the journey as one line of steps. The FAQ, buyer routes, reviews, door teaser and reach map left
 * the home page (they live on as needed elsewhere: the reach map on contact, about and locations, the door on access
 * control, the reviews on about). Factual Organization data: Plan AT-12.
 */
export default async function Home() {
  const t = await getDictionary();
  const locale = await getLocale();
  const close = t.home.closing;
  const j = t.home.journey;
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
      <HomeVisit />
      <ClosePanel
        id="closing-title"
        heading={close.heading}
        body={close.body}
        action={{ href: localePath(locale, "/quote"), label: close.action }}
        secondary={{ href: localePath(locale, "/products"), label: close.secondary }}
        steps={{
          label: j.heading,
          items: [j.tell.title, j.quote.title, j.supply.title, j.install.title, j.support.title],
        }}
      />
      <FloatingContact href={whatsappUrl()} labels={t.contactPreview} />
    </main>
  );
}
