import { ContactLink } from "@/components/contact/ContactLink";
import { ExternalLink } from "@/components/home/ExternalLink";
import { PhoneIcon, PinIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";
import { CONTACT, LOCATIONS } from "@/lib/site";

/**
 * The three UAE places AIMS publishes (site.ts LOCATIONS), the Deira showroom first: it is the one place AIMS
 * invites visitors to (DESIGN.md "The Trusted Showroom"). Maps open Google Maps; nothing is embedded (CLAUDE.md §5).
 * No opening hours: AIMS hasn't published them.
 */
export async function LocationOffices({ id }: { id: string }) {
  const { locations } = await getDictionary();
  const c = locations.common;
  const order = ["showroom", "headOffice", "abuDhabi"] as const;
  const places = order.flatMap((key) => LOCATIONS.filter((l) => l.id === key));
  return (
    <section id={id} className="t3-section page-container" aria-labelledby={`${id}-title`}>
      <div className="t3-heading">
        <h2 id={`${id}-title`} className="t3-title">
          {c.officesHeading}
        </h2>
        <p className="t3-lead">{c.officesLead}</p>
      </div>
      <ul className="loc-offices">
        {places.map((place) => {
          const line = CONTACT.lines[place.line];
          const name = c.names[place.id];
          const showroom = place.id === "showroom";
          return (
            <li key={place.id} className={showroom ? "ui-card loc-office loc-office-featured" : "ui-card loc-office"}>
              <p className="loc-office-tag">
                <PinIcon width="16" height="16" aria-hidden="true" />
                {showroom ? c.showroomTag : c.officeTag}
              </p>
              <h3>{name}</h3>
              <p className="loc-office-address" lang="en" dir="ltr">
                {place.address}
              </p>
              <div className="loc-office-actions">
                <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="home-text-link">
                  <PhoneIcon width="16" height="16" aria-hidden="true" />
                  <span className="sr-only">
                    {c.call} {name}{" "}
                  </span>
                  <bdi dir="ltr" className="tabular-nums">
                    {line.display}
                  </bdi>
                </ContactLink>
                <ExternalLink
                  href={place.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  label={`${name}, ${c.mapsNewTab}`}
                  className="home-text-link"
                >
                  {c.directions}
                </ExternalLink>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
