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
 * Footer (Design Doc ch. 6) on night green, AIMS's dark band (client request, 24 Nov 2026): the brand and contact
 * grid, four link columns, popular searches, then the legal line.
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
    <footer className="site-footer mt-auto border-t border-night-line bg-night-900 bg-(image:--gradient-night) text-night-muted [&_a]:inline-flex [&_a]:min-h-11 [&_a]:min-w-11 [&_a]:items-center">
      <div className="wrap pt-14 pb-6 sm:pt-16 xl:pt-20">
        {/* One 12-column grid at 1280px and up: the brand and contacts take four columns, the four link groups
            the other eight, all on one top line (client request for a professional footer, 24 Nov 2026). */}
        <div className="grid gap-10 sm:gap-12 xl:grid-cols-12 xl:gap-8">
          <div className="xl:col-span-4">
            <Wordmark href={href("/")} tone="night" />
            <p className="mt-2 text-sm text-night-muted">
              {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
            </p>
            <div className="mt-8">
              <FooterContact t={t.footer} />
            </div>
          </div>
          <div className="xl:col-span-8">
            <FooterLinks columns={columns} externalLabel={t.home.external} />
          </div>
        </div>

        {/* Plain links in the footer's one link look, not pills: a third button style broke "one button
            pair" on every page (taste button-styles, audit 23 Nov 2026). From 640px the label and the links
            share one line under a hairline; on a phone the folded groups' own bottom line parts them. */}
        <div className="mt-8 sm:mt-12 sm:flex sm:items-center sm:gap-6 sm:border-t sm:border-night-line sm:pt-5 xl:mt-16">
          <h2 className="shrink-0 text-sm font-semibold text-night-text">{t.footer.popular}</h2>
          {/* Each link pads 10px a side so a short code (F18) still makes a 44px target with even gaps; the
              list's negative margin keeps the first word on the column line. */}
          <ul className="-ms-2.5 mt-1 flex flex-wrap gap-x-1 sm:mt-0">
            {POPULAR_SEARCHES.map((q) => (
              <li key={q}>
                <Link
                  externalLabel={t.home.external}
                  href={href(searchPath(q))}
                  className={`${footerLinkClass} justify-center px-2.5 text-sm text-night-muted`}
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-col gap-1 border-t border-night-line pt-4 text-sm text-night-muted sm:flex-row sm:items-center sm:justify-between">
          {/* The English company line stays one left-to-right run inside Arabic (CLAUDE.md §7). */}
          <p>
            <span dir="ltr">
              © {year} {COMPANY_NAME}.
            </span>{" "}
            {t.footer.rights}
          </p>
          <ul className="-ms-2.5 flex gap-1 sm:ms-0 sm:-me-2.5">
            <li>
              <Link
                externalLabel={t.home.external}
                href={href("/privacy-policy")}
                className={`${footerLinkClass} justify-center px-2.5`}
              >
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <Link
                externalLabel={t.home.external}
                href={href("/terms-and-conditions")}
                className={`${footerLinkClass} justify-center px-2.5`}
              >
                {t.footer.terms}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
