import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { cutoutFor } from "@/content/cutouts";
import { solutionTiles } from "@/content/solutionTiles";
import { T3Hero } from "@/components/solution/kit/T3Hero";
import { PunchToPayroll } from "@/components/solution/kit/PunchToPayroll";
import { MethodTiles } from "@/components/solution/kit/MethodTiles";
import { FaqSection } from "@/components/solution/kit/FaqSection";
import { SoftwareSplit } from "@/components/solution/kit/SoftwareSplit";
import { ProcessSplit } from "@/components/solution/kit/ProcessSplit";
import "@/components/solution/kit/t3.css";

const PATH = "/solutions/time-attendance";
const SOFTWARE = ["biotime-9-5", "biotimecloud", "zkbiotime-mobile-app"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { solutionTimeAttendance: t } = await getDictionary();
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternates(await getLocale(), PATH) };
}

/**
 * T3 solution, time attendance (Master Plan 12 #15, 14; Design Doc 8.3, 10) on the design skill's
 * kit: the dealt product hero, punch-to-payroll on night green (the dealt line-carries-colour
 * moment), terminals by method, questions, BioTime software, and setup. The footer is the close.
 */
export default async function TimeAttendanceSolution() {
  const t = await getDictionary();
  const c = t.solutionTimeAttendance;
  const locale = await getLocale();
  const family = productsInFamily("time-attendance");
  // Fixed catalogue entries; the family's first model stands in if the import ever drops one.
  const hero = productBySlug("sface-lite") ?? family[0];
  const setup = cutoutFor(productBySlug("zkteco-horus-h1") ?? family[0]);
  const tiles = solutionTiles(locale, [
    { label: c.methods.items.face, slug: "iface-990", family: "time-attendance", verify: "face", all: c.methods.all },
    {
      label: c.methods.items.fingerprint,
      slug: "ua760",
      family: "time-attendance",
      verify: "fingerprint",
      all: c.methods.all,
    },
    { label: c.methods.items.card, slug: "zk-x990-c", family: "time-attendance", verify: "card", all: c.methods.all },
  ]);
  return (
    <main id="main" data-kit="">
      <T3Hero
        path={PATH}
        crumb={t.solutions["time-attendance"].name}
        title={c.title}
        lead={fmt(c.lead, { count: family.length })}
        product={hero}
        alt={c.heroAlt}
        secondary={{ href: "#methods", label: c.secondary }}
      />
      <PunchToPayroll />
      <MethodTiles id="methods" heading={c.methods.heading} lead={c.methods.lead} tiles={tiles} />
      <FaqSection heading={c.faq.heading} items={c.faq.items} />
      <SoftwareSplit
        heading={c.software.heading}
        lead={c.software.lead}
        open={c.software.open}
        items={SOFTWARE.map((slug) => ({ slug, ...c.software.items[slug] }))}
        panel={{ title: c.software.panelTitle, label: c.software.panelLabel, rows: c.software.rows }}
      />
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
