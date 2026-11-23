import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function LocationHero({ market }: { market: LocationMarket }) {
  const all = await getDictionary();
  const t = all.locationPage[market];
  const locale = await getLocale();
  return (
    <section className="locations-hero location-hero" data-enter>
      <div className="wrap page-container">
        <div className="hero-text">
          <Breadcrumbs
            label={all.common.breadcrumb}
            items={[
              { href: localePath(locale, "/"), label: all.common.home },
              { href: localePath(locale, "/locations"), label: all.footer.locationsHub },
              { href: localePath(locale, LOCATION_PAGES[market].path), label: t.title },
            ]}
          />
          <div className="locations-hero-grid">
            <div>
              <p className="location-fulfilment">{t.fulfilment}</p>
              <h1>{t.title}</h1>
              <p className="locations-lead">{t.lead}</p>
              <div className="locations-actions">
                <Link
                  prefetch={false}
                  href={localePath(locale, LOCATION_PAGES[market].quote)}
                  className="locations-primary"
                >
                  {t.primary}
                </Link>
                <Link href={market === "dubai" ? "#fulfilment" : "#models"} className="locations-link">
                  {t.secondary}
                </Link>
              </div>
              {ZKTECO_AUTHORIZATION_CONFIRMED && <p className="location-authorised">{all.locationPage.authorised}</p>}
            </div>
            <Image
              data-source="client"
              data-subject="ZKTeco SpeedFace-V5L QR terminal"
              src="/images/home/speedface-cut.png"
              width={362}
              height={776}
              sizes="(min-width: 1024px) 480px, 240px"
              preload
              alt={all.home.hero.alt}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
