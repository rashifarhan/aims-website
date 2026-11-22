import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ReachMap } from "@/components/home/ReachMap";
import { LOCATION_PAGES } from "@/lib/locationPages";

export async function LocationMarkets() {
  const all = await getDictionary();
  const t = all.locationsHub;
  const locale = await getLocale();
  return (
    <section id="delivery" data-moment className="locations-section locations-markets">
      <div className="wrap page-container">
        <h2>{t.marketsTitle}</h2>
        <p className="locations-lead">{t.marketsLead}</p>
        <div className="locations-market-grid">
          <div>
            {(
              [
                { title: t.gcc, countries: ["Oman", "Bahrain", "Kuwait"] },
                { title: t.africa, countries: ["Kenya", "Tanzania", "Cameroon", "Nigeria", "Uganda"] },
              ] as const
            ).map((group) => (
              <div key={group.title} className="locations-market-group">
                <h3>{group.title}</h3>
                <ul>
                  {group.countries.map((country) => (
                    <li key={country}>
                      <Link
                        className="locations-link"
                        href={localePath(
                          locale,
                          country === "Oman"
                            ? LOCATION_PAGES.oman.path
                            : country === "Kenya"
                              ? LOCATION_PAGES.kenya.path
                              : `/quote?need=export&country=${country}`,
                        )}
                      >
                        <span className="sr-only">{t.destinationAction} </span>
                        {t.countries[country]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <h3>{t.notes}</h3>
            <p>{t.notesBody}</p>
            <Link className="locations-primary" href={localePath(locale, "/quote?need=export")}>
              {all.home.hero.quote}
            </Link>
          </div>
          <ReachMap labels={all.home.reach} />
        </div>
      </div>
    </section>
  );
}
