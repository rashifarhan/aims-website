import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LocationOffices } from "@/components/locations/LocationOffices";
import { LocationMarkets } from "@/components/locations/LocationMarkets";
import { LocationsMotion } from "@/components/locations/LocationsMotion";
import "@/components/locations/locations.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).locationsHub;
  return {
    title: t.metaTitle,
    description: t.description,
    alternates: alternates(await getLocale(), "/locations"),
    other: { "page-type": "product", "site-kind": "tech" },
  };
}
export default async function LocationsPage() {
  const all = await getDictionary();
  const t = all.locationsHub;
  const locale = await getLocale();
  return (
    <main id="main" className="locations-hub">
      <section className="locations-hero" data-enter>
        <div className="wrap page-container">
          <div className="hero-text">
            <Breadcrumbs
              label={all.common.breadcrumb}
              items={[
                { href: localePath(locale, "/"), label: all.common.home },
                { href: localePath(locale, "/locations"), label: all.footer.locationsHub },
              ]}
            />
            <div className="locations-hero-grid">
              <div>
                <h1>{t.title}</h1>
                <p className="locations-lead">{t.lead}</p>
                <div className="locations-actions">
                  <Link className="locations-primary" href="#uae">
                    {t.visit}
                  </Link>
                  <Link className="locations-link" href="#delivery">
                    {t.export}
                  </Link>
                </div>
              </div>
              <Image
                src="/images/home/speedface-cut.png"
                width={362}
                height={776}
                alt={all.home.hero.alt}
                sizes="(min-width: 1024px) 480px, 260px"
                preload
              />
            </div>
          </div>
        </div>
      </section>
      <LocationOffices />
      <LocationMarkets />
      <LocationsMotion />
    </main>
  );
}
