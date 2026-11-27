import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { absoluteUrl } from "@/lib/seo";

export type Crumb = { href: string; label: string };

const TONES = {
  paper: { nav: "text-sm text-ink-600", current: "text-ink-700", link: "hover:text-ink", sep: "text-ink-300" },
  // On a direction 2 stage (night ground): mono labels, the current page in lime (CLAUDE.md → Design rules, Type).
  night: {
    nav: "in-mono text-night-muted",
    current: "text-lime",
    link: "hover:text-word",
    sep: "text-night-muted/60",
  },
} as const;

/** Breadcrumb trail + BreadcrumbList JSON-LD. The last item is the current page. */
export function Breadcrumbs({
  items,
  label,
  tone = "paper",
}: {
  items: Crumb[];
  label: string;
  tone?: keyof typeof TONES;
}) {
  const look = TONES[tone];
  return (
    <nav aria-label={label} className={look.nav}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i === items.length - 1 ? (
              <span aria-current="page" className={look.current}>
                <bdi>{c.label}</bdi>
              </span>
            ) : (
              <Link
                href={c.href}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center hover:underline ${look.link}`}
              >
                <bdi>{c.label}</bdi>
              </Link>
            )}
            {/* The separator ends its item rather than starting the next, so a wrap at 320px never opens a line
                with "/" (three-skill audit, Impeccable adapt). */}
            {i < items.length - 1 && (
              <span aria-hidden="true" className={look.sep}>
                /
              </span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: absoluteUrl(c.href),
          })),
        }}
      />
    </nav>
  );
}
