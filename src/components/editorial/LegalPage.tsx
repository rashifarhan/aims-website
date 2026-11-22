import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { legalPage, type LegalSlug } from "@/content/pages";
import { EditorialBlocks } from "./EditorialBlocks";
import "./editorial.css";

/**
 * T10 editorial, legal (Master Plan 12; Design Doc 10: a 680px reading column). The text is AIMS's
 * published policy, imported verbatim; it is never rewritten here (CLAUDE.md §1).
 */
export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const page = legalPage(slug);
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main" className="w-full flex-1">
      <article className="page-container pt-6 pb-16">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: href("/"), label: t.common.home },
            { href: href(`/${slug}`), label: t.editorial[slug] },
          ]}
        />
        <h1 lang="en" dir="ltr" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {page.title}
        </h1>
        {locale === "ar" && <p className="mt-3 text-ink-600">{t.editorial.englishOnly}</p>}
        <div className="mt-8 max-w-reading">
          <EditorialBlocks blocks={page.blocks} />
        </div>
      </article>
    </main>
  );
}
