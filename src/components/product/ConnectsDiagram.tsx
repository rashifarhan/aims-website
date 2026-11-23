import type { CSSProperties } from "react";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import type { Product } from "@/content/schema";
import type { DataAttrs } from "./englishData";
import { ModelChip } from "./ModelChip";
import { MIN_CONNECTS_NODES, nodeCount, type Connections } from "./connects";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Row = { kind: "head"; text: string } | { kind: "node"; text: string; english: boolean; n: number };

type Props = {
  model: string;
  connections: Connections;
  connLabels: Record<Product["connectivity"][number], string>;
  labels: { title: string; lead: string; links: string; door: string };
  data: DataAttrs;
};

/**
 * Geometry in CSS pixels: each list row is 48px (min-h-12, equal rows via auto-rows-fr) and the line column
 * is 240px wide on desktop (the diagram has its own screen, so the lines get room), 40px on a phone, so the viewBox matches the drawn size and dashes measured by
 * pathLength draw every line whole. (A non-scaling stroke on a stretched viewBox left long lines half-drawn.)
 */
const ROW = 48;
const WIDTH = { desktop: 240, phone: 40 } as const;
/** The desktop curve's control points, as fractions of its width (the original 70 and 58 of 128). */
const CURVE = { out: 0.55, in: 0.45 } as const;

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
export function ConnectsDiagram({ model, connections, connLabels, labels, data }: Props) {
  if (nodeCount(connections) < MIN_CONNECTS_NODES) return null;
  const rows = toRows(connections, connLabels, labels);
  const height = rows.length * ROW;
  const mid = height / 2;
  const ys = rows.flatMap((r, i) => (r.kind === "node" ? [{ y: i * ROW + ROW / 2, n: r.n }] : []));
  const svg = "connects-lines h-full w-full overflow-visible rtl:-scale-x-100";
  const w = WIDTH.desktop;

  // Its own screen on night green (Design Doc 10, T5; taste: one contrasting ground): the heading runs full
  // width above the diagram, which stands centred in its frame. Only the frame changed; the motion is as was.
  return (
    <Section ground="night" labelledBy="connects">
      <SectionHeader id="connects" title={labels.title} lead={labels.lead} />
      <div className="connects-frame">
        <div
          data-moment
          className="connects grid grid-cols-[2.5rem_minmax(0,1fr)] md:grid-cols-[auto_15rem_minmax(0,1fr)]"
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
                  d={
                    desktop
                      ? `M0 ${mid} C${w * CURVE.out} ${mid} ${w * CURVE.in} ${y} ${w} ${y}`
                      : `M16 0 V${y - 10} Q16 ${y} 26 ${y} H40`
                  }
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
                <dt key={`h${i}`} className="connects-head flex items-end pb-1 text-caption font-semibold">
                  {r.text}
                </dt>
              ) : (
                <dd key={`n${r.n}`} className="flex min-h-12 items-center py-1">
                  <span
                    className="connects-node inline-flex max-w-full items-center gap-2 rounded-pill border px-3.5 py-1.5 text-sm font-medium wrap-anywhere"
                    style={{ "--i": r.n } as CSSProperties}
                    {...(r.english ? data : {})}
                  >
                    <span aria-hidden="true" className="connects-dot connects-status size-1.5 shrink-0 rounded-full" />
                    {r.text}
                  </span>
                </dd>
              ),
            )}
          </dl>
          <MomentTrigger />
        </div>
      </div>
    </Section>
  );
}
