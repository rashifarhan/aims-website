import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { COMPANY_NAME, CONTACT, SITE_URL, whatsappUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { FloatingContact } from "@/components/home/FloatingContact";
import { Hero } from "@/components/home/Hero";
import { BuyerRoutes } from "@/components/home/BuyerRoutes";
import { ProductFamilies } from "@/components/home/ProductFamilies";
import { HomeSoftware } from "@/components/home/HomeSoftware";
import { DoorTeaser } from "@/components/home/DoorTeaser";
import { HomeProof } from "@/components/home/HomeProof";
import { HomeLocations } from "@/components/home/HomeLocations";
import { HomeFaq } from "@/components/home/HomeFaq";
import { ClosePanel } from "@/components/ui/ClosePanel";
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

/** T1 sequence: Design Doc ch. 10, with the proof moved up by the client; factual Organization data: Plan AT-12. */
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
      {/* Client instruction (24 Nov 2026): the proof is AIMS's strongest trust signal, so it follows the hero. Only the
          proof and the reach band stay night green (client decision, 24 Nov 2026; premium.css, band rhythm). */}
      <HomeProof />
      <BuyerRoutes />
      <ProductFamilies />
      <HomeSoftware />
      <DoorTeaser />
      <HomeLocations />
      <HomeFaq />
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
