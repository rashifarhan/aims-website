import type { Metadata } from "next";
import { MomentTrigger } from "@/components/home/MomentTrigger";
import { SolutionCta } from "@/components/solution/SolutionCta";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { productBySlug } from "@/content/catalogue";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";
import { alternates } from "@/lib/seo";
import { CONTACT, ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { LocationIntro } from "./LocationIntro";
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
    <main id="main" className="loc-page">
      <LocationIntro
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/locations"), label: t.nav.locations },
          { href: href(page.path), label: c.title },
        ]}
        copy={c}
        hrefs={{ primary: href(page.quote), secondary: market === "dubai" ? "#visit" : "#models" }}
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
      {/* The close is the questions screen's last block, as on the solution pages: alone, each was a mostly
          empty screen (three-skill audit). */}
      <SolutionQuestions
        idPrefix={id}
        copy={c.faq}
        close={
          <SolutionCta
            idPrefix={id}
            page={{ quote: page.quote }}
            copy={{ ...c.cta, secondary: common.allLocations }}
            secondaryHref="/locations"
            embedded
          />
        }
      />
      <MomentTrigger />
    </main>
  );
}
