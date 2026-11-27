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
    <div role="group" aria-label={label} className="sel-picks">
      <p aria-hidden="true" className="sel-picks-label">
        {label}
      </p>
      <ul className="sel-chips">
        {picks.map((p) => (
          <li key={p.id} className="shrink-0">
            <button type="button" aria-pressed={p.pressed} onClick={() => onPick(p.id)} className="sel-chip">
              {p.label}
              <span className="sel-chip-count">{p.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
