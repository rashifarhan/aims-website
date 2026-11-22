import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { cutoutFor } from "@/content/cutouts";
import { countOfType, solutionTiles } from "@/content/solutionTiles";
import { T3Hero } from "@/components/solution/kit/T3Hero";
import { FiguresSection } from "@/components/solution/kit/FiguresSection";
import { MethodTiles } from "@/components/solution/kit/MethodTiles";
import { FaqSection } from "@/components/solution/kit/FaqSection";
import { ProcessSplit } from "@/components/solution/kit/ProcessSplit";
import "@/components/solution/kit/t3.css";

const PATH = "/solutions/pos";

export async function generateMetadata(): Promise<Metadata> {
  const { solutionPos: t } = await getDictionary();
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternates(await getLocale(), PATH) };
}

/**
 * T3 solution, POS (Master Plan 12, 14; Design Doc 10) on the design skill's kit: the dealt
 * product hero, the dealt counter-rolls figures (catalogue counts only, CLAUDE.md §1), terminal
 * types, questions, and setup.
 */
export default async function PosSolution() {
  const t = await getDictionary();
  const c = t.solutionPos;
  const locale = await getLocale();
  const family = productsInFamily("pos");
  // Fixed catalogue entries; the family's first model stands in if the import ever drops one.
  const hero = productBySlug("zk1515-series") ?? family[0];
  const setup = cutoutFor(productBySlug("zkaio1000") ?? family[0]);
  const tiles = solutionTiles(locale, [
    { label: c.types.items.windows, slug: "zk15-series", family: "pos", type: "windows", all: c.types.windows },
    { label: c.types.items.android, slug: "zk-h300", family: "pos", type: "android", all: c.types.android },
    { label: c.types.items.biometric, slug: "zkbio900-series", family: "pos", all: c.types.all },
  ]);
  return (
    <main id="main" data-kit="">
      <T3Hero
        path={PATH}
        crumb={t.solutions.pos.name}
        title={c.title}
        lead={fmt(c.lead, { count: family.length })}
        product={hero}
        alt={c.heroAlt}
        secondary={{ href: "#types", label: c.secondary }}
      />
      <FiguresSection
        id="range"
        heading={c.figures.heading}
        figures={[
          { value: family.length, label: c.figures.total },
          { value: countOfType("pos", "windows"), label: c.figures.windows },
          { value: countOfType("pos", "android"), label: c.figures.android },
        ]}
      />
      <MethodTiles id="types" heading={c.types.heading} lead={c.types.lead} tiles={tiles} />
      <FaqSection heading={c.faq.heading} items={c.faq.items} />
      {setup && (
        <ProcessSplit
          heading={c.process.heading}
          ownerLabel={c.process.owner}
          steps={c.process.steps}
          photo={setup}
          fit="contain"
          alt={c.process.alt}
        />
      )}
    </main>
  );
}
