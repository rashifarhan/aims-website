import type { Metadata } from "next";
import { SmoothScroll } from "@/components/inside/SmoothScroll";
import { PageStage } from "@/components/products-inside/PageStage";
import { LOCATION_STAGES } from "@/components/products-inside/stages";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { ReachBand } from "@/components/ui/ReachBand";
import { ReachMap } from "@/components/home/ReachMap";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";
import { alternates } from "@/lib/seo";
import { LocationInside } from "./LocationInside";
import { LocationModels } from "./LocationModels";
import { LocationOffices } from "./LocationOffices";
import { LocationSteps } from "./LocationSteps";
import "@/components/inside/inside.css";
import "@/components/inside/skin.css";
import "@/components/products-inside/products-inside.css";

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
 * T7 location page (Master Plan 12 #32–35, 14) in direction 2 (CLAUDE.md → Design rules): the place's giant word and
 * its hero model on a stage, the place's facts opening out of the model's screen; then where to visit (Dubai), the
 * models with Add to quote, delivery beside the SIGNAL map, FAQ (support and warranty) and the destination-preset quote.
 */
export async function LocationPage({ market }: { market: LocationMarket }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const page = LOCATION_PAGES[market];
  const c = t.locations[market];
  const common = t.locations.common;
  const id = { dubai: "ld", oman: "lo", kenya: "lk" }[market];
  const stage = LOCATION_STAGES[market];
  return (
    <main id="main" className="d2 flex-1">
      <PageStage
        id="loc-stage"
        stage={stage}
        word={t.locationsStage.words[market]}
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/locations"), label: t.nav.locations },
          { href: href(page.path), label: c.title },
        ]}
        title={c.title}
        lead={c.lead}
        primary={{ href: href(page.quote), label: c.primary }}
        secondary={{ href: market === "dubai" ? "#visit" : "#models", label: c.secondary }}
        productHref={href(`/product/${stage.productSlug}`)}
      >
        <LocationInside market={market} faqId={`${id}-faq-title`} />
      </PageStage>
      {market === "dubai" && <LocationOffices id="visit" />}
      {/* Dubai's offices take the band above; Oman and Kenya open on the models, so those take it. */}
      <LocationModels id="models" preset={page.preset} ground={market === "dubai" ? "paper" : "band"} />
      <ReachBand
        id="delivery"
        titleId="delivery-title"
        heading={c.reachHeading}
        lead={c.reachLead}
        map={
          <ReachMap
            labels={{ ...t.home.reach, mapLabel: "mapLabel" in c ? c.mapLabel : t.home.reach.mapLabel }}
            destination={market === "dubai" ? undefined : market}
          />
        }
      >
        <LocationSteps label={common.stepsLabel} steps={c.steps} />
      </ReachBand>
      <SolutionQuestions idPrefix={id} copy={c.faq} />
      <ClosePanel
        id={`${id}-cta-title`}
        heading={c.cta.heading}
        body={c.cta.body}
        action={{ href: href(page.quote), label: c.cta.action }}
        secondary={{ href: href("/locations"), label: common.allLocations }}
      />
      <SmoothScroll />
    </main>
  );
}
