import type { Metadata } from "next";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { LocationIntro } from "@/components/locations/LocationIntro";
import { LocationMarkets } from "@/components/locations/LocationMarkets";
import { LocationOffices } from "@/components/locations/LocationOffices";
import { LocationReach } from "@/components/locations/LocationReach";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { productBySlug } from "@/content/catalogue";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { HUB_HERO } from "@/lib/locationPages";
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
  const photo = productBySlug(HUB_HERO)?.images[0];
  return (
    <main id="main">
      <LocationIntro
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/locations"), label: t.nav.locations },
        ]}
        copy={c}
        hrefs={{ primary: "#delivery", secondary: "#uae" }}
        fact={
          <span lang="en" dir="ltr">
            {CONTACT.showroomAddress}
          </span>
        }
        photo={photo}
      />
      <LocationOffices id="uae" />
      <LocationReach id="delivery" heading={c.deliveryHeading} lead={c.deliveryLead}>
        <LocationMarkets />
      </LocationReach>
      <SolutionQuestions idPrefix="lh" copy={c.faq} />
      <ClosePanel
        id="lh-cta-title"
        heading={c.cta.heading}
        body={c.cta.body}
        action={{ href: href("/quote?need=export"), label: c.cta.action }}
        secondary={{ href: href("/contact"), label: c.cta.secondary }}
      />
      <MomentTrigger />
    </main>
  );
}
