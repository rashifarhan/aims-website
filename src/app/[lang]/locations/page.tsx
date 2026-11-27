import type { Metadata } from "next";
import { LocationMarkets } from "@/components/locations/LocationMarkets";
import { LocationOffices } from "@/components/locations/LocationOffices";
import { ReachMap } from "@/components/home/ReachMap";
import { ReachBand } from "@/components/ui/ReachBand";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { PageHero } from "@/components/ui/PageHero";
import { PAGE_FLOOD } from "@/components/families/pageFloods";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { CONTACT } from "@/lib/site";
import "@/components/signature/reach.css";
import "@/components/locations/locations.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locations } = await getDictionary();
  return {
    title: locations.hub.metaTitle,
    description: locations.hub.metaDescription,
    alternates: alternates(await getLocale(), "/locations"),
  };
}

/**
 * T2 Locations hub (Master Plan 12 #6; Design Doc 10.1 T2): where to visit in the UAE, then the markets AIMS
 * supplies from Dubai, each a page or a preset export quote ("no orphan markets"). Its one dealt moment is
 * SIGNAL, the routes from Dubai to every market drawing once.
 */
export default async function LocationsHub() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.locations.hub;
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main">
      <PageHero
        flood={PAGE_FLOOD.locations}
        variant="split"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/locations"), label: t.nav.locations },
        ]}
        title={c.title}
        lead={c.lead}
        primary={{ href: "#delivery", label: c.primary }}
        secondary={{ href: "#uae", label: c.secondary }}
        fact={
          <span lang="en" dir="ltr">
            {CONTACT.showroomAddress}
          </span>
        }
        set="offices"
      />
      <LocationOffices id="uae" />
      <ReachBand
        id="delivery"
        titleId="delivery-title"
        heading={c.deliveryHeading}
        lead={c.deliveryLead}
        map={<ReachMap labels={t.home.reach} />}
      >
        <LocationMarkets />
      </ReachBand>
      <SolutionQuestions idPrefix="lh" copy={c.faq} />
      <ClosePanel
        id="lh-cta-title"
        heading={c.cta.heading}
        body={c.cta.body}
        action={{ href: href("/quote?need=export"), label: c.cta.action }}
        secondary={{ href: href("/contact"), label: c.cta.secondary }}
      />
    </main>
  );
}
