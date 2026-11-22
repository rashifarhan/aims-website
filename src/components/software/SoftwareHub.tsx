/** Node centres in a 100 × 100 box, one per grid cell around the hub (corners of a 3 × 3 grid). */
const CORNERS = [
  { x: 17, y: 9.5 },
  { x: 83, y: 9.5 },
  { x: 17, y: 90.5 },
  { x: 83, y: 90.5 },
] as const;

type Props = { centre: string; nodes: string[]; label: string; mono?: boolean };

/**
 * The page's dealt moment (taste skill: one diagram card, a hub with branches; CLAUDE.md §3):
 * up to four terminals or ways in, each joined to the software at the centre. When the section
 * comes into view `MomentTrigger` sets `data-played` and the lines draw from each node to the hub
 * (stroke-dashoffset only), once. Without JS or with reduced motion it rests fully drawn.
 * The words are HTML, so they stay readable at 390; the lines are one SVG layer behind them.
 */
export function SoftwareHub({ centre, nodes, label, mono = false }: Props) {
  const shown = nodes.slice(0, CORNERS.length);
  // dir="ltr": the lines are drawn in physical coordinates, so the boxes must not mirror in RTL.
  return (
    <figure className="sw-hub" aria-label={label} dir="ltr">
      <svg className="sw-hub-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {shown.map((node, i) => {
          const from = CORNERS[i];
          // A soft S-curve: leave the node vertically, arrive at the hub's centre.
          const d = `M${from.x} ${from.y} C${from.x} 50 50 ${from.y} 50 50`;
          return <path key={node} d={d} pathLength={1} className="sw-hub-line" />;
        })}
      </svg>
      <ol className="sw-hub-nodes" aria-hidden="true">
        {shown.map((node) => (
          <li key={node} className="sw-hub-node">
            <span className={mono ? "font-mono" : undefined}>{node}</span>
          </li>
        ))}
      </ol>
      <p className="sw-hub-centre" aria-hidden="true">
        {centre}
      </p>
    </figure>
  );
}
