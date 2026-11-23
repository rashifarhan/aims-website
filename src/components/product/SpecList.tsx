import type { SpecGroup } from "@/content/schema";
import { specHint, type SpecHints } from "@/content/glossary";

type Props = {
  groups: SpecGroup[];
  hints: SpecHints;
  /** Spread on English product data (label, value, title): `{ lang: "en", dir: "ltr" }` on Arabic pages. */
  data: { lang?: string; dir?: "ltr" };
};

/**
 * Specifications exactly as AIMS publishes them (verbatim values), with a plain-language hint in the page's
 * language under labels buyers may not know (review decision 3). Label and value pairs run in two columns
 * from 640px and one on a phone (Design Doc 10, T5). Long unbroken values wrap inside their cell so the list
 * never widens the page at 390px (CLAUDE.md 4: reflow).
 */
export function SpecList({ groups, hints, data }: Props) {
  return (
    <div className="min-w-0 space-y-8">
      {groups.map((g) => (
        <div key={g.title}>
          {groups.length > 1 && (
            <h3 className="mb-2 text-base font-semibold text-ink">
              <span {...data}>{g.title}</span>
            </h3>
          )}
          <dl className="grid grid-cols-[minmax(0,1fr)] gap-x-8 sm:grid-cols-2">
            {g.rows.map((r) => {
              const hint = specHint(r.label, hints);
              return (
                <div key={r.label} className="border-b border-line py-3">
                  <dt className="text-sm wrap-anywhere text-ink-600">
                    <span {...data}>{r.label}</span>
                    {hint && <span className="mt-1 block text-xs leading-snug text-ink-400">{hint}</span>}
                  </dt>
                  {/* An inline isolate keeps "3000 Templates" in order on Arabic pages (G4). */}
                  <dd className="mt-1 font-medium wrap-anywhere text-ink tabular-nums">
                    <span {...data}>{r.value}</span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}
