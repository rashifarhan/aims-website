"use client";

import type { RefObject } from "react";
import { CloseIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { FacetPanel, type FacetGroupView } from "./FacetPanel";

type Props = {
  sheetRef: RefObject<HTMLDialogElement | null>;
  groups: FacetGroupView[];
  resultCount: number;
  t: Dictionary["catalogue"];
  onToggle: (groupId: string, value: string) => void;
  onClear: () => void;
};

/**
 * Mobile filter sheet (Design Doc 9 Facet panel · filter sheet): a native modal <dialog>, so focus is
 * trapped, Esc closes it and focus returns to the "Filters" button. Filters apply live.
 */
export function FilterSheet({ sheetRef, groups, resultCount, t, onToggle, onClear }: Props) {
  const close = () => sheetRef.current?.close();
  return (
    <dialog
      ref={sheetRef}
      aria-label={t.filters}
      onClick={(e) => e.target === sheetRef.current && close()}
      className="mt-auto mb-0 max-h-[85dvh] w-full max-w-none rounded-t-lg bg-paper p-0 text-ink backdrop:bg-ink/40 lg:hidden"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <h2 className="text-base font-semibold">{t.filters}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={t.closeFilters}
            className="grid size-11 place-items-center rounded-md"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <FacetPanel groups={groups} onToggle={onToggle} idPrefix="sheet" />
        </div>
        <div className="flex gap-3 border-t border-line p-4">
          <button type="button" onClick={onClear} className="h-12 px-4 text-sm font-semibold text-ink-700">
            {t.clearAll}
          </button>
          <button
            type="button"
            onClick={close}
            className="h-12 flex-1 rounded-pill bg-green-700 font-semibold text-white"
          >
            {fmt(t.showResults, { count: resultCount })}
          </button>
        </div>
      </div>
    </dialog>
  );
}
