import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { productBySlug } from "@/content/catalogue";
import { cutoutFor } from "@/content/cutouts";
import { CONTROLLERS, KIT_PARTS } from "@/lib/doorKit";
import { KitBuilder, type KitProduct } from "./KitBuilder";

/** T3 row 5, the kit builder after the door-kit story (Design Doc 10, FIG 10.7). */
export async function KitSection() {
  const t = await getDictionary();
  const c = t.solutionAccessControl.kit;
  const locale = await getLocale();
  const slugs = [...Object.values(KIT_PARTS), ...CONTROLLERS.map((x) => x.slug)];
  const products: Record<string, KitProduct> = Object.fromEntries(
    slugs.flatMap((slug) => {
      const p = productBySlug(slug);
      return p ? [[slug, { slug, model: p.model, alt: p.name, image: cutoutFor(p) }]] : [];
    }),
  );
  return (
    <section className="section g2m" id="kit" aria-labelledby="kit-h">
      <KitBuilder
        intro={
          <>
            <h2 id="kit-h">{c.heading}</h2>
            <p className="t-lead">{c.lead}</p>
          </>
        }
        labels={{ ...c, parts: { ...c.parts } }}
        products={products}
        quoteHref={localePath(locale, "/quote")}
      />
    </section>
  );
}
