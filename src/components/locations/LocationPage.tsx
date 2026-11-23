import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";
import { LocationHero } from "./LocationHero";
import { LocationFulfilment } from "./LocationFulfilment";
import { LocationProducts } from "./LocationProducts";
import { LocationSupport } from "./LocationSupport";
import { LocationsMotion } from "./LocationsMotion";
import "./locations.css";
import "./location-page.css";

export async function locationMetadata(market: LocationMarket): Promise<Metadata> {
  const t = (await getDictionary()).locationPage[market];
  return {
    title: t.metaTitle,
    description: t.description,
    alternates: alternates(await getLocale(), LOCATION_PAGES[market].path),
    other: { "page-type": "product", "site-kind": "tech" },
  };
}

/** Master Plan ch. 14 / Design Doc 10.1, T7: one template, distinct visit and export journeys. */
export async function LocationPage({ market }: { market: LocationMarket }) {
  return (
    <main id="main" className="locations-hub location-page" data-market={market}>
      <LocationHero market={market} />
      <LocationFulfilment market={market} />
      <LocationProducts market={market} />
      <LocationSupport market={market} />
      <LocationsMotion />
    </main>
  );
}
