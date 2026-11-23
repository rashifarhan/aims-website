import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { headerSearchEntries } from "@/content/headerSearchEntries";
import { POPULAR_SEARCHES, searchPath } from "@/lib/nav";
import { ArrowIcon } from "@/components/icons";
import { HeaderSearch } from "@/components/shell/HeaderSearch";
import { DoorDenied } from "@/components/signature/DoorDenied";

// A unique title instead of the homepage default (audit T10; CLAUDE.md §6).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.notFound.title };
}

// Model codes carry digits; plain-word searches ("EM lock") stay in the text face (CLAUDE.md §2: codes in Plex Mono).
const isModelCode = (term: string) => /\d/.test(term);

/**
 * The localized 404 inside the site shell (audit T10): it says what happened, offers the model-code
 * search it mentions, one main action, and the door that stays shut (UNLOCK reversed, Design Doc 8.2).
 */
export default async function NotFound() {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (path: string) => localePath(locale, path);
  return (
    <main id="main" className="wrap flex-1 py-12 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
        <div>
          {/* No label above the heading (Impeccable craft floor): the h1 says what happened. */}
          <h1 className="text-page-title-mobile font-bold tracking-tight lg:text-page-title">{t.notFound.title}</h1>
          <p className="mt-4 max-w-lg text-ink-600">{t.notFound.body}</p>
          <label htmlFor="notfound-search" className="mt-8 block text-sm font-semibold text-ink">
            {t.notFound.searchLabel}
          </label>
          <HeaderSearch
            entries={headerSearchEntries(t, locale)}
            labels={t.search}
            id="notfound-search"
            labelledOutside
            action={href("/products")}
            placeholder={t.nav.search}
            submitLabel={t.nav.searchSubmit}
            className="mt-2 max-w-md"
          />
          <Link href={href("/products")} className="home-button mt-6">
            {t.notFound.cta}
            <ArrowIcon className="home-action-arrow rtl:-scale-x-100" />
          </Link>
          <h2 className="mt-10 text-sm font-semibold text-ink">{t.notFound.popular}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <li key={term}>
                <Link href={href(searchPath(term))} className={`ui-chip ${isModelCode(term) ? "font-mono" : ""}`}>
                  <bdi dir="ltr">{term}</bdi>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none">
          <DoorDenied
            labels={{
              alt: t.notFound.doorAlt,
              denied: t.notFound.denied,
              reader: t.home.door.reader,
              lock: t.home.door.lock,
            }}
          />
        </div>
      </div>
    </main>
  );
}
