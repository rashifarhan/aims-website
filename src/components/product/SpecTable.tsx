import type { SpecGroup } from "@/content/schema";
import { specHint } from "@/content/glossary";

/**
 * Specifications exactly as AIMS publishes them (verbatim values), with a
 * plain-language hint under labels buyers may not know (review decision 3).
 */
export function SpecTable({ groups, lang }: { groups: SpecGroup[]; lang?: string }) {
  return (
    <div className="space-y-8" lang={lang}>
      {groups.map((g) => (
        <table key={g.title} className="w-full border-collapse text-start text-menu">
          {groups.length > 1 && (
            <caption className="mb-2 text-start text-base font-semibold text-ink">{g.title}</caption>
          )}
          <tbody>
            {g.rows.map((r) => {
              const hint = specHint(r.label);
              return (
                <tr key={r.label} className="border-b border-line align-top">
                  <th scope="row" className="w-2/5 py-3 pe-4 text-start font-normal text-ink-600">
                    {r.label}
                    {hint && <span className="mt-1 block text-xs leading-snug text-ink-400">{hint}</span>}
                  </th>
                  <td className="py-3 font-medium text-ink">{r.value}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </div>
  );
}
