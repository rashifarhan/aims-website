import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { solutionPath } from "@/lib/nav";
import { ArrowIcon } from "@/components/icons";

/**
 * "From the front gate to the last door" (direction 2, night): the four places AIMS equips, each a screen that opens as
 * it scrolls in (ScrollReveals, `data-open`) and links to the solution that fits it. Licensed stand-in photographs,
 * credited in the footer and never presented as AIMS premises or customers (README → Decisions).
 */
const places = [
  { key: "office", src: "office-lobby-speed-gates", solution: "entrance-parking" },
  { key: "hotel", src: "hotel-corridor", solution: "door-locks" },
  { key: "entrance", src: "office-building-glass-entrance", solution: "access-control" },
  { key: "lobby", src: "reception-lobby-optical-turnstiles", solution: "entrance-parking" },
] as const;

export async function InsidePlaces() {
  const t = await getDictionary();
  const locale = await getLocale();
  const g = t.home.gate;
  return (
    <section id="places" className="in-night in-section hp" aria-labelledby="places-title">
      <div className="hp-grid">
        <div className="hp-head" data-reveal>
          <p className="in-eyebrow">{t.nav.solutions}</p>
          <h2 id="places-title" className="in-h2">
            {g.heading}
          </h2>
          <p className="in-lead">{g.lead}</p>
          <Link href={localePath(locale, "/solutions")} className="in-link hp-all">
            {g.all}
          </Link>
        </div>
        <ul className="hp-tiles">
          {places.map((place) => {
            const copy = g[place.key];
            return (
              <li key={place.key} className={`hp-tile-${place.key}`}>
                <Link href={localePath(locale, solutionPath(place.solution))} className="hp-tile in-screen" data-open>
                  <span className="hp-photo">
                    <Image
                      src={`/images/stand-ins/${place.src}.webp`}
                      alt={copy.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      data-source="stand-in"
                    />
                  </span>
                  <span className="hp-solution in-mono">{t.solutions[place.solution].name}</span>
                  <span className="hp-text">
                    <span>
                      <h3>{copy.title}</h3>
                      <span className="hp-line">{copy.text}</span>
                    </span>
                    <span className="hp-go" aria-hidden="true">
                      <ArrowIcon width="18" height="18" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
