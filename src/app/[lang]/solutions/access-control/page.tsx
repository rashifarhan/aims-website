import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { productBySlug, products, productsInFamily } from "@/content/catalogue";
import { STAND_INS } from "@/content/standIns";
import type { Product } from "@/content/schema";
import { T3Hero } from "@/components/solution/kit/T3Hero";
import { MethodTiles } from "@/components/solution/kit/MethodTiles";
import { ProcessSplit } from "@/components/solution/kit/ProcessSplit";
import { FaqSection } from "@/components/solution/kit/FaqSection";
import { DoorKitStory } from "@/components/solution/access/DoorKitStory";
import { KitSection } from "@/components/solution/access/KitSection";
import { SoftwareSplit } from "@/components/solution/kit/SoftwareSplit";
import "@/components/home/sections.css";
import "@/components/home/premium.css";
import "@/components/solution/kit/t3.css";

const PATH = "/solutions/access-control";
const HERO = "inbio-pro-460-package-b";
/** One terminal for each method; none of them repeats the hero or the kit (skill: one view once). */
const METHODS = [
  { method: "card", slug: "sc405" },
  { method: "fingerprint", slug: "f18" },
  { method: "face", slug: "proface-x" },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { solutionAccessControl: t } = await getDictionary();
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternates(await getLocale(), PATH) };
}

/**
 * T3 solution, access control (Master Plan 12, 14; Design Doc 8.2, 10), on the design skill's kit:
 * the dealt product hero, the door-kit story (the approved prototype, the page's dealt moment),
 * the kit builder, terminals by method, installation, software and questions; the shared footer
 * is the close.
 */
export default async function AccessControlSolution() {
  const t = await getDictionary();
  const c = t.solutionAccessControl;
  const locale = await getLocale();
  const family = productsInFamily("access-control");
  // The hero product is a fixed catalogue entry; a missing one is a content error caught by the
  // route's smoke test, so fall back to the family's first model rather than render nothing.
  const hero = productBySlug(HERO) ?? family[0];
  const tiles = METHODS.flatMap(({ method, slug }) => {
    const product = productBySlug(slug);
    if (!product) return [];
    const count = products().filter((p: Product) => p.family === "access-control" && p.methods.includes(method)).length;
    return [
      {
        label: c.methods.items[method],
        product,
        all: {
          href: localePath(locale, `/products/access-control?verify=${method}`),
          label: fmt(c.methods.all, { count, method: c.methods.items[method].toLowerCase() }),
        },
      },
    ];
  });

  return (
    <main id="main" data-kit="">
      <T3Hero
        path={PATH}
        crumb={t.solutions["access-control"].name}
        title={c.title}
        lead={fmt(c.lead, { count: family.length })}
        product={hero}
        alt={c.heroAlt}
        secondary={{ href: "#kit", label: c.secondary }}
      />
      <DoorKitStory />
      <KitSection />
      <MethodTiles id="methods" heading={c.methods.heading} lead={c.methods.lead} tiles={tiles} />
      <ProcessSplit
        heading={c.process.heading}
        ownerLabel={c.process.owner}
        steps={c.process.steps}
        photo={STAND_INS.magneticLock}
        alt={c.process.alt}
      />
      {/* Questions before software: the page closes on a picture, not a text-only section (skill
          finish check text-only); README → Decisions records the swap of Master Plan 14's order. */}
      <FaqSection heading={c.faq.heading} items={c.faq.items} />
      <SoftwareSplit
        heading={c.software.heading}
        lead={c.software.lead}
        open={c.software.open}
        items={(["zkaccess-3-5", "zkbio-cvaccess", "zkbio-cvsecurity"] as const).map((slug) => ({
          slug,
          ...c.software.items[slug],
        }))}
        panel={{ title: `ZKAccess 3.5 · ${c.software.events}`, label: c.software.logLabel, rows: c.software.log }}
      />
    </main>
  );
}
