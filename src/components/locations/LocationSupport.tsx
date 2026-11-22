import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";

export async function LocationSupport({ market }: { market: LocationMarket }) {
  const all = await getDictionary();
  const locale = await getLocale();
  const t = all.locationPage;
  return (
    <section className="locations-section location-support">
      <div className="wrap page-container">
        <h2>{t.supportTitle}</h2>
        <div className="location-support-grid">
          <div>
            <p className="locations-lead">{t.supportLead}</p>
            <Link href={localePath(locale, "/contact")} className="locations-link">
              {t.contact}
            </Link>
          </div>
          <div>
            <h3>{t.faqTitle}</h3>
            <dl className="location-faq">
              {t[market].faq.map((item) => (
                <div key={item.q}>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="location-final">
          <p>{t.finalTitle}</p>
          <div className="locations-actions">
            <Link href={localePath(locale, LOCATION_PAGES[market].quote)} className="locations-primary">
              {t[market].primary}
            </Link>
            <Link href={localePath(locale, "/locations")} className="locations-link">
              {t.hub}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
