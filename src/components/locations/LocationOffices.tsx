import { ContactLink } from "@/components/contact/ContactLink";
import { ExternalLink } from "@/components/home/ExternalLink";
import { PhoneIcon } from "@/components/icons";
import { OfficeCard } from "@/components/ui/OfficeCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getDictionary } from "@/i18n/dictionaries";
import { CONTACT, LOCATIONS } from "@/lib/site";
import { Section } from "@/components/ui/Section";

/**
 * The three UAE places AIMS publishes (site.ts LOCATIONS), the Deira showroom first: it is the one place AIMS
 * invites visitors to (DESIGN.md "The Trusted Showroom"). Maps open Google Maps; nothing is embedded (CLAUDE.md §5).
 */
export async function LocationOffices({ id }: { id: string }) {
  const { locations } = await getDictionary();
  const c = locations.common;
  const order = ["showroom", "headOffice", "abuDhabi"] as const;
  const places = order.flatMap((key) => LOCATIONS.filter((l) => l.id === key));
  return (
    <Section ground="band" id={id} labelledBy={`${id}-title`}>
      <SectionHeader id={`${id}-title`} title={c.officesHeading} lead={c.officesLead} />
      <ul className="ui-office-list">
        {places.map((place) => {
          const line = CONTACT.lines[place.line];
          const name = c.names[place.id];
          const showroom = place.id === "showroom";
          return (
            <OfficeCard
              key={place.id}
              featured={showroom}
              tag={showroom ? c.showroomTag : c.officeTag}
              name={name}
              address={place.address}
              addressLang="en"
              call={
                <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="home-text-link">
                  <PhoneIcon width="16" height="16" />
                  <span className="sr-only">
                    {c.call} {name}{" "}
                  </span>
                  <bdi dir="ltr" className="tabular-nums">
                    {line.display}
                  </bdi>
                </ContactLink>
              }
              visit={
                <ExternalLink
                  href={place.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  label={`${name}, ${c.mapsNewTab}`}
                  className="home-text-link"
                >
                  {c.directions}
                </ExternalLink>
              }
            />
          );
        })}
      </ul>
    </Section>
  );
}
