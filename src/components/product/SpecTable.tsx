import type { SpecGroup } from "@/content/schema";
import { specHint, type SpecHints } from "@/content/glossary";

type Props = {
  groups: SpecGroup[];
  hints: SpecHints;
  /** Spread on English product data (label, value, caption): `{ lang: "en", dir: "ltr" }` on Arabic pages. */
  data: { lang?: string; dir?: "ltr" };
};

/**
 * Specifications exactly as AIMS publishes them (verbatim values), with a
 * plain-language hint in the page's language under labels buyers may not
 * know (review decision 3). Long unbroken values wrap inside their cell so
 * the table never widens the page at 390px (CLAUDE.md 4: reflow).
 */
export function SpecTable({ groups, hints, data }: Props) {
  return (
    <div className="min-w-0 space-y-8">
      {groups.map((g) => (
        <table key={g.title} className="w-full table-fixed border-collapse text-start text-menu">
          {groups.length > 1 && (
            <caption className="mb-2 text-start text-base font-semibold text-ink">
              <span {...data}>{g.title}</span>
            </caption>
          )}
          <tbody>
            {g.rows.map((r) => {
              const hint = specHint(r.label, hints);
              return (
                <tr key={r.label} className="border-b border-line align-top">
                  <th scope="row" className="w-2/5 py-3 pe-4 text-start font-normal wrap-anywhere text-ink-600">
                    <span {...data}>{r.label}</span>
                    {hint && <span className="mt-1 block text-xs leading-snug text-ink-400">{hint}</span>}
                  </th>
                  {/* An inline isolate keeps "3000 Templates" in order on Arabic pages (G4). */}
                  <td className="py-3 font-medium wrap-anywhere text-ink tabular-nums">
                    <span {...data}>{r.value}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </div>
  );
}
