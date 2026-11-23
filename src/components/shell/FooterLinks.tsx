import { NavigationLink as Link } from "./NavigationLink";
import { ChevronDownIcon } from "@/components/icons";

export type FooterColumn = { title: string; links: { href: string; label: string }[] };

/**
 * The footer's one link look (site audit, 23 Nov 2026; taste House rule 5, Emil): colour and underline fade in
 * together over the hover duration, the underline draws in, and a press dims the link like `.home-text-link`.
 */
export const footerLinkClass =
  "inline-flex min-h-11 items-center underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,opacity] duration-(--duration-hover) ease-[ease] hover:text-green-700 hover:decoration-current active:opacity-75";

const linkClass = `${footerLinkClass} text-sm text-ink-700`;

/**
 * The footer's four link groups. From 640px they stand as columns. On a phone each group folds into a
 * disclosure, so the footer stays about half as tall while the phones and addresses above it stay open
 * (site polish, 22 Nov 2026). Only one of the two renders at a time (display: none hides the other).
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
      <div className="hidden grid-cols-4 gap-x-6 gap-y-10 sm:grid">
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold text-ink">{c.title}</h2>
            <ul className="mt-3">{list(c)}</ul>
          </nav>
        ))}
      </div>
      <div className="divide-y divide-line border-y border-line sm:hidden">
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <details className="group">
              <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
                <h2 className="text-sm font-semibold text-ink">{c.title}</h2>
                <ChevronDownIcon
                  width={18}
                  height={18}
                  className="text-ink-600 transition-transform duration-(--duration-dropdown) ease-(--ease-aims) group-open:rotate-180"
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
