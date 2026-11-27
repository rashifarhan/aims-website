import "server-only";
import { localePath, type Locale } from "@/i18n/config";
import type { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { productCount } from "@/content/catalogue";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export type JourneyStep = {
  title: string;
  body: string;
  who: string;
  points: string[];
  link?: { href: string; label: string };
};

/**
 * The five steps from the first call to a working system, all AIMS's own published copy (services process owners,
 * quotation and supply lines, install and support points); the model count is the catalogue's. No durations and no
 * training: AIMS publishes none (CLAUDE.md, Truth).
 */
export function journeySteps(t: Dictionary, locale: Locale): JourneyStep[] {
  const j = t.home.journey;
  const owners = t.services.process.steps;
  return [
    {
      title: j.tell.title,
      body: j.tell.body,
      who: owners[0].owner,
      points: [owners[0].body, j.tell.channels],
      link: { href: localePath(locale, "/quote"), label: t.home.hero.quote },
    },
    { title: j.quote.title, body: owners[1].body, who: owners[1].owner, points: [j.quote.attendance, j.quote.doors] },
    {
      title: j.supply.title,
      body: j.supply.body,
      who: owners[1].owner,
      points: [fmt(t.home.families.heading, { count: productCount() }), j.supply.export],
    },
    {
      title: j.install.title,
      body: j.install.body,
      who: owners[2].owner,
      points: [j.install.devices, j.install.setup],
    },
    {
      title: j.support.title,
      body: j.support.body,
      who: owners[3].owner,
      points: [j.support.warranty, j.support.changes],
      link: { href: localePath(locale, "/support"), label: t.services.cover.warrantyAction },
    },
  ];
}
