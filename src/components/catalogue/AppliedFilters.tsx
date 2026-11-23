"use client";

import { CloseIcon } from "@/components/icons";
import type { FacetGroupView } from "./FacetPanel";

type Props = {
  groups: FacetGroupView[];
  onToggle: (groupId: string, value: string) => void;
  onClear: () => void;
  labels: { clearFilters: string; clearAll: string };
};

/** Applied filters as removable chips on the one chip style (actions.css .ui-chip), then "Clear all". */
export function AppliedFilters({ groups, onToggle, onClear, labels }: Props) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {groups.flatMap((g) =>
        g.options
          .filter((o) => o.checked)
          .map((o) => (
            <li key={`${g.id}-${o.value}`}>
              <button type="button" onClick={() => onToggle(g.id, o.value)} className="ui-chip ui-chip-on">
                {o.label}
                <CloseIcon width={14} height={14} />
                <span className="sr-only">({labels.clearFilters})</span>
              </button>
            </li>
          )),
      )}
      <li>
        <button type="button" onClick={onClear} className="home-button home-button-quiet home-button-sm">
          {labels.clearAll}
        </button>
      </li>
    </ul>
  );
}
