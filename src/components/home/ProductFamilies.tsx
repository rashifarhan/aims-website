import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { FAMILIES } from "@/content/taxonomy";
import { productBySlug, productCount, productsInFamily } from "@/content/catalogue";
import { ArrowIcon } from "@/components/icons";
import { HomeSoftware } from "./HomeSoftware";
import { fmt } from "@/i18n/format";

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
    // Night section: products stay on white cards (Design Doc 7), the band around them goes dark.
    <section id="families" className="home-night home-families" aria-labelledby="families-title">
      <div className="home-section page-container">
        <div className="home-section-heading">
          <div>
            <h2 id="families-title" className="home-section-title">
              {fmt(t.home.families.heading, { count: productCount() })}
            </h2>
            <p className="home-night-lead">{t.home.families.lead}</p>
          </div>
          <Link href={localePath(locale, "/products")} className="home-night-link">
            {t.home.families.all}
          </Link>
        </div>
        <div className="home-family-grid">
          {FAMILIES.map((family, i) => {
            const product = productBySlug(examples[i]);
            const image = product?.images[0];
            return (
              <Link
                key={family.slug}
                href={localePath(locale, `/products/${family.slug}`)}
                className="home-family-card"
              >
                <div className="home-family-image">
                  {image && (
                    <Image
                      src={image.src}
                      alt=""
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 1024px) 240px, (min-width: 640px) 200px, 130px"
                    />
                  )}
                </div>
                <div className="home-family-info">
                  <h3>{t.families[family.slug].name}</h3>
                  <p className="home-family-summary">{t.families[family.slug].summary}</p>
                  <p className="home-family-count">
                    <span>
                      <span className="tabular-nums">{productsInFamily(family.slug).length}</span>{" "}
                      {t.home.families.count}
                    </span>
                    <ArrowIcon width="16" height="16" className="home-action-arrow" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        <HomeSoftware />
      </div>
    </section>
  );
}
