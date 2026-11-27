import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { productCount } from "@/content/catalogue";
import { FamilyTile } from "@/components/families/FamilyTile";
import { FloodHead } from "@/components/families/FloodHead";
import { FloodSection } from "@/components/families/FloodSection";
import { familySlides } from "@/components/families/familySlides";

/** The six families as tiles on chalk, each on its own ground and linking to its family page (Products menu). */
export async function HomeFamilies() {
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    <FloodSection id="families" tone="chalk" labelledBy="families-title">
      <FloodHead
        id="families-title"
        kicker={t.nav.products}
        title={t.home.families.heading.replace("{count}", String(productCount()))}
        link={{ href: localePath(locale, "/products"), label: t.home.families.all }}
      />
      <ul className="hfam-grid">
        {familySlides(t, locale).map((f) => (
          <li key={f.slug}>
            <FamilyTile family={f} models={t.home.stage.models} />
          </li>
        ))}
      </ul>
    </FloodSection>
  );
}
