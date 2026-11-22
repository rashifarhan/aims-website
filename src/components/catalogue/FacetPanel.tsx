"use client";

export type FacetOption = { value: string; label: string; count: number; checked: boolean };
export type FacetGroupView = { id: string; legend: string; options: FacetOption[] };

type Props = {
  groups: FacetGroupView[];
  onToggle: (groupId: string, value: string) => void;
  idPrefix: string;
};

/**
 * Facet groups as fieldsets of checkboxes with counts (Design Doc 9).
 * Options with no matches are hidden unless already selected, so a
 * click never leads to an empty list.
 */
export function FacetPanel({ groups, onToggle, idPrefix }: Props) {
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <fieldset key={g.id}>
          <legend className="mb-2 text-sm font-semibold text-ink">{g.legend}</legend>
          <ul className="space-y-0.5">
            {g.options.map((o) => {
              const id = `${idPrefix}-${g.id}-${o.value}`;
              return (
                <li key={o.value}>
                  <label
                    htmlFor={id}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-1 text-menu text-ink-700 hover:bg-paper-2 lg:min-h-9"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={o.checked}
                      onChange={() => onToggle(g.id, o.value)}
                      className="size-4.5 shrink-0 accent-green-700"
                    />
                    <span className="flex-1">{o.label}</span>
                    <span className="text-xs text-ink-600 tabular-nums">{o.count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}
