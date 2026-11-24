import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { FAMILIES } from "@/content/taxonomy";
import { productBySlug, productCount, productsInFamily } from "@/content/catalogue";
import { ArrowIcon } from "@/components/icons";
import { fmt } from "@/i18n/format";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";
import { SpotlightGroup } from "@/components/ui/SpotlightGroup";

const examples = [
  "f18",
  "zkteco-speedface-v5l-qr",
  "barrier-gates-bgm-1045",
  "zkteco-tl800-wi-fi-smart-digital-lock",
  "al-m280",
  "zkaio1000",
];

export async function ProductFamilies() {
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    // Premium pass (client decision 6, 24 Nov 2026): six large tiles on white, each the one card with a spotlight
    // that follows a fine pointer (SpotlightGroup).
    <Section id="families" labelledBy="families-title" className="home-families">
      <SectionHeader
        id="families-title"
        title={fmt(t.home.families.heading, { count: productCount() })}
        lead={t.home.families.lead}
        link={
          <Link href={localePath(locale, "/products")} className="home-secondary">
            {t.home.families.all}
            <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
          </Link>
        }
      />
      <SpotlightGroup className="home-family-grid">
        {FAMILIES.map((family, i) => {
          const product = productBySlug(examples[i]);
          const image = product?.images[0];
          return (
            <Link
              key={family.slug}
              href={localePath(locale, `/products/${family.slug}`)}
              className="home-family-card ui-card ui-card-interactive spotlight-card"
            >
              <div className="home-family-image ui-card-photo">
                {image && (
                  <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                  />
                )}
              </div>
              <div className="home-family-info">
                <div>
                  <h3>{t.families[family.slug].name}</h3>
                  <p className="home-family-summary">{t.families[family.slug].summary}</p>
                  <p className="home-family-count">
                    <span className="tabular-nums">{productsInFamily(family.slug).length}</span> {t.home.families.count}
                  </p>
                </div>
                <span className="home-family-go" aria-hidden="true">
                  <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
                </span>
              </div>
            </Link>
          );
        })}
      </SpotlightGroup>
    </Section>
  );
}
