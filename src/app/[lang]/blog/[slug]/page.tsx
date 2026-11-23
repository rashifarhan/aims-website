import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { alternates, fitTitle } from "@/lib/seo";
import { articleDate, outline } from "@/lib/editorial";
import { ArticleCard } from "@/components/editorial/ArticleCard";
import { ArticleNext } from "@/components/editorial/ArticleNext";
import { EditorialBlocks } from "@/components/editorial/EditorialBlocks";
import { PageHero } from "@/components/ui/PageHero";
import { OnThisPage } from "@/components/editorial/OnThisPage";
import { articleBySlug, articles } from "@/content/pages";
import "@/components/editorial/editorial.css";

/** Every article on the live blog keeps its URL (CLAUDE.md §6), from this one template. */
export function generateStaticParams() {
  return articles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  if (!a) return {};
  return {
    title: fitTitle(a.title),
    description: fitTitle(a.excerpt, 160),
    alternates: alternates(await getLocale(), `/blog/${a.slug}`),
  };
}

/**
 * T10 editorial, one article (Master Plan 12 #14; Design Doc 10.1): AIMS's own text and image, as
 * published, in the 680px column with an index when it is long; then the related solution and three
 * more articles. The date is the one AIMS published. Entrance and hover only (README → Decisions).
 */
export default async function BlogArticle({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const index = outline(a.blocks);
  const all = articles();
  const at = all.indexOf(a);
  const more = [1, 2, 3].map((n) => all[(at + n) % all.length]);
  return (
    <main id="main" className="w-full flex-1">
      <PageHero
        variant="compact"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/blog"), label: t.blog.crumb },
          { href: href(`/blog/${a.slug}`), label: a.title },
        ]}
        eyebrow={t.blog.eyebrow}
        title={a.title}
        titleLang="en"
        lead={
          a.date ? (
            <p className="ed-meta">
              <time dateTime={a.date}>{fmt(t.blog.published, { date: articleDate(a.date, locale) })}</time>
              {locale === "ar" && ` · ${t.editorial.englishOnly}`}
            </p>
          ) : undefined
        }
      />
      <div className="ed-layout wrap">
        {index.length > 3 && (
          <OnThisPage labels={{ wide: t.editorial.onThisPage, narrow: t.editorial.jumpTo }} items={index} lang="en" />
        )}
        <article className="ed-column" aria-label={a.title}>
          {a.image && (
            <div className="ed-article-photo">
              {/* The LCP element: AIMS's own article image, sized, preloaded, never shifts (CLAUDE.md §5). */}
              <Image
                src={a.image.src}
                alt=""
                width={a.image.width}
                height={a.image.height}
                sizes="(min-width: 768px) 680px, 100vw"
                preload
              />
            </div>
          )}
          <EditorialBlocks blocks={a.blocks} anchored />
          <ArticleNext slug={a.slug} />
        </article>
      </div>
      <section className="ed-more wrap" aria-labelledby="article-more-title">
        <div className="ed-more-heading">
          <h2 id="article-more-title" className="section-title">
            {t.blog.moreHeading}
          </h2>
          <Link href={href("/blog")} className="home-text-link">
            {t.blog.all}
          </Link>
        </div>
        <ul className="ed-card-grid">
          {more.map((m) => (
            <li key={m.slug}>
              <ArticleCard article={m} href={href(`/blog/${m.slug}`)} heading="h3" />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
