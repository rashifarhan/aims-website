import { Suspense } from "react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { headerSearchEntries } from "@/content/headerSearchEntries";
import { FAMILIES } from "@/content/taxonomy";
import { productCount, productsInFamily } from "@/content/catalogue";
import { SOLUTIONS, familyPath, solutionPath } from "@/lib/nav";
import { CONTACT, whatsappUrl } from "@/lib/site";
import { DesktopNav, type NavItem } from "./DesktopNav";
import { HeaderSearch } from "./HeaderSearch";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { QuoteLink } from "./QuoteLink";
import { Wordmark } from "./Wordmark";

/**
 * Site header (Design Doc ch. 6). Desktop 72px: wordmark · Products ·
 * Solutions · Software · Services · About · search · language · Quote.
 * Mobile 60px: wordmark · Quote · menu. Nothing sits above it.
 */
export async function Header() {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const entries = headerSearchEntries(t, locale);
  const otherLocale = locale === "ar" ? "en" : "ar";

  const items: NavItem[] = [
    {
      kind: "menu",
      label: t.nav.products,
      lead: t.nav.productsLead,
      links: FAMILIES.map((f) => ({
        href: href(familyPath(f.slug)),
        label: t.families[f.slug].name,
        summary: t.families[f.slug].summary,
        meta: String(productsInFamily(f.slug).length),
      })),
      footer: { href: href("/products"), label: t.nav.productsAll, meta: String(productCount()) },
    },
    {
      kind: "menu",
      label: t.nav.solutions,
      lead: t.nav.solutionsLead,
      links: SOLUTIONS.map((s) => ({
        href: href(solutionPath(s)),
        label: t.solutions[s].name,
        summary: t.solutions[s].summary,
      })),
      footer: { href: href("/solutions"), label: t.nav.solutionsAll },
    },
    { kind: "link", href: href("/software"), label: t.nav.software },
    { kind: "link", href: href("/services"), label: t.nav.services },
    { kind: "link", href: href("/about"), label: t.nav.about },
  ];

  return (
    <header className="nav sticky top-0 z-30 border-b border-line bg-paper/94 backdrop-blur-md backdrop-saturate-150">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-paper focus:px-4 focus:py-2 focus:shadow-2"
      >
        {t.nav.skipToContent}
      </a>
      <div className="wrap page-container flex h-15 items-center gap-3 lg:h-18 lg:gap-4 xl:gap-6">
        <Wordmark href={href("/")} descriptor="Security Systems" />
        <DesktopNav externalLabel={t.home.external} items={items} label={t.nav.primary} />
        <HeaderSearch
          entries={entries}
          labels={t.search}
          id="header-search"
          action={href("/products")}
          placeholder={t.nav.search}
          submitLabel={t.nav.searchSubmit}
          className="ms-auto hidden w-40 lg:block xl:w-72"
          shortcut
        />
        <Suspense fallback={null}>
          <LanguageSwitch
            target={otherLocale}
            label={t.nav.switchLanguage}
            className="hidden h-11 items-center rounded-pill px-2 text-sm font-semibold text-ink-700 hover:text-ink lg:inline-flex"
          />
        </Suspense>
        <QuoteLink
          externalLabel={t.home.quoteNotice}
          href={href("/quote")}
          label={t.nav.quote}
          itemsLabel={t.nav.quoteItems}
          className="ms-auto lg:ms-0"
        />
        <Suspense fallback={null}>
          <MobileMenu
            items={items}
            searchEntries={entries}
            searchLabels={t.search}
            otherLocale={otherLocale}
            labels={{
              external: t.home.external,
              open: t.nav.openMenu,
              close: t.nav.closeMenu,
              menu: t.nav.menu,
              search: t.nav.searchPlaceholder,
              searchSubmit: t.nav.searchSubmit,
              quote: t.nav.quote,
              whatsapp: t.common.whatsapp,
              call: t.common.call,
              language: t.nav.switchLanguage,
            }}
            hrefs={{
              search: href("/products"),
              quote: href("/quote"),
              whatsapp: whatsappUrl(),
              whatsappDisplay: CONTACT.lines.mobile.display,
              tel: CONTACT.lines.showroom.tel,
              telDisplay: CONTACT.lines.showroom.display,
            }}
          />
        </Suspense>
      </div>
    </header>
  );
}
