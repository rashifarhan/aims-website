import { MailIcon, PhoneIcon } from "@/components/icons";
import { OfficeCard } from "@/components/ui/OfficeCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/i18n/dictionaries";
import { CONTACT, LOCATIONS } from "@/lib/site";
import { ContactLink } from "./ContactLink";

/**
 * The three branches (Master Plan T9: "3 location cards") on the shared office card. Map links open
 * Google Maps in a new tab; no embedded map, so the page makes no third-party request.
 */
export function LocationCards({ t }: { t: Dictionary["contactPage"] }) {
  return (
    <section aria-labelledby="locations-title" className="contact-locations">
      <SectionHeader id="locations-title" title={t.locationsTitle} />
      <ul className="ui-office-list">
        {LOCATIONS.map((loc) => {
          const line = CONTACT.lines[loc.line];
          return (
            <OfficeCard
              key={loc.id}
              name={t.locations[loc.id]}
              address={loc.address}
              addressLang="en"
              call={
                <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="home-text-link">
                  <PhoneIcon width="16" height="16" />
                  <bdi dir="ltr" className="tabular-nums">
                    {line.display}
                  </bdi>
                </ContactLink>
              }
              visit={
                <a href={loc.map} target="_blank" rel="noopener noreferrer" className="home-text-link">
                  {t.directions}
                  <span className="sr-only"> ({t.locations[loc.id]}, Google Maps)</span>
                </a>
              }
            />
          );
        })}
      </ul>
      <p className="mt-5 flex items-center gap-2 text-sm text-ink-700">
        <MailIcon width={16} height={16} className="text-ink-400" />
        <span>{t.emailLabel}</span>
        <ContactLink
          kind="email"
          href={`mailto:${CONTACT.email}`}
          target={CONTACT.email}
          className="font-semibold text-ink hover:text-green-700"
        >
          {CONTACT.email}
        </ContactLink>
      </p>
    </section>
  );
}
