import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/editorial/EditorialPage";
import { ExternalLink } from "@/components/home/ExternalLink";
import { ARTICLE_SLUG, blogPosts, pageContent } from "@/content/pages";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { LIVE_AIMS } from "@/lib/site";
import "@/components/editorial/editorial.css";

export async function generateMetadata(): Promise<Metadata> {
  const { blog: c } = await getDictionary();
  return { title: c.metaTitle, description: c.metaDescription, alternates: alternates(await getLocale(), "/blog") };
}

/**
 * T10 blog index (Master Plan 12 #13): the one article built here as a card, then AIMS's other posts
 * as links to aimsuae.me (↗); 15 posts are out of scope (Plan 12).
 */
export default async function Blog() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.blog;
  const lang = locale === "en" ? undefined : "en";
  const others = blogPosts().filter((p) => p.slug !== ARTICLE_SLUG);
  return (
    <EditorialPage
      crumbs={[
        { href: localePath(locale, "/"), label: t.common.home },
        { href: localePath(locale, "/blog"), label: c.title },
      ]}
      title={c.title}
      lead={c.lead}
    >
      <ul className="ed-cards">
        <li>
          <Link href={localePath(locale, `/blog/${ARTICLE_SLUG}`)} className="ed-card">
            <h2 lang={lang}>{pageContent("article").title}</h2>
            <span className="ed-owner">{c.read}</span>
          </Link>
        </li>
      </ul>
      <section className="ed-section" aria-labelledby="blog-more-title">
        <h2 id="blog-more-title">{c.moreHeading}</h2>
        <ul className="ed-links" lang={lang}>
          {others.map((post) => (
            <li key={post.slug}>
              <ExternalLink href={`${LIVE_AIMS.home}blog/${post.slug}`} label={t.common.externalSite}>
                {post.title}
              </ExternalLink>
            </li>
          ))}
        </ul>
      </section>
    </EditorialPage>
  );
}
