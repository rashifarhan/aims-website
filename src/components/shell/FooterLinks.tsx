import { NavigationLink as Link } from "./NavigationLink";
import { ChevronDownIcon } from "@/components/icons";

export type FooterColumn = { title: string; links: { href: string; label: string }[] };

/**
 * The footer's one link look, the site's text-link look (`.home-text-link`; audit 23 Nov 2026, taste House
 * rule 5, Emil): the underline draws in over the hover duration and a press dims the link. The text colour
 * stays put, so links sliding under a resting pointer while the page scrolls never flash colour.
 */
export const footerLinkClass =
  "inline-flex min-h-11 items-center underline decoration-transparent underline-offset-4 transition-[text-decoration-color,opacity] duration-(--duration-hover) ease-[ease] hover:decoration-current active:opacity-75";

const linkClass = `${footerLinkClass} text-sm text-night-muted`;

/**
 * The footer's four link groups on night green. From 640px they stand as four equal columns whose headings sit on
 * the wordmark's centre line at 1280px and up. On a phone each group folds into a disclosure, so the footer stays
 * about half as tall while the contacts above stay open (site polish, 22 Nov 2026). Only one of the two renders
 * at a time (display: none hides the other).
 */
export function FooterLinks({ columns, externalLabel }: { columns: FooterColumn[]; externalLabel: string }) {
  const list = (c: FooterColumn) =>
    c.links.map((l) => (
      <li key={l.href}>
        <Link externalLabel={externalLabel} href={l.href} className={linkClass}>
          {l.label}
        </Link>
      </li>
    ));
  return (
    <>
      <div className="hidden grid-cols-4 gap-x-8 sm:grid xl:pt-3">
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold text-night-text">{c.title}</h2>
            <ul className="mt-2">{list(c)}</ul>
          </nav>
        ))}
      </div>
      <div className="divide-y divide-night-line border-y border-night-line sm:hidden">
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <details className="group">
              <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
                <h2 className="text-sm font-semibold text-night-text">{c.title}</h2>
                <ChevronDownIcon
                  width={18}
                  height={18}
                  className="text-night-muted transition-transform duration-(--duration-dropdown) ease-(--ease-aims) group-open:rotate-180"
                />
              </summary>
              <ul className="motion-disclose hidden pb-3 group-open:block">{list(c)}</ul>
            </details>
          </nav>
        ))}
      </div>
    </>
  );
}
