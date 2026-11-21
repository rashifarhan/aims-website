import { getDictionary } from "@/i18n/dictionaries";
import { CONTACT, LIVE_AIMS, LOCATION_LINES } from "@/lib/site";
import { PhoneIcon, PinIcon } from "@/components/icons";
import { ExternalLink } from "./ExternalLink";

/** T1 row 7; addresses, maps and hours that AIMS has not published are left out, not guessed. */
export async function HomeLocations() {
  const t = await getDictionary();
  const l = t.home.locations;
  const details = {
    headOffice: { name: l.headOffice, address: l.dubaiArea, tag: l.office },
    showroom: { name: l.showroom, address: CONTACT.showroomAddress, tag: l.showroomTag },
    abuDhabi: { name: l.abuDhabi, address: l.abuDhabiArea, tag: l.office },
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
      <ul className="home-location-grid">
        {LOCATION_LINES.map((key) => {
          const place = details[key];
          const line = CONTACT.lines[key];
          const showroom = key === "showroom";
          return (
            <li key={key} className={showroom ? "home-location-card home-location-featured" : "home-location-card"}>
              <p className="home-location-tag">
                <PinIcon width="16" height="16" />
                {place.tag}
              </p>
              <h3>{place.name}</h3>
              <p className="home-location-address" lang={showroom ? "en" : undefined}>
                {place.address}
              </p>
              <div className="home-location-actions">
                <a href={`tel:${line.tel}`} className="home-text-link home-text-link-row">
                  <PhoneIcon width="16" height="16" />
                  <span className="sr-only">
                    {l.call} {place.name}
                  </span>
                  <bdi className="tabular-nums">{line.display}</bdi>
                </a>
                {showroom ? (
                  <ExternalLink
                    href={CONTACT.showroomMap}
                    target="_blank"
                    rel="noreferrer"
                    label={l.newTab}
                    className="home-text-link"
                  >
                    {l.map}
                  </ExternalLink>
                ) : (
                  <ExternalLink href={LIVE_AIMS.contact} label={t.common.externalSite} className="home-text-link">
                    {l.plan}
                  </ExternalLink>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
