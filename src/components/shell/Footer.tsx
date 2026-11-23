import { NavigationLink as Link } from "./NavigationLink";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { FAMILIES } from "@/content/taxonomy";
import { POPULAR_SEARCHES, SOFTWARE_LINKS, SOLUTIONS, familyPath, searchPath, solutionPath } from "@/lib/nav";
import { COMPANY_NAME, ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import { FooterContact } from "./FooterContact";
import { FooterLinks, footerLinkClass } from "./FooterLinks";

/**
 * Footer (Design Doc ch. 6): four link columns, the three locations with
 * phones, popular searches, policies and the partner note.
 */
/** Copyright year, fixed at build time (Cache Components disallow a bare new Date()). */
async function buildYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const year = await buildYear();

  const columns = [
    {
      title: t.footer.products,
      links: [
        ...FAMILIES.map((f) => ({ href: href(familyPath(f.slug)), label: t.families[f.slug].name })),
        { href: href("/products"), label: t.nav.productsAll },
      ],
    },
    {
      title: t.footer.solutions,
      links: [
        ...SOLUTIONS.map((s) => ({ href: href(solutionPath(s)), label: t.solutions[s].name })),
        { href: href("/solutions"), label: t.nav.solutionsAll },
      ],
    },
    {
      title: t.footer.software,
      links: [
        { href: href("/software"), label: t.nav.downloadCentre },
        ...SOFTWARE_LINKS.map((s) => ({ href: href(s.path), label: s.label })),
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: href("/about"), label: t.footer.aboutShowrooms },
        { href: href("/services"), label: t.footer.services },
        { href: href("/support"), label: t.footer.support },
        { href: href("/blog"), label: t.footer.blog },
        { href: href("/locations"), label: t.footer.locationsHub },
        { href: href("/contact"), label: t.nav.contact },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-paper-2 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:min-w-11 [&_a]:items-center">
      <div className="page-container pt-12 pb-8 lg:pt-16">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Wordmark href={href("/")} />
            <p className="mt-3 max-w-xs text-sm text-ink-600">
              {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
            </p>
            <FooterContact t={t.footer} />
          </div>

          <FooterLinks columns={columns} externalLabel={t.home.external} />
        </div>

        {/* Plain links in the footer's one link look, not pills: a third button style broke "one button
            pair" on every page (taste button-styles, audit 23 Nov 2026). */}
        <div className="mt-10 border-t border-line pt-6 sm:mt-12">
          <h2 className="text-sm font-semibold text-ink">{t.footer.popular}</h2>
          <ul className="mt-1 flex flex-wrap gap-x-6">
            {POPULAR_SEARCHES.map((q) => (
              <li key={q}>
                <Link
                  externalLabel={t.home.external}
                  href={href(searchPath(q))}
                  className={`${footerLinkClass} text-sm text-ink-700`}
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-sm text-ink-600 sm:flex-row sm:items-center sm:justify-between">
          {/* The English company line stays one left-to-right run inside Arabic (CLAUDE.md §7). */}
          <p>
            <span dir="ltr">
              © {year} {COMPANY_NAME}.
            </span>{" "}
            {t.footer.rights}
          </p>
          <ul className="flex gap-5">
            <li>
              <Link externalLabel={t.home.external} href={href("/privacy-policy")} className={footerLinkClass}>
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <Link externalLabel={t.home.external} href={href("/terms-and-conditions")} className={footerLinkClass}>
                {t.footer.terms}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
