import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialPage } from "@/components/editorial/EditorialPage";
import { ArrowIcon } from "@/components/icons";
import { ARTICLE_SLUG, pageContent } from "@/content/pages";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { navigationHref } from "@/lib/navigationHref";
import { alternates } from "@/lib/seo";
import "@/components/editorial/editorial.css";

/** Only AIMS's access control guide is built (Master Plan 12 #14); the other posts stay on aimsuae.me. */
export function generateStaticParams() {
  return [{ slug: ARTICLE_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  if ((await params).slug !== ARTICLE_SLUG) return {};
  const { blog: c } = await getDictionary();
  return {
    title: c.articleMetaTitle,
    description: c.articleMetaDescription,
    alternates: alternates(await getLocale(), `/blog/${ARTICLE_SLUG}`),
  };
}

/** T10 article with related solutions (Master Plan 12 #14; Design Doc 10.1). The text is AIMS's, as published. */
export default async function BlogArticle({ params }: PageProps<"/[lang]/blog/[slug]">) {
  if ((await params).slug !== ARTICLE_SLUG) notFound();
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.blog;
  const article = pageContent("article");
  // The importer keeps the headline line as a first paragraph; the page already has it as its h1.
  const blocks = article.blocks.filter((b, i) => !(i === 0 && b.type === "p" && b.text === article.title));
  const lang = locale === "en" ? undefined : "en";
  return (
    <EditorialPage
      crumbs={[
        { href: localePath(locale, "/"), label: t.common.home },
        { href: localePath(locale, "/blog"), label: c.title },
        { href: localePath(locale, `/blog/${ARTICLE_SLUG}`), label: c.articleMetaTitle },
      ]}
      title={article.title}
      titleLang={lang}
      blocks={blocks}
      blocksLang={lang}
    >
      <section className="ed-section" aria-labelledby="related-title">
        <h2 id="related-title">{c.relatedHeading}</h2>
        <ul className="ed-links">
          <li>
            <Link href={navigationHref(localePath(locale, "/solutions/access-control"))}>{c.relatedSolution}</Link>
          </li>
          <li>
            <Link href={localePath(locale, "/products/access-control")}>{c.relatedProducts}</Link>
          </li>
        </ul>
        <div className="ed-actions">
          <Link href={localePath(locale, "/quote?need=install")} className="home-button">
            {c.quote}
            <ArrowIcon width="18" height="18" className="home-action-arrow" />
          </Link>
        </div>
      </section>
    </EditorialPage>
  );
}
