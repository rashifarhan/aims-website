import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { legalPage, type LegalSlug } from "@/content/pages";
import { outline } from "@/lib/editorial";
import { EditorialBlocks } from "./EditorialBlocks";
import { EditorialIntro } from "./EditorialIntro";
import { OnThisPage } from "./OnThisPage";
import "./editorial.css";

/**
 * T10 editorial, legal (Master Plan 12 #11–12: "readable prose, index, demo data note"; Design Doc 10.1:
 * a 680px column and an in-page index). The text is AIMS's published policy, imported verbatim and
 * never rewritten here (CLAUDE.md §1). Entrance and hover only: a dealt moment here would be decoration.
 */
export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.editorial;
  const page = legalPage(slug);
  const index = outline(page.blocks);
  return (
    <main id="main" className="w-full flex-1">
      <EditorialIntro
        crumbs={[
          { href: localePath(locale, "/"), label: t.common.home },
          { href: localePath(locale, `/${slug}`), label: c[slug] },
        ]}
        title={c[slug]}
        lead={locale === "ar" ? c.englishOnly : c.legalLead}
      />
      <div className="ed-layout page-container">
        {index.length > 3 && <OnThisPage labels={{ wide: c.onThisPage, narrow: c.jumpTo }} items={index} lang="en" />}
        <article className="ed-column" aria-label={c[slug]}>
          <EditorialBlocks blocks={page.blocks} anchored />
          <p className="ed-note">{c.previewNote}</p>
        </article>
      </div>
    </main>
  );
}
