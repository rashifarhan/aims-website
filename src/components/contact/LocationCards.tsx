import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { CONTACT, LOCATIONS } from "@/lib/site";
import { ContactLink } from "./ContactLink";

/**
 * The three branches (Master Plan T9: "3 location cards"). Map links open
 * Google Maps in a new tab; no embedded map, so the page makes no
 * third-party request.
 */
export function LocationCards({ t }: { t: Dictionary["contactPage"] }) {
  return (
    <section aria-labelledby="locations-title" className="mt-14">
      <h2 id="locations-title" className="text-2xl font-bold tracking-tight text-ink">
        {t.locationsTitle}
      </h2>
      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {LOCATIONS.map((loc) => {
          const line = CONTACT.lines[loc.line];
          return (
            <li key={loc.id} className="flex flex-col rounded-lg border border-line bg-paper p-5">
              <h3 className="font-semibold text-ink">{t.locations[loc.id]}</h3>
              <p className="mt-2 flex gap-2 text-sm text-ink-600">
                <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-ink-400" />
                <span lang="en">{loc.address}</span>
              </p>
              <ContactLink
                kind="phone"
                href={`tel:${line.tel}`}
                target={line.display}
                className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-ink hover:text-green-700"
              >
                <PhoneIcon width={16} height={16} className="text-ink-400" />
                <span dir="ltr" className="tabular-nums">
                  {line.display}
                </span>
              </ContactLink>
              <a
                href={loc.map}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex min-h-11 items-center pt-2 text-sm font-semibold text-green-700 underline underline-offset-2"
              >
                {t.directions}
                <span className="sr-only"> ({t.locations[loc.id]}, Google Maps)</span>
              </a>
            </li>
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
          className="inline-flex min-h-11 items-center font-semibold text-ink hover:text-green-700"
        >
          {CONTACT.email}
        </ContactLink>
      </p>
    </section>
  );
}
