import { NavigationLink as Link } from "./NavigationLink";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { FAMILIES } from "@/content/taxonomy";
import { SOFTWARE_LINKS, SOLUTIONS, familyPath, solutionPath } from "@/lib/nav";
import { COMPANY_NAME, ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { Wordmark } from "./Wordmark";

/** Copyright year, fixed at build time (Cache Components disallow a bare new Date()). */
async function buildYear() {
  "use cache";
  return new Date().getFullYear();
}

/** Every footer link is a 44px tap target (CLAUDE.md §4, skill house rules). */
const TARGET = "inline-flex min-h-11 items-center";

/**
 * The page's last section (design skill layout-v4.md 2, system.md Footer): the dealt close
 * (close-word) and the directory in one footer.closing, one screen, on the dark ground
 * (footer-dark). Row 1: the main action, worded as in the nav and the hero, and the name set
 * large. Row 2: the wordmark and partner line, four link columns (h3 heads) and the legal row.
 * AIMS's phone lines and addresses live on the Contact page, which the Company column links to.
 */
export async function Footer() {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const year = await buildYear();

  const columns = [
    {
      title: t.footer.products,
      links: [
        // Six rows a column, so the close and the directory share one screen (layout-v4.md 2).
        ...FAMILIES.map((f) => ({ href: href(familyPath(f.slug)), label: t.families[f.slug].name })),
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
        { href: href("/contact"), label: t.nav.contact },
      ],
    },
  ];

  return (
    <footer className="footer closing footer--dark ground-inverse" aria-labelledby="close-h">
      <div className="wrap">
        <div className="closing__cta close--word">
          <div className="section-head--split">
            <div>
              <h2 id="close-h">{t.closing.title}</h2>
              <p className="t-lead">{t.closing.lead}</p>
            </div>
            <Link externalLabel={t.home.external} href={href("/quote")} className="btn btn--primary">
              {t.nav.primaryAction}
              <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                <path className="m-arrow__stem" d="M1 6h8" />
                <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
              </svg>
            </Link>
          </div>
          <p className="close__word" aria-hidden="true" dir="ltr">
            AIMS
          </p>
        </div>

        <div className="closing__links">
          <div className="grid">
            <div className="span-4 stack-4">
              <Wordmark href={href("/")} />
              <p className="footer__lede">
                {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
              </p>
            </div>
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title} className="span-2 footer__col">
                <h3>{c.title}</h3>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link externalLabel={t.home.external} href={l.href} className={TARGET}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="footer__legal">
            <span>
              © {year} {COMPANY_NAME}
            </span>
            <Link externalLabel={t.home.external} href={href("/privacy-policy")} className={TARGET}>
              {t.footer.privacy}
            </Link>
            <Link externalLabel={t.home.external} href={href("/terms-and-conditions")} className={TARGET}>
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
