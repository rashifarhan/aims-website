import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArticleCard } from "@/components/editorial/ArticleCard";
import { articles } from "@/content/pages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.editorial.blog,
    description: t.editorial.blogDescription,
    alternates: alternates(await getLocale(), "/blog"),
  };
}

/** T10 editorial, the blog index: every article AIMS has published, newest first (Master Plan 12). */
export default async function Blog() {
  const t = await getDictionary();
  const locale = await getLocale();
  const list = articles();
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main" className="w-full flex-1">
      <div className="page-container pt-6 pb-16">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: href("/"), label: t.common.home },
            { href: href("/blog"), label: t.editorial.blog },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t.editorial.blogTitle}</h1>
        <p className="mt-2 max-w-2xl text-ink-600 sm:text-lg">
          {fmt(t.editorial.blogLead, { count: list.length })}
          {locale === "ar" && ` ${t.editorial.englishOnly}`}
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <li key={a.slug} className="flex">
              <ArticleCard article={a} href={href(`/blog/${a.slug}`)} dateLabel={t.editorial.published} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
