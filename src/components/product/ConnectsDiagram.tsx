import type { CSSProperties } from "react";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import type { Product } from "@/content/schema";
import type { DataAttrs } from "./englishData";
import { ModelChip } from "./ModelChip";
import { MIN_CONNECTS_NODES, nodeCount, type Connections } from "./connects";

type Row = { kind: "head"; text: string } | { kind: "node"; text: string; english: boolean; n: number };

type Props = {
  model: string;
  connections: Connections;
  connLabels: Record<Product["connectivity"][number], string>;
  labels: { title: string; lead: string; links: string; door: string };
  /** The page's shared section grid (heading column beside content from 1024px). */
  sectionClass: string;
  data: DataAttrs;
};

/**
 * Geometry in CSS pixels: each list row is 48px (min-h-12, equal rows via auto-rows-fr) and the line column
 * is 128px wide on desktop, 40px on a phone, so the viewBox matches the drawn size and dashes measured by
 * pathLength draw every line whole. (A non-scaling stroke on a stretched viewBox left long lines half-drawn.)
 */
const ROW = 48;
const WIDTH = { desktop: 128, phone: 40 } as const;

function toRows({ links, door }: Connections, conn: Props["connLabels"], labels: Props["labels"]): Row[] {
  const rows: Row[] = [];
  let n = 0;
  if (links.length) rows.push({ kind: "head", text: labels.links });
  for (const l of links) rows.push({ kind: "node", text: conn[l], english: false, n: n++ });
  if (door.length) rows.push({ kind: "head", text: labels.door });
  for (const d of door) rows.push({ kind: "node", text: d, english: true, n: n++ });
  return rows;
}

/**
 * Signature SIGNAL on the product page (Design Doc 8.1, ported from the hero's signal lines): lines draw
 * once from the model code to what this product's own data lists, when the section enters view
 * (MomentTrigger). Desktop fans out from the chip; at 390px the chip sits on top and a trunk branches down.
 * Under reduced motion or without JS everything rests drawn. Timing lives in product.css.
 */
export function ConnectsDiagram({ model, connections, connLabels, labels, sectionClass, data }: Props) {
  if (nodeCount(connections) < MIN_CONNECTS_NODES) return null;
  const rows = toRows(connections, connLabels, labels);
  const height = rows.length * ROW;
  const mid = height / 2;
  const ys = rows.flatMap((r, i) => (r.kind === "node" ? [{ y: i * ROW + ROW / 2, n: r.n }] : []));
  const svg = "connects-lines h-full w-full overflow-visible text-green-700 rtl:-scale-x-100";

  return (
    <section aria-labelledby="connects" className={sectionClass}>
      <div>
        <h2 id="connects" className="text-2xl font-bold tracking-tight">
          {labels.title}
        </h2>
        <p className="mt-2 text-sm text-ink-600">{labels.lead}</p>
      </div>
      <div
        data-moment
        className="connects grid grid-cols-[2.5rem_minmax(0,1fr)] md:grid-cols-[auto_8rem_minmax(0,1fr)]"
      >
        <div className="col-span-2 md:col-span-1 md:self-center">
          <ModelChip model={model} size="lg" />
        </div>
        {[false, true].map((desktop) => (
          <svg
            key={String(desktop)}
            className={`${svg} ${desktop ? "hidden md:block" : "md:hidden"}`}
            viewBox={`0 0 ${desktop ? WIDTH.desktop : WIDTH.phone} ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {ys.map(({ y, n }) => (
              <path
                key={n}
                className="connects-line"
                style={{ "--i": n } as CSSProperties}
                d={desktop ? `M0 ${mid} C70 ${mid} 58 ${y} 128 ${y}` : `M16 0 V${y - 10} Q16 ${y} 26 ${y} H40`}
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
            ))}
          </svg>
        ))}
        <dl className="grid auto-rows-fr">
          {rows.map((r, i) =>
            r.kind === "head" ? (
              <dt key={`h${i}`} className="flex items-end pb-1 text-caption font-semibold text-ink-600">
                {r.text}
              </dt>
            ) : (
              <dd key={`n${r.n}`} className="flex min-h-12 items-center py-1">
                <span
                  className="connects-node inline-flex max-w-full items-center gap-2 rounded-pill border border-line bg-paper px-3.5 py-1.5 text-sm font-medium wrap-anywhere text-ink"
                  style={{ "--i": r.n } as CSSProperties}
                  {...(r.english ? data : {})}
                >
                  <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-green-700" />
                  {r.text}
                </span>
              </dd>
            ),
          )}
        </dl>
        <MomentTrigger />
      </div>
    </section>
  );
}
