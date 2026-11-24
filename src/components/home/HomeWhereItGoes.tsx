import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { familyPath } from "@/lib/nav";
import { ArrowIcon } from "@/components/icons";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import "./home-where.css";

/**
 * "From the front gate to the last door" (premium pass mockup). Four licensed stand-in photographs of the kinds of
 * places AIMS equips, each linked to the family that fits the place. Credited in the footer's one line (CLAUDE.md §2)
 * and listed in README → Decisions; never presented as AIMS premises. The spotlight leaf wraps the grid through the
 * shared `spotlight-card` class.
 */
const places = [
  { key: "office", src: "office-lobby-speed-gates", family: "entrance-control" },
  { key: "hotel", src: "hotel-corridor", family: "door-locks" },
  { key: "entrance", src: "office-building-glass-entrance", family: "access-control" },
  { key: "lobby", src: "reception-lobby-optical-turnstiles", family: "entrance-control" },
] as const;

export async function HomeWhereItGoes() {
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    <Section id="places" labelledBy="places-title" className="home-where">
      <SectionHeader id="places-title" title={t.home.gate.heading} lead={t.home.gate.lead} />
      <div className="home-where-grid">
        {places.map((place) => {
          const copy = t.home.gate[place.key];
          return (
            <Link
              key={place.key}
              href={localePath(locale, familyPath(place.family))}
              className={`home-place home-place-${place.key} spotlight-card`}
            >
              <Image
                src={`/images/stand-ins/${place.src}.webp`}
                alt={copy.alt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                data-source="stand-in"
              />
              <span className="home-place-veil" aria-hidden="true" />
              <span className="home-place-scan" aria-hidden="true" />
              <span className="home-place-text">
                <span>
                  <h3>{copy.title}</h3>
                  <p>{copy.text}</p>
                </span>
                <span className="home-place-go" aria-hidden="true">
                  <ArrowIcon width="18" height="18" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
