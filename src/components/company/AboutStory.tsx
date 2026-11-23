import { products } from "@/content/catalogue";
import { FAMILIES } from "@/content/taxonomy";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { COMPANY_NAME, CONTACT, ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { Section } from "@/components/ui/Section";

/**
 * Who AIMS is (Master Plan 12 #7: "About AIMS, not ZKTeco"; Design Doc 10.1: story and fact sheet). The
 * story restates only what AIMS publishes (distributor and installer across the UAE, its sales and
 * after-sales team, its three offices); no founding year until AIMS confirms one (Design Doc 3.1). The
 * fact sheet reads site.ts and the catalogue, and the partner line follows the claims flag.
 */
export async function AboutStory() {
  const t = await getDictionary();
  const c = t.about;
  const facts = [
    { term: c.facts.company, value: COMPANY_NAME, ltr: true },
    { term: c.facts.partner, value: ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner },
    { term: c.facts.offices, value: c.facts.officesValue },
    {
      term: c.facts.catalogue,
      value: fmt(c.facts.catalogueValue, { count: products().length, families: FAMILIES.length }),
    },
    { term: c.facts.email, value: CONTACT.email, ltr: true },
  ];
  return (
    <Section labelledBy="about-story-title" className="co-story">
      <div>
        <h2 id="about-story-title" className="section-title">
          {c.storyHeading}
        </h2>
        {c.story.map((paragraph) => (
          <p key={paragraph} className="co-story-text">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="co-facts ui-card">
        <h3 className="co-facts-title">{c.factsHeading}</h3>
        <dl>
          {facts.map((f) => (
            <div key={f.term}>
              <dt>{f.term}</dt>
              <dd className="tabular-nums" dir={f.ltr ? "ltr" : undefined}>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
