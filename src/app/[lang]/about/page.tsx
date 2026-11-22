import type { Metadata } from "next";
import { ContactLink } from "@/components/contact/ContactLink";
import { EditorialBlocks } from "@/components/editorial/EditorialBlocks";
import { EditorialPage } from "@/components/editorial/EditorialPage";
import { HomeProof } from "@/components/home/HomeProof";
import { pageContent } from "@/content/pages";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { withoutFoundingYear } from "@/lib/editorial";
import { alternates } from "@/lib/seo";
import { CONTACT, LOCATION_LINES } from "@/lib/site";
import Link from "next/link";
import "@/components/editorial/editorial.css";
import "@/components/home/sections.css";

export async function generateMetadata(): Promise<Metadata> {
  const { about: c } = await getDictionary();
  return { title: c.metaTitle, description: c.metaDescription, alternates: alternates(await getLocale(), "/about") };
}

/**
 * T10 About (Master Plan 12 #7): AIMS's own story text (without a founding year, which AIMS has not
 * confirmed), the company-stated figures and published review excerpts (HomeProof), and the three
 * places to visit. No team names or photos: AIMS has not supplied them.
 */
export default async function About() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.about;
  const story = pageContent("about").blocks.map((b) =>
    b.type === "p" ? { ...b, text: withoutFoundingYear(b.text) } : b,
  );
  return (
    <EditorialPage
      crumbs={[
        { href: localePath(locale, "/"), label: t.common.home },
        { href: localePath(locale, "/about"), label: c.title },
      ]}
      title={c.title}
      lead={c.lead}
    >
      <section className="ed-section" aria-labelledby="about-story-title">
        <h2 id="about-story-title">{c.storyHeading}</h2>
        <EditorialBlocks blocks={story} lang={locale === "en" ? undefined : "en"} level={3} />
      </section>
      <HomeProof />
      <section className="ed-section" aria-labelledby="about-places-title">
        <h2 id="about-places-title">{c.placesHeading}</h2>
        <ul className="ed-cards">
          {LOCATION_LINES.map((line) => (
            <li key={line} className="ed-card">
              <h3>{c[line]}</h3>
              {line === "showroom" && <p dir="ltr">{CONTACT.showroomAddress}</p>}
              <ContactLink
                kind="phone"
                href={`tel:${CONTACT.lines[line].tel}`}
                target={CONTACT.lines[line].display}
                className="home-text-link"
              >
                <span dir="ltr">{CONTACT.lines[line].display}</span>
              </ContactLink>
            </li>
          ))}
        </ul>
        <div className="ed-actions">
          <Link href={`${localePath(locale, "/")}#showrooms`} className="home-secondary">
            {c.visit}
          </Link>
        </div>
      </section>
    </EditorialPage>
  );
}
