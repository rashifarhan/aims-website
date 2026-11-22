import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/editorial/EditorialPage";
import { ArrowIcon } from "@/components/icons";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import "@/components/editorial/editorial.css";
import "@/components/solution/solution.css";

export async function generateMetadata(): Promise<Metadata> {
  const { services: c } = await getDictionary();
  return { title: c.metaTitle, description: c.metaDescription, alternates: alternates(await getLocale(), "/services") };
}

/**
 * T3 service (Master Plan 12 #5): the four services AIMS publishes (supply, design, installation,
 * after-sales support), who does what, and one installation quote. Warranty terms are ZKTeco's, so
 * the page links to them rather than restating them (CLAUDE.md §1).
 */
export default async function Services() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.services;
  const href = (p: string) => localePath(locale, p);
  return (
    <EditorialPage
      crumbs={[
        { href: href("/"), label: t.common.home },
        { href: href("/services"), label: t.nav.services },
      ]}
      title={c.title}
      lead={c.lead}
    >
      <div className="ed-actions">
        <Link href={href("/quote?need=install")} className="home-button">
          {c.primary}
          <ArrowIcon width="18" height="18" className="home-action-arrow" />
        </Link>
        <Link href={href("/support#warranty")} className="home-secondary">
          {c.secondary}
        </Link>
      </div>
      <section className="ed-section" aria-labelledby="services-list-title">
        <h2 id="services-list-title">{c.listHeading}</h2>
        <ul className="ed-cards">
          {c.items.map((item) => (
            <li key={item.title} className="ed-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="ed-section" aria-labelledby="services-process-title">
        <h2 id="services-process-title">{c.processHeading}</h2>
        <ol className="ed-steps">
          {c.steps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <p className="ed-owner">
                <span className="sr-only">{c.owner}: </span>
                {step.owner}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="ed-section t3-cta-panel" aria-labelledby="services-close-title">
        <h2 id="services-close-title">{c.closeHeading}</h2>
        <Link href={href("/quote?need=install")} className="home-button">
          {c.primary}
          <ArrowIcon width="18" height="18" className="home-action-arrow" />
        </Link>
      </section>
    </EditorialPage>
  );
}
