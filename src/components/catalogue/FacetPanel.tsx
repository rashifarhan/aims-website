"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

export type FacetOption = { value: string; label: string; count: number; checked: boolean };
export type FacetGroupView = { id: string; legend: string; options: FacetOption[]; defaultOpen: boolean };

type Props = {
  groups: FacetGroupView[];
  onToggle: (groupId: string, value: string) => void;
  idPrefix: string;
};

/**
 * Facet groups as collapsible fieldsets of checkboxes with counts (Design Doc 9). Each group is a native
 * <details>, so it works without JavaScript; the groups' `defaultOpen` says where it starts. Once the buyer
 * opens or closes a group their choice holds, even as selecting an option changes its default.
 * Options with no matches are hidden unless already selected, so a click never leads to an empty list.
 */
export function FacetPanel({ groups, onToggle, idPrefix }: Props) {
  const [chosen, setChosen] = useState<Record<string, boolean>>({});
  return (
    <div>
      {groups.map((g) => (
        <details
          key={g.id}
          open={chosen[g.id] ?? g.defaultOpen}
          onToggle={(e) => {
            const open = e.currentTarget.open;
            setChosen((c) => (c[g.id] === open ? c : { ...c, [g.id]: open }));
          }}
          className="group border-b border-line last:border-b-0"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-sm text-sm font-semibold text-ink marker:content-none hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700 [&::-webkit-details-marker]:hidden">
            {g.legend}
            <ChevronDownIcon width="16" height="16" className="shrink-0 text-ink-600 group-open:rotate-180" />
          </summary>
          <fieldset className="pb-3">
            <legend className="sr-only">{g.legend}</legend>
            <ul className="space-y-0.5">
              {g.options.map((o) => {
                const id = `${idPrefix}-${g.id}-${o.value}`;
                return (
                  <li key={o.value}>
                    <label
                      htmlFor={id}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-1 text-menu text-ink-700 hover:bg-paper-2"
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
        </details>
      ))}
    </div>
  );
}
