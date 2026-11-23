import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { absoluteUrl } from "@/lib/seo";

export type Crumb = { href: string; label: string };

/** Breadcrumb trail + BreadcrumbList JSON-LD. The last item is the current page. */
export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="text-sm text-ink-600">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-ink-700">
                <bdi>{c.label}</bdi>
              </span>
            ) : (
              <Link
                href={c.href}
                className="inline-flex min-h-11 min-w-11 items-center justify-center hover:text-ink hover:underline"
              >
                <bdi>{c.label}</bdi>
              </Link>
            )}
            {/* The separator ends its item rather than starting the next, so a wrap at 320px never opens a line
                with "/" (three-skill audit, Impeccable adapt). */}
            {i < items.length - 1 && (
              <span aria-hidden="true" className="text-ink-300">
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
