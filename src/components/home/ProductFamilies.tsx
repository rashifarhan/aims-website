import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { FAMILIES } from "@/content/taxonomy";
import { productBySlug, productCount, productsInFamily } from "@/content/catalogue";
import { ArrowIcon } from "@/components/icons";
import { HomeSoftware } from "./HomeSoftware";
import { fmt } from "@/i18n/format";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

const examples = [
  "f18",
  "zkteco-speedface-v5l-qr",
  "barrier-gates-bgm-1045",
  "zkteco-tl800-wi-fi-smart-digital-lock",
  "al-m280",
  "zkaio1000",
];

/** The first families in taxonomy order take the large cards. */
const LEAD_FAMILIES = 2;

export async function ProductFamilies() {
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    // Night section: products stay on white cards (Design Doc 7), the band around them goes dark.
    <Section ground="night" id="families" labelledBy="families-title" className="home-families">
      <SectionHeader
        id="families-title"
        title={fmt(t.home.families.heading, { count: productCount() })}
        lead={t.home.families.lead}
        link={
          <Link href={localePath(locale, "/products")} className="home-night-link">
            {t.home.families.all}
          </Link>
        }
      />
      {/* Impeccable bolder: time attendance and access control, AIMS's two core lines (CLAUDE.md), lead at twice the
          size with their products shown large; the other four families follow in one row. */}
      <div className="home-family-grid">
        {FAMILIES.map((family, i) => {
          const product = productBySlug(examples[i]);
          const image = product?.images[0];
          const lead = i < LEAD_FAMILIES;
          return (
            <Link
              key={family.slug}
              href={localePath(locale, `/products/${family.slug}`)}
              // An array, not a template literal: Prettier's Tailwind plugin trims the space before a conditional class.
              className={["home-family-card ui-card ui-card-interactive", lead && "home-family-lead"]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="home-family-image ui-card-photo">
                {image && (
                  <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes={
                      lead
                        ? "(min-width: 1024px) 340px, (min-width: 640px) 240px, 200px"
                        : "(min-width: 1024px) 160px, (min-width: 640px) 200px, 130px"
                    }
                  />
                )}
              </div>
              <div className="home-family-info">
                <h3>{t.families[family.slug].name}</h3>
                <p className="home-family-summary">{t.families[family.slug].summary}</p>
                <p className="home-family-count">
                  <span>
                    <span className="tabular-nums">{productsInFamily(family.slug).length}</span> {t.home.families.count}
                  </span>
                  <ArrowIcon width="16" height="16" className="home-action-arrow" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <HomeSoftware />
    </Section>
  );
}
