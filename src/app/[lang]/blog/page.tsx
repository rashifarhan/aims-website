import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { ArticleCard } from "@/components/editorial/ArticleCard";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SpotlightGroup } from "@/components/ui/SpotlightGroup";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { articles } from "@/content/pages";
import "@/components/editorial/editorial.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.blog.metaTitle,
    description: t.blog.metaDescription,
    alternates: alternates(await getLocale(), "/blog"),
  };
}

/**
 * T10 editorial, the blog index (Master Plan 12 #13): every article AIMS has published, newest first,
 * each with AIMS's own image, then the shared closing band, so the index ends on a way forward (taste cta,
 * audit 23 Nov 2026). Entrance and hover only: a dealt moment on a list of articles would be decoration
 * (README → Decisions). The first card's image is the LCP element, so only it is preloaded (CLAUDE.md §5).
 */
export default async function Blog() {
  const t = await getDictionary();
  const locale = await getLocale();
  const list = articles();
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main" className="w-full flex-1">
      <PageHero
        variant="compact"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/blog"), label: t.blog.crumb },
        ]}
        title={t.blog.title}
        lead={`${fmt(t.blog.lead, { count: list.length })}${locale === "ar" ? ` ${t.editorial.englishOnly}` : ""}`}
      />
      <Section ground="band" labelledBy="blog-list-title" className="ed-list">
        <h2 id="blog-list-title" className="sr-only">
          {t.blog.title}
        </h2>
        <SpotlightGroup>
          <ul className="ed-card-grid">
            {list.map((a, i) => (
              <li key={a.slug}>
                <ArticleCard article={a} href={href(`/blog/${a.slug}`)} lead={i === 0} />
              </li>
            ))}
          </ul>
        </SpotlightGroup>
      </Section>
      <ClosePanel
        id="blog-close-title"
        heading={t.blog.closeHeading}
        body={t.blog.closeBody}
        action={{ href: href("/quote"), label: t.blog.closeAction }}
        secondary={{ href: href("/solutions"), label: t.blog.closeSecondary }}
      />
    </main>
  );
}
