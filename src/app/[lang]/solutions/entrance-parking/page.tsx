import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { STAND_INS } from "@/content/standIns";
import { solutionTiles } from "@/content/solutionTiles";
import { T3Hero } from "@/components/solution/kit/T3Hero";
import { StatementSection } from "@/components/solution/kit/StatementSection";
import { MethodTiles } from "@/components/solution/kit/MethodTiles";
import { FaqSection } from "@/components/solution/kit/FaqSection";
import { ProcessSplit } from "@/components/solution/kit/ProcessSplit";
import "@/components/solution/kit/t3.css";

const PATH = "/solutions/entrance-parking";

export async function generateMetadata(): Promise<Metadata> {
  const { solutionEntranceParking: t } = await getDictionary();
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternates(await getLocale(), PATH) };
}

/**
 * T3 solution, entrance and parking (Master Plan 12, 14; Design Doc 10) on the design skill's kit:
 * the dealt product hero, the dealt word-highlight statement, entrance types, questions, and
 * installation (a stand-in lobby photograph, credited in the footer). The footer is the close.
 */
export default async function EntranceParkingSolution() {
  const t = await getDictionary();
  const c = t.solutionEntranceParking;
  const locale = await getLocale();
  const family = productsInFamily("entrance-control");
  // A fixed catalogue entry; the family's first model stands in if the import ever drops it.
  const hero = productBySlug("zkteco-mars-b1022-single-lane-swing-barrier-turnstile") ?? family[0];
  const tiles = solutionTiles(locale, [
    {
      label: c.types.items.tripod,
      slug: "ts1000-pro-series",
      family: "entrance-control",
      type: "pedestrian",
      all: c.types.pedestrian,
    },
    {
      label: c.types.items.swing,
      slug: "zk-mars-b1222-dual-lane-swing-barrier-tunstile",
      family: "entrance-control",
      type: "pedestrian",
      all: c.types.pedestrian,
    },
    {
      label: c.types.items.parking,
      slug: "pro-bg3000",
      family: "entrance-control",
      type: "parking",
      all: c.types.parking,
    },
  ]);
  return (
    <main id="main" data-kit="">
      <T3Hero
        path={PATH}
        crumb={t.solutions["entrance-parking"].name}
        title={c.title}
        lead={fmt(c.lead, { count: family.length })}
        product={hero}
        alt={c.heroAlt}
        secondary={{ href: "#types", label: c.secondary }}
      />
      <StatementSection id="lanes" heading={c.statement.heading} text={c.statement.text} strong={c.statement.strong} />
      <MethodTiles id="types" heading={c.types.heading} lead={c.types.lead} tiles={tiles} />
      <FaqSection heading={c.faq.heading} items={c.faq.items} />
      <ProcessSplit
        heading={c.process.heading}
        ownerLabel={c.process.owner}
        steps={c.process.steps}
        photo={STAND_INS.lobbySpeedGates}
        alt={c.process.alt}
      />
    </main>
  );
}
