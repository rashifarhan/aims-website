import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { COMPANY_NAME, CONTACT, SITE_URL, whatsappUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { FloatingContact } from "@/components/home/FloatingContact";
import { Hero } from "@/components/home/Hero";
import { BuyerRoutes } from "@/components/home/BuyerRoutes";
import { ProductFamilies } from "@/components/home/ProductFamilies";
import { DoorTeaser } from "@/components/home/DoorTeaser";
import { HomeProof } from "@/components/home/HomeProof";
import { HomeLocations } from "@/components/home/HomeLocations";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeClosing } from "@/components/home/HomeClosing";
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

/** T1 sequence: Design Doc ch. 10; factual Organization data: Plan AT-12. */
export default async function Home() {
  const t = await getDictionary();
  return (
    <main id="main">
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
      <BuyerRoutes />
      <ProductFamilies />
      <DoorTeaser />
      <HomeProof />
      <HomeLocations />
      <HomeFaq />
      <HomeClosing />
      <MomentTrigger />
      <FloatingContact href={whatsappUrl()} labels={t.contactPreview} />
    </main>
  );
}
