import { getDictionary } from "@/i18n/dictionaries";
import { CONTACT, LOCATION_LINES } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";

/**
 * T1 row 7 as a ruled table of places: name, address, phone. Only the showroom gets a
 * directions link, because it is the place to visit. Unpublished addresses and hours are left out.
 */
export async function HomeLocations() {
  const t = await getDictionary();
  const l = t.home.locations;
  const details = {
    headOffice: { name: l.headOffice, address: l.dubaiArea },
    showroom: { name: l.showroom, address: CONTACT.showroomAddress },
    abuDhabi: { name: l.abuDhabi, address: l.abuDhabiArea },
  };
  return (
    <section id="showrooms" className="home-section page-container" aria-labelledby="locations-title">
      <div className="home-section-heading">
        <div>
          <h2 id="locations-title" className="home-section-title">
            {l.heading}
          </h2>
          <p className="home-section-lead">{l.lead}</p>
        </div>
      </div>
      <ul className="home-place-list">
        {LOCATION_LINES.map((key) => {
          const place = details[key];
          const line = CONTACT.lines[key];
          const showroom = key === "showroom";
          return (
            <li key={key} className="home-place">
              <h3>{place.name}</h3>
              <p className="home-place-address" lang={showroom ? "en" : undefined}>
                {place.address}
                {showroom && (
                  <>
                    {" "}
                    <ExternalLink
                      href={CONTACT.showroomMap}
                      target="_blank"
                      rel="noreferrer"
                      label={l.newTab}
                      className="home-inline-link"
                    >
                      {l.map}
                    </ExternalLink>
                  </>
                )}
              </p>
              <a href={`tel:${line.tel}`} className="home-place-phone">
                <span className="sr-only">
                  {l.call} {place.name}{" "}
                </span>
                <bdi className="tabular-nums">{line.display}</bdi>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
