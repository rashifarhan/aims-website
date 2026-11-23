import { getDictionary } from "@/i18n/dictionaries";
import { CONTACT, LIVE_AIMS, LOCATION_LINES } from "@/lib/site";
import { PhoneIcon, PinIcon } from "@/components/icons";
import { ExternalLink } from "./ExternalLink";
import { ReachMap } from "./ReachMap";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * T1 row 7 on night green. The Deira showroom leads as the place to visit (DESIGN.md North Star, "The
 * Trusted Showroom"); the two offices follow; the map of where AIMS ships is the page's second dealt
 * moment and draws its routes once. Addresses, maps and hours AIMS hasn't published are left out.
 */
export async function HomeLocations() {
  const t = await getDictionary();
  const l = t.home.locations;
  const r = t.home.reach;
  const details = {
    headOffice: { name: l.headOffice, address: l.dubaiArea, tag: l.office },
    showroom: { name: l.showroom, address: CONTACT.showroomAddress, tag: l.showroomTag },
    abuDhabi: { name: l.abuDhabi, address: l.abuDhabiArea, tag: l.office },
  };
  // The showroom first: it is the one place AIMS invites visitors to.
  const order = ["showroom", "headOffice", "abuDhabi"] as const satisfies readonly (typeof LOCATION_LINES)[number][];
  return (
    <section id="showrooms" className="home-night home-reach" data-moment aria-labelledby="locations-title">
      <div className="home-section wrap">
        <SectionHeader id="locations-title" title={r.heading} lead={r.lead} />
        <div className="home-reach-grid">
          <ul className="home-place-cards">
            {order.map((key) => {
              const place = details[key];
              const line = CONTACT.lines[key];
              const showroom = key === "showroom";
              return (
                <li key={key} className={showroom ? "home-place-card home-place-featured" : "home-place-card"}>
                  <p className="home-place-tag">
                    <PinIcon width="16" height="16" />
                    {place.tag}
                  </p>
                  <h3>{place.name}</h3>
                  <p className="home-place-address" lang={showroom ? "en" : undefined}>
                    {place.address}
                  </p>
                  <div className="home-place-actions">
                    <a href={`tel:${line.tel}`} className="home-night-link">
                      <PhoneIcon width="16" height="16" />
                      <span className="sr-only">
                        {l.call} {place.name}{" "}
                      </span>
                      <bdi className="tabular-nums">{line.display}</bdi>
                    </a>
                    {showroom ? (
                      <ExternalLink
                        href={CONTACT.showroomMap}
                        target="_blank"
                        rel="noreferrer"
                        label={l.newTab}
                        className="home-night-link"
                      >
                        {l.map}
                      </ExternalLink>
                    ) : (
                      <ExternalLink href={LIVE_AIMS.contact} label={t.common.externalSite} className="home-night-link">
                        {l.plan}
                      </ExternalLink>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="home-reach-map">
            <ReachMap labels={r} />
          </div>
        </div>
      </div>
    </section>
  );
}
