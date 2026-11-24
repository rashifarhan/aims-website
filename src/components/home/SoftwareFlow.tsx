import type { CSSProperties } from "react";
import Image from "next/image";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { productBySlug, softwareBySlug } from "@/content/catalogue";
import type { Product } from "@/content/schema";
import type { BuiltSoftware } from "@/lib/software";
import {
  FLOW_OUTPUTS,
  FLOW_SOFTWARE,
  FLOW_TERMINALS,
  type FlowOutput,
  outputSoftware,
  rowCentre,
  softwareOutputs,
  terminalSoftware,
} from "@/lib/softwareFlow";

type Node = { key: string; sw: readonly BuiltSoftware[] };
type Line = { from: number; to: number; sw: BuiltSoftware; dashed?: boolean };

/**
 * One column of lines, drawn in a 100×100 box stretched over the gap between two node columns. Every column has the
 * same height and equal rows (sections.css), so a line at rowCentre lands on its node at any width.
 */
function Lines({ links, from, to, column }: { links: Line[]; from: number; to: number; column: string }) {
  return (
    <svg className={`sw-flow-lines ${column}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {links.map((l) => {
        const y1 = rowCentre(l.from, from) * 100;
        const y2 = rowCentre(l.to, to) * 100;
        return (
          <path
            key={`${l.from}-${l.to}`}
            data-sw={l.sw}
            d={`M0 ${y1} C50 ${y1} 50 ${y2} 100 ${y2}`}
            className={l.dashed ? "sw-flow-line sw-flow-dashed" : "sw-flow-line"}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

/**
 * The home software section's visual (client request, 24 Nov 2026): real AIMS terminals → the three platforms → what
 * the visitor gets, every line from AIMS's own data (lib/softwareFlow). Static by CLAUDE.md §3: the home page already
 * deals its two moments (door kit, reach map). One role="img" with a sentence per platform is its text alternative.
 */
export async function SoftwareFlow() {
  const t = await getDictionary();
  const locale = await getLocale();
  const f = t.home.software.flow;
  const list = new Intl.ListFormat(locale, { type: "conjunction" });
  const terminals = FLOW_TERMINALS.map(productBySlug).filter((p): p is Product => Boolean(p));
  const software = FLOW_SOFTWARE.map((slug) => ({ slug, name: softwareBySlug(slug)?.name ?? slug }));

  // BioTime Cloud is named by no AIMS product page, so its records come from "attendance terminals" in general, on a
  // dashed line that asks the buyer to confirm their model (as the BioTime Cloud page does; CLAUDE.md §1).
  const left: Node[] = [
    { key: "any", sw: ["biotimecloud"] },
    ...terminals.map((p) => ({ key: p.slug, sw: terminalSoftware(p) })),
  ];
  const right: { key: FlowOutput; sw: BuiltSoftware[] }[] = FLOW_OUTPUTS.map((o) => ({
    key: o.key,
    sw: outputSoftware(o.key),
  }));
  const toSoftware = (nodes: Node[]): Line[] =>
    nodes.flatMap((n, i) =>
      n.sw.map((sw) => ({ from: i, to: FLOW_SOFTWARE.indexOf(sw), sw, dashed: n.key === "any" })),
    );
  const fromSoftware = right.flatMap((n, i) => n.sw.map((sw) => ({ from: FLOW_SOFTWARE.indexOf(sw), to: i, sw })));

  const label = fmt(f.label, {
    items: software
      .map(({ slug, name }) => {
        const inputs = left.filter((n) => n.sw.includes(slug));
        const names = inputs.map((n) => (n.key === "any" ? f.anyTerminalAlt : (productBySlug(n.key)?.model ?? n.key)));
        const outputs = softwareOutputs(slug).map((o) => f.outputs[o]);
        return fmt(f.item, { name, inputs: list.format(names), outputs: list.format(outputs) });
      })
      .join(" "),
  });

  return (
    <div className="sw-flow" role="img" aria-label={label}>
      <p className="sw-flow-caption sw-flow-c1">{f.columns.terminals}</p>
      <div className="sw-flow-col sw-flow-c1" style={{ "--rows": left.length } as CSSProperties}>
        <div className="sw-flow-terminal" data-sw="biotimecloud">
          <span className="sw-flow-any">
            {f.anyTerminal}
            <span className="sw-flow-confirm">{f.confirm}</span>
          </span>
        </div>
        {terminals.map((p) => (
          <div key={p.slug} className="sw-flow-terminal" data-sw={terminalSoftware(p).join(" ")}>
            <span className="sw-flow-photo">
              {p.images[0] && (
                <Image
                  src={p.images[0].src}
                  alt=""
                  width={p.images[0].width}
                  height={p.images[0].height}
                  sizes="64px"
                />
              )}
            </span>
            <span className="sw-flow-code" dir="ltr" translate="no">
              {p.model}
            </span>
          </div>
        ))}
      </div>
      <Lines links={toSoftware(left)} from={left.length} to={software.length} column="sw-flow-c2" />
      <p className="sw-flow-caption sw-flow-c3">{f.columns.software}</p>
      <div className="sw-flow-col sw-flow-c3" style={{ "--rows": software.length } as CSSProperties}>
        {software.map(({ slug, name }) => (
          <div key={slug} className="sw-flow-software" data-sw={slug} data-sw-key={slug}>
            <span className="sw-flow-name" dir="ltr" translate="no">
              {name}
            </span>
          </div>
        ))}
      </div>
      <Lines links={fromSoftware} from={software.length} to={right.length} column="sw-flow-c4" />
      <p className="sw-flow-caption sw-flow-c5">{f.columns.outputs}</p>
      <div className="sw-flow-col sw-flow-c5" style={{ "--rows": right.length } as CSSProperties}>
        {right.map((o) => (
          <div key={o.key} className="sw-flow-output" data-sw={o.sw.join(" ")}>
            <span>{f.outputs[o.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
