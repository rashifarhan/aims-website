import type { CSSProperties, ReactNode } from "react";

export type SignalNode = { key: string; content: ReactNode };

type Props = {
  /** The platform's name, drawn as the source node. */
  source: string;
  nodes: SignalNode[];
  /** "card": terminal cards (136px rows); "chip": short labels (56px rows). Kept in step with software.css. */
  size: "card" | "chip";
  /** Names the list for screen readers: the platform and what it reaches. */
  label: string;
};

/**
 * Geometry in CSS pixels, as in the product page's ConnectsDiagram: every row has one fixed height
 * (equal rows via auto-rows-fr) and the line column is 128px wide on desktop, 40px on a phone, so the
 * viewBox matches the drawn size and pathLength dashes draw every line whole. If a row grows (zoom, a
 * wrapped stepper), all rows grow alike and the stretched viewBox still lands each line on its row.
 */
const ROW = { card: 136, chip: 56 } as const;
const WIDTH = { desktop: 128, phone: 40 } as const;

/**
 * Signature SIGNAL on a software page (Design Doc 8.1, ported from the hero's signal lines): lines draw
 * once from the platform to what its own data lists, when the diagram enters view (MomentTrigger on the
 * page sets data-played), then a dot lands on each destination. Desktop fans out from the source; at
 * 390px the source sits on top and a trunk branches down. The nodes are never hidden: under reduced
 * motion or without JS the diagram simply rests drawn. Timing lives in software.css.
 */
export function SoftwareSignal({ source, nodes, size, label }: Props) {
  if (nodes.length === 0) return null;
  const row = ROW[size];
  const height = nodes.length * row;
  const mid = height / 2;
  const yOf = (i: number) => i * row + row / 2;

  return (
    <div
      data-moment
      className={`sw-signal sw-signal-${size} grid grid-cols-[2.5rem_minmax(0,1fr)] md:grid-cols-[auto_8rem_minmax(0,1fr)]`}
    >
      <div className="col-span-2 mb-2 md:col-span-1 md:mb-0 md:self-center">
        {/* The section heading already names the platform; this is the drawing's source node. */}
        <span aria-hidden="true" dir="ltr" translate="no" className="sw-signal-source">
          {source}
        </span>
      </div>
      {[false, true].map((desktop) => (
        <svg
          key={String(desktop)}
          className={`sw-signal-lines h-full w-full overflow-visible text-green-700 rtl:-scale-x-100 ${desktop ? "hidden md:block" : "md:hidden"}`}
          viewBox={`0 0 ${desktop ? WIDTH.desktop : WIDTH.phone} ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {nodes.map((n, i) => (
            <path
              key={n.key}
              className="sw-signal-line"
              style={{ "--i": i } as CSSProperties}
              d={
                desktop
                  ? `M0 ${mid} C70 ${mid} 58 ${yOf(i)} 128 ${yOf(i)}`
                  : `M16 0 V${yOf(i) - 10} Q16 ${yOf(i)} 26 ${yOf(i)} H40`
              }
              pathLength={1}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            />
          ))}
        </svg>
      ))}
      <ul aria-label={label} className="grid auto-rows-fr">
        {nodes.map((n, i) => (
          <li key={n.key} className="sw-signal-node" style={{ "--i": i } as CSSProperties}>
            {n.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
