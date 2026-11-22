import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { cutoutFor } from "@/content/cutouts";
import { solutionTiles } from "@/content/solutionTiles";
import { T3Hero } from "@/components/solution/kit/T3Hero";
import { MethodTiles } from "@/components/solution/kit/MethodTiles";
import { FaqSection } from "@/components/solution/kit/FaqSection";
import { ProcessSplit } from "@/components/solution/kit/ProcessSplit";
import { MarqueeRow } from "@/components/solution/kit/MarqueeRow";
import "@/components/solution/kit/t3.css";

const PATH = "/solutions/door-locks";

export async function generateMetadata(): Promise<Metadata> {
  const { solutionDoorLocks: t } = await getDictionary();
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternates(await getLocale(), PATH) };
}

/**
 * T3 solution, door locks (Master Plan 12, 14; Design Doc 10) on the design skill's kit: the dealt
 * product hero, lock types, questions, and fitting with the dealt marquee of lock and hardware
 * words as its last row (moments.md: a marquee merges into the section above).
 */
export default async function DoorLocksSolution() {
  const t = await getDictionary();
  const c = t.solutionDoorLocks;
  const locale = await getLocale();
  const family = productsInFamily("door-locks");
  // Fixed catalogue entries; the family's first model stands in if the import ever drops one.
  const hero = productBySlug("zkteco-tl700-fingerprint-smart-door-lock") ?? family[0];
  const fitting = productBySlug("lh6000") ?? family[0];
  const picture = cutoutFor(fitting);
  const tiles = solutionTiles(locale, [
    { label: c.types.items.smart, slug: "tl100", family: "door-locks", type: "smart", all: c.types.smart },
    { label: c.types.items.hotel, slug: "lh4000", family: "door-locks", type: "hotel", all: c.types.hotel },
    { label: c.types.items.hardware, slug: "al-m280", family: "door-hardware", all: c.types.hardware },
  ]);
  return (
    <main id="main" data-kit="">
      <T3Hero
        path={PATH}
        crumb={t.solutions["door-locks"].name}
        title={c.title}
        lead={fmt(c.lead, { count: family.length })}
        product={hero}
        alt={c.heroAlt}
        secondary={{ href: "#types", label: c.secondary }}
      />
      <MethodTiles id="types" heading={c.types.heading} lead={c.types.lead} tiles={tiles} />
      <FaqSection heading={c.faq.heading} items={c.faq.items} />
      {picture && (
        <ProcessSplit
          heading={c.process.heading}
          ownerLabel={c.process.owner}
          steps={c.process.steps}
          photo={picture}
          fit="contain"
          alt={c.process.alt}
          after={<MarqueeRow label={c.marqueeLabel} words={c.marquee} />}
        />
      )}
    </main>
  );
}
