import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { FAMILIES } from "@/content/taxonomy";
import { productBySlug, productCount, productsInFamily } from "@/content/catalogue";

const examples = [
  "f18",
  "zkteco-speedface-v5l-qr",
  "barrier-gates-bgm-1045",
  "zkteco-tl800-wi-fi-smart-digital-lock",
  "al-m280",
  "zkaio1000",
];

/**
 * T1 section 3. The catalogue size is the section's one type contrast: it answers "what do
 * you stock?" with a counted number. Each tile names its pictured model in mono (the signature).
 */
export async function ProductFamilies() {
  const t = await getDictionary();
  const locale = await getLocale();
  const [before, after] = t.home.families.heading.split("{count}");
  return (
    <section id="families" className="home-section page-container" aria-labelledby="families-title">
      <div className="home-section-heading">
        <h2 id="families-title" className="home-section-title home-families-title">
          {before}
          <span className="home-big-number tabular-nums">{productCount()}</span>
          {after}
        </h2>
        <Link href={localePath(locale, "/products")} className="home-text-link">
          {t.home.families.all}
        </Link>
      </div>
      <div className="home-family-grid">
        {FAMILIES.map((family, i) => {
          const product = productBySlug(examples[i]);
          const image = product?.images[0];
          return (
            <Link key={family.slug} href={localePath(locale, `/products/${family.slug}`)} className="home-family-card">
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
                {product && (
                  <span className="home-family-model">
                    <span className="sr-only">{t.home.families.pictured}: </span>
                    <bdi>{product.model}</bdi>
                  </span>
                )}
              </div>
              <div className="home-family-info">
                <h3>{t.families[family.slug].name}</h3>
                <p className="home-family-summary">{t.families[family.slug].summary}</p>
                <p className="home-family-count">
                  <span className="tabular-nums">{productsInFamily(family.slug).length}</span> {t.home.families.count}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
