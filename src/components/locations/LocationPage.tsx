import type { Metadata } from "next";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { PageHero } from "@/components/ui/PageHero";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { productBySlug } from "@/content/catalogue";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";
import { alternates } from "@/lib/seo";
import { CONTACT, ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { LocationModels } from "./LocationModels";
import { LocationOffices } from "./LocationOffices";
import { LocationReach } from "./LocationReach";
import { LocationSteps } from "./LocationSteps";

export async function locationMetadata(market: LocationMarket): Promise<Metadata> {
  const { locations } = await getDictionary();
  return {
    title: locations[market].metaTitle,
    description: locations[market].metaDescription,
    // localePath pairs the Dubai page's two URLs, so each language is self-canonical (Plan 12 #32, #35).
    alternates: alternates(await getLocale(), LOCATION_PAGES[market].path),
  };
}

/**
 * T7 location page (Master Plan 12 #32–35, 14; Design Doc 10.1 T7): place title with the fulfilment badge,
 * where to visit (Dubai), models with Add to quote, then what AIMS does here and the delivery steps beside the
 * SIGNAL map (the one dealt moment), FAQ (support and warranty) and the destination-preset quote.
 */
export async function LocationPage({ market }: { market: LocationMarket }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const page = LOCATION_PAGES[market];
  const c = t.locations[market];
  const common = t.locations.common;
  const id = { dubai: "ld", oman: "lo", kenya: "lk" }[market];
  const photo = productBySlug(page.hero)?.images[0];
  const fact =
    market === "dubai" ? (
      <span lang="en" dir="ltr">
        {CONTACT.showroomAddress}
      </span>
    ) : ZKTECO_AUTHORIZATION_CONFIRMED ? (
      t.common.partnerConfirmed
    ) : (
      t.common.partner
    );
  return (
    <main id="main">
      <PageHero
        variant="split"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/locations"), label: t.nav.locations },
          { href: href(page.path), label: c.title },
        ]}
        eyebrow={c.eyebrow}
        title={c.title}
        lead={c.lead}
        primary={{ href: href(page.quote), label: c.primary }}
        secondary={{ href: market === "dubai" ? "#visit" : "#models", label: c.secondary }}
        fact={fact}
        photo={photo}
      />
      {market === "dubai" && <LocationOffices id="visit" />}
      <LocationModels id="models" preset={page.preset} />
      <LocationReach
        id="delivery"
        heading={c.reachHeading}
        lead={c.reachLead}
        destination={market === "dubai" ? undefined : market}
        mapLabel={"mapLabel" in c ? c.mapLabel : undefined}
      >
        <LocationSteps label={common.stepsLabel} steps={c.steps} />
      </LocationReach>
      <SolutionQuestions idPrefix={id} copy={c.faq} />
      <ClosePanel
        id={`${id}-cta-title`}
        heading={c.cta.heading}
        body={c.cta.body}
        action={{ href: href(page.quote), label: c.cta.action }}
        secondary={{ href: href("/locations"), label: common.allLocations }}
      />
      <MomentTrigger />
    </main>
  );
}
