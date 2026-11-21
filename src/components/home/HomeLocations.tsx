import { getDictionary } from "@/i18n/dictionaries";
import { CONTACT, LIVE_AIMS } from "@/lib/site";
import { PinIcon } from "@/components/icons";

export async function HomeLocations() {
  const t = await getDictionary();
  const l = t.home.locations;
  const locations = [
    { name: l.headOffice, address: l.dubaiArea, line: CONTACT.lines.headOffice },
    { name: l.showroom, address: CONTACT.showroomAddress, line: CONTACT.lines.showroom },
    { name: l.abuDhabi, address: l.abuDhabiArea, line: CONTACT.lines.abuDhabi },
  ];
  return (
    <section id="showrooms" className="home-section" aria-labelledby="locations-title">
      <div className="home-section-heading">
        <div>
          <h2 id="locations-title" className="home-section-title">
            {l.heading}
          </h2>
          <p className="home-section-lead">{l.lead}</p>
        </div>
      </div>
      <div className="home-three-grid">
        {locations.map((location, i) => (
          <article key={location.name} className="home-location-card">
            <PinIcon className="text-green-700" />
            <h3>{location.name}</h3>
            <p lang={i === 1 ? "en" : undefined}>{location.address}</p>
            <a
              href={`tel:${location.line.tel}`}
              className="home-text-link"
              aria-label={`${l.call} ${location.name} ${location.line.display}`}
            >
              <bdi>{location.line.display}</bdi>
            </a>
            {i === 1 ? (
              <a href={CONTACT.showroomMap} target="_blank" rel="noreferrer" className="home-text-link">
                {l.map}
                <span className="home-external-label">{l.newTab}</span>
              </a>
            ) : (
              <a href={LIVE_AIMS.contact} className="home-text-link">
                {l.plan}
                <span className="home-external-label">{t.home.external}</span>
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
