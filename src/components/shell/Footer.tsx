import { NavigationLink as Link } from "./NavigationLink";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { FAMILIES } from "@/content/taxonomy";
import { POPULAR_SEARCHES, SOFTWARE_LINKS, SOLUTIONS, familyPath, searchPath, solutionPath } from "@/lib/nav";
import { CONTACT, ZKTECO_AUTHORIZATION_CONFIRMED, whatsappUrl } from "@/lib/site";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { ContactLink } from "@/components/contact/ContactLink";
import { Wordmark } from "./Wordmark";
import { FooterLinks } from "./FooterLinks";

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
        { href: href("/locations"), label: t.footer.locationsHub },
        { href: href("/contact"), label: t.nav.contact },
      ],
    },
  ];

  const phones = [
    { label: t.footer.headOffice, line: CONTACT.lines.headOffice },
    { label: t.footer.showroom, line: CONTACT.lines.showroom },
    { label: t.footer.abuDhabi, line: CONTACT.lines.abuDhabi },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-paper-2 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:min-w-11 [&_a]:items-center">
      <div className="wrap pt-12 pb-8 lg:pt-16">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Wordmark href={href("/")} />
            <p className="mt-3 max-w-xs text-sm text-ink-600">
              {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
            </p>

            <h2 className="mt-8 text-sm font-semibold text-ink">{t.footer.locations}</h2>
            <ul className="mt-3 grid grid-cols-[16px_auto_1fr] items-center gap-x-3 gap-y-2.5 text-sm">
              {phones.map((p) => (
                <li key={p.line.tel} className="col-span-3 grid grid-cols-subgrid items-center">
                  <PhoneIcon width={16} height={16} className="shrink-0 text-ink-400" />
                  <span className="text-ink-600">{p.label}</span>
                  <ContactLink
                    kind="phone"
                    href={`tel:${p.line.tel}`}
                    target={p.line.display}
                    className="font-medium text-ink tabular-nums hover:text-green-700"
                  >
                    <span dir="ltr">{p.line.display}</span>
                  </ContactLink>
                </li>
              ))}
              <li className="col-span-3 grid grid-cols-subgrid items-center">
                <WhatsAppIcon width={16} height={16} className="shrink-0 text-whatsapp" />
                <span className="text-ink-600">{t.footer.mobile}</span>
                <ContactLink
                  kind="whatsapp"
                  href={whatsappUrl()}
                  target={CONTACT.lines.mobile.display}
                  className="font-medium text-ink tabular-nums hover:text-green-700"
                >
                  <span dir="ltr">{CONTACT.lines.mobile.display}</span>
                </ContactLink>
              </li>
              <li className="col-span-3 grid grid-cols-subgrid items-center">
                <MailIcon width={16} height={16} className="shrink-0 text-ink-400" />
                <span className="text-ink-600">{t.footer.email}</span>
                <ContactLink
                  kind="email"
                  href={`mailto:${CONTACT.email}`}
                  target={CONTACT.email}
                  className="font-medium text-ink hover:text-green-700"
                >
                  {CONTACT.email}
                </ContactLink>
              </li>
              <li className="col-span-3 grid grid-cols-subgrid items-start">
                <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-ink-400" />
                <span className="col-span-2 text-ink-600">
                  {CONTACT.showroomAddress} ·{" "}
                  <a
                    href={CONTACT.showroomMap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:text-green-700"
                  >
                    {t.footer.directions}
                    <span className="sr-only"> ({t.footer.showroom}, Google Maps)</span>
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <FooterLinks columns={columns} externalLabel={t.home.external} />
        </div>

        <div className="mt-10 border-t border-line pt-6 sm:mt-12">
          <h2 className="text-sm font-semibold text-ink">{t.footer.popular}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((q) => (
              <li key={q}>
                <Link externalLabel={t.home.external} href={href(searchPath(q))} className="ui-chip">
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-sm text-ink-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} AIMS Security Systems Trading LLC. {t.footer.rights}
          </p>
          <ul className="flex gap-5">
            <li>
              <Link externalLabel={t.home.external} href={href("/privacy-policy")} className="hover:text-ink">
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <Link externalLabel={t.home.external} href={href("/terms-and-conditions")} className="hover:text-ink">
                {t.footer.terms}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
