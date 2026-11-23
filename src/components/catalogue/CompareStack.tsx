import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/content/schema";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CompareRow } from "@/lib/compare";
import { AddToQuote, type AddToQuoteLabels } from "./AddToQuote";
import { DiffersChip } from "./DiffersChip";

type Props = {
  items: Product[];
  rows: CompareRow[];
  t: Dictionary;
  addLabels: AddToQuoteLabels;
  productHref: (slug: string) => string;
  contentLang?: string;
};

/**
 * The compare view on a phone (AT-09): product names stay pinned; each row shows its label above the values,
 * so nothing scrolls sideways. Each product's Add is the outline button, so three never read as a wall of
 * filled green (CLAUDE.md §2: one main action per screen).
 */
export function CompareStack({ items, rows, t, addLabels, productHref, contentLang }: Props) {
  const columns = { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` };
  return (
    <div className="mt-6 sm:hidden" lang={contentLang}>
      <ul
        className="sticky top-15 z-10 -mx-4 grid gap-3 border-b border-line bg-paper/96 px-4 py-3 backdrop-blur-md"
        style={columns}
      >
        {items.map((p) => (
          <li key={p.slug} className="min-w-0">
            <div className="relative mb-1 aspect-square w-14 overflow-hidden rounded-sm bg-white">
              {p.images[0] && <Image src={p.images[0].src} alt="" fill sizes="56px" className="object-contain p-1" />}
            </div>
            {/* A 44px target, however many lines the name takes (CLAUDE.md §4). */}
            <Link
              href={productHref(p.slug)}
              className="flex min-h-11 items-center text-sm leading-snug font-semibold hover:underline"
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
      <ul>
        {rows.map((r) => (
          <li key={r.label} className={`-mx-4 border-b border-line px-4 py-3 ${r.differs ? "bg-paper-2" : ""}`}>
            <p className="text-sm font-semibold text-ink-700">
              {r.label}
              {r.differs && <DiffersChip label={t.compare.differs} />}
            </p>
            {r.hint && <p className="mt-0.5 text-xs leading-snug text-ink-600">{r.hint}</p>}
            <dl className="mt-2 grid gap-3" style={columns}>
              {r.values.map((v, i) => (
                <div key={items[i].slug} className="min-w-0">
                  <dt className="sr-only">{items[i].name}</dt>
                  <dd className="text-sm break-words text-ink tabular-nums">
                    {v ?? <span className="text-ink-600 italic">{t.product.notListed}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <ul className="mt-6 grid gap-4" style={columns}>
        {items.map((p) => (
          <li key={p.slug} className="min-w-0">
            <p className="mb-2 truncate font-mono text-sm font-medium">
              <span dir="ltr">{p.model}</span>
            </p>
            <AddToQuote slug={p.slug} name={p.name} labels={addLabels} variant="outline" />
          </li>
        ))}
      </ul>
    </div>
  );
}
