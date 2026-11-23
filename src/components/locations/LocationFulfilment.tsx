import { getDictionary } from "@/i18n/dictionaries";
import { LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";
import { CONTACT } from "@/lib/site";
import { ContactLink } from "@/components/contact/ContactLink";
import { ReachMap } from "@/components/home/ReachMap";

export async function LocationFulfilment({ market }: { market: LocationMarket }) {
  const all = await getDictionary();
  const t = all.locationPage[market];
  const context = LOCATION_PAGES[market].context;
  const destination = "country" in context ? context.country : undefined;
  return (
    <section id="fulfilment" className="locations-section locations-markets location-fulfilment-section" data-moment>
      <div className="wrap page-container">
        <h2>{t.sectionTitle}</h2>
        <p className="locations-lead">{t.sectionLead}</p>
        <div className="locations-market-grid">
          <div>
            <ol className="location-steps">
              {t.steps.map((step, i) => (
                <li key={step.title}>
                  <span className="location-step-number" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            {market === "dubai" && (
              <div className="location-showroom">
                <h3>{all.locationPage.showroom}</h3>
                <p lang="en">
                  <bdi>{CONTACT.showroomAddress}</bdi>
                </p>
                <div className="locations-actions">
                  <ContactLink
                    kind="phone"
                    href={`tel:${CONTACT.lines.showroom.tel}`}
                    target={CONTACT.lines.showroom.display}
                    className="locations-link"
                  >
                    {all.locationPage.call}
                    <span dir="ltr">{CONTACT.lines.showroom.display}</span>
                  </ContactLink>
                  <a href={CONTACT.showroomMap} target="_blank" rel="noopener noreferrer" className="locations-link">
                    {all.locationPage.directions}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>
          <ReachMap labels={{ ...all.home.reach, mapLabel: t.mapLabel }} destination={destination} />
        </div>
      </div>
    </section>
  );
}
