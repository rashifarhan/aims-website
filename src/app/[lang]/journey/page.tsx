import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { CONTACT, LOCATIONS } from "@/lib/site";
import { TimelineSchema } from "@/lib/journey/scrollMap";
import raw from "@/lib/journey/timeline.json";
import { JourneyBeat } from "@/components/journey/JourneyBeat";
import { type JourneyChapter, JourneyPlayer, type JourneySlide } from "@/components/journey/JourneyPlayer";
import { beatCopy, CHAPTER_LABELS } from "@/components/journey/journeyCopy";
import "@/components/journey/journey.css";

const timeline = TimelineSchema.parse(raw);

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "One building, every door",
    description: "Walk through a building fitted by AIMS: parking barriers, security gates, door access and face recognition attendance.",
    alternates: alternates(await getLocale(), "/journey"),
  };
}

const LOCATION_NAMES: Record<string, string> = { headOffice: "Head office", showroom: "Showroom", abuDhabi: "Abu Dhabi office" };

/**
 * 3D homepage exploration (docs/superpowers/plans/2026-11-25-3d-homepage.md): the visitor's journey through one
 * building as a scroll-scrubbed film, each product named over the film while it is framed. Words and links are
 * HTML, so they read before any frame loads.
 */
export default async function Journey() {
  const t = await getDictionary();
  const locale = await getLocale();
  const paths = {
    product: (slug: string) => localePath(locale, `/product/${slug}`),
    software: (slug: string) => localePath(locale, `/software/${slug}`),
    quote: localePath(locale, "/quote"),
  };
  const chapterRange = (key: string) => timeline.chapters.find((c) => c.key === key) ?? { from: 1, to: timeline.frames };
  const hero = chapterRange("hero");
  const finale = chapterRange("finale");

  const slides: JourneySlide[] = [
    {
      key: "hero",
      from: hero.from,
      to: hero.to,
      node: (
        <header className="journey-hero">
          <h1>
            {t.home.hero.line1} {t.home.hero.line2}
          </h1>
          <p>{t.home.hero.lead}</p>
          <p className="journey-actions">
            <Link href={paths.quote} className="journey-quote">
              {t.home.hero.quote}
            </Link>
            <Link href={localePath(locale, "/products")} className="journey-link">
              {t.home.hero.explore}
            </Link>
          </p>
          <p className="journey-trust">{t.home.hero.trust}</p>
        </header>
      ),
    },
    ...timeline.beats.flatMap((beat) => {
      const copy = beatCopy(beat, paths);
      return copy ? [{ key: beat.key, from: beat.from, to: beat.to, node: <JourneyBeat {...copy} /> }] : [];
    }),
    {
      key: "finale",
      from: finale.from,
      to: finale.to,
      node: (
        <article className="journey-card journey-finale">
          <p className="journey-eyebrow">{CHAPTER_LABELS.finale}</p>
          <h2 className="journey-name">See it working in Dubai and Abu Dhabi</h2>
          <ul className="journey-places">
            {LOCATIONS.map((l) => (
              <li key={l.id}>
                <strong>{LOCATION_NAMES[l.id]}</strong>
                <span>{l.address}</span>
                <a href={`tel:${CONTACT.lines[l.line].tel}`} dir="ltr">
                  {CONTACT.lines[l.line].display}
                </a>
              </li>
            ))}
          </ul>
          <p className="journey-actions">
            <Link href={paths.quote} className="journey-quote">
              {t.home.hero.quote}
            </Link>
          </p>
        </article>
      ),
    },
  ];

  const chapters: JourneyChapter[] = timeline.chapters
    .filter((c) => c.key !== "hero")
    .map((c) => ({ key: c.key, label: CHAPTER_LABELS[c.key] ?? c.key, frame: timeline.beats.find((b) => b.chapter === c.key)?.from ?? c.from }));

  return (
    <main id="main" className="journey-page">
      <JourneyPlayer timeline={timeline} slides={slides} chapters={chapters} frameSrc="/journey/frames/" indexLabel="Chapters" />
    </main>
  );
}
