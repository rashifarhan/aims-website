import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { PageHero } from "@/components/ui/PageHero";
import { PAGE_FLOOD } from "@/components/families/pageFloods";
import { ServicesCover } from "@/components/company/ServicesCover";
import { ServicesList } from "@/components/company/ServicesList";
import { ServicesProcess } from "@/components/company/ServicesProcess";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import "@/components/solution/solution.css";
import "@/components/signature/verify-moment.css";
import "@/components/company/company.css";

export async function generateMetadata(): Promise<Metadata> {
  const { services: c } = await getDictionary();
  return { title: c.metaTitle, description: c.metaDescription, alternates: alternates(await getLocale(), "/services") };
}

/**
 * Services (Master Plan 12 #5, T3: supply, design, install, support; process with owners; coverage;
 * warranty; primary action an installation quote). Copy is limited to what AIMS publishes: no lead
 * times, SLAs or hours. The one dealt moment is VERIFY on the process (ServicesProcess).
 */
export default async function Services() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.services;
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main" className="w-full flex-1">
      <PageHero
        flood={PAGE_FLOOD.services}
        variant="split"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/services"), label: c.crumb },
        ]}
        eyebrow={c.eyebrow}
        title={c.title}
        lead={c.lead}
        primary={{ href: href("/quote?need=install"), label: c.primary }}
        secondary={{ href: `${href("/support")}#warranty`, label: c.secondary }}
        set="services"
      />
      <ServicesList />
      <ServicesProcess />
      <ServicesCover />
      <ClosePanel
        id="services-close-title"
        heading={c.closeHeading}
        body={c.closeBody}
        action={{ href: href("/quote?need=install"), label: c.closeAction }}
        secondary={{ href: href("/contact"), label: c.closeSecondary }}
      />
      <MomentTrigger />
    </main>
  );
}
