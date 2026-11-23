import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { ArticleCard } from "@/components/editorial/ArticleCard";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
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
 * each with AIMS's own image. Entrance and hover only: a dealt moment on a list of articles would be
 * decoration (README → Decisions).
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
        eyebrow={t.blog.eyebrow}
        title={t.blog.title}
        lead={`${fmt(t.blog.lead, { count: list.length })}${locale === "ar" ? ` ${t.editorial.englishOnly}` : ""}`}
      />
      <Section ground="band" labelledBy="blog-list-title" className="ed-list">
        <h2 id="blog-list-title" className="sr-only">
          {t.blog.title}
        </h2>
        <ul className="ed-card-grid">
          {list.map((a) => (
            <li key={a.slug}>
              <ArticleCard article={a} href={href(`/blog/${a.slug}`)} />
            </li>
          ))}
        </ul>
      </Section>
      <ClosePanel
        id="blog-close-title"
        heading={t.blog.nextHeading}
        body={t.blog.nextBody}
        action={{ href: href("/quote"), label: t.blog.quote }}
      />
    </main>
  );
}
