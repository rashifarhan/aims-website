import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates, fitTitle } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EditorialBlocks } from "@/components/editorial/EditorialBlocks";
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
    description: a.excerpt.slice(0, 160),
    alternates: alternates(await getLocale(), `/blog/${a.slug}`),
  };
}

/** T10 editorial, one article: AIMS's own text, as published, in the reading column (Design Doc 10). */
export default async function BlogArticle({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main" className="w-full flex-1">
      <article className="page-container pt-6 pb-16">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: href("/"), label: t.common.home },
            { href: href("/blog"), label: t.editorial.blog },
            { href: href(`/blog/${a.slug}`), label: a.title },
          ]}
        />
        <div className="max-w-reading">
          <h1 lang="en" dir="ltr" className="mt-4 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
            {a.title}
          </h1>
          {a.date && (
            <p className="mt-3 text-ink-600 tabular-nums">
              {t.editorial.published} <time dateTime={a.date}>{a.date}</time>
              {locale === "ar" && ` · ${t.editorial.englishOnly}`}
            </p>
          )}
          {a.image && (
            <Image
              src={a.image.src}
              alt={a.image.alt}
              width={a.image.width}
              height={a.image.height}
              priority
              sizes="(min-width: 768px) 680px, 100vw"
              className="mt-6 aspect-[16/9] w-full rounded-lg object-cover"
            />
          )}
          <div className="mt-8">
            <EditorialBlocks blocks={a.blocks} />
          </div>
        </div>
      </article>
    </main>
  );
}
