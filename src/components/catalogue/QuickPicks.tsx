"use client";

export type QuickPickView = { id: string; label: string; count: number; pressed: boolean };

type Props = { label: string; picks: QuickPickView[]; onPick: (id: string) => void };

/**
 * "Popular" (design note): one row of one-click filter presets with live counts. Chips are toggle buttons
 * (`aria-pressed`, Design Doc 9 Chip). The row scrolls inside itself on a phone; the page never scrolls sideways.
 */
export function QuickPicks({ label, picks, onPick }: Props) {
  if (!picks.length) return null;
  return (
    <div role="group" aria-label={label} className="mt-6 flex items-center gap-3">
      <p aria-hidden="true" className="shrink-0 text-sm font-medium text-ink-700">
        {label}
      </p>
      <ul className="-m-1 flex min-w-0 gap-2 overflow-x-auto p-1">
        {picks.map((p) => (
          <li key={p.id} className="shrink-0">
            <button
              type="button"
              aria-pressed={p.pressed}
              onClick={() => onPick(p.id)}
              // The one chip (actions.css .ui-chip), like the applied filters and the pagination below it.
              className={`ui-chip gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${p.pressed ? "ui-chip-on font-semibold" : ""}`}
            >
              {p.label}
              <span className="text-xs text-ink-600 tabular-nums">{p.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
