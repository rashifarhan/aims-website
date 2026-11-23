/** Door-kit line weights; site-plan.css keeps every stroke non-scaling so lines stay crisp at 390px. */
const WALL = { fill: "none", strokeWidth: 1.8 } as const;
const THIN = { fill: "none", strokeWidth: 1.2 } as const;

const BAYS = [48, 96, 144, 192, 240, 288];

/**
 * The still part of the hub's site plan, top-down in an 800 × 500 viewBox: the fence and its gate, a car
 * park, and one building with an office, a shop counter, a main door and a staff entry. Generic shapes
 * only; no real site, model or measurement is drawn (CLAUDE.md §1).
 */
export function SitePlanGround() {
  return (
    <g>
      <rect width="800" height="500" className="fill-paper-2" />
      {/* Fence, open at the gate. */}
      <path d="M96 476H24V24H776V476H320" className="stroke-line-strong" strokeDasharray="3 6" {...THIN} />

      {/* Car park: two rows of bays. */}
      <g className="stroke-line-strong" {...THIN}>
        {BAYS.map((x) => (
          <path key={x} d={`M${x} 44v70M${x} 170v70`} />
        ))}
        <path d="M48 44H288M48 240H288" />
      </g>

      {/* Gate: a pedestrian turnstile lane beside a vehicle lane with its boom. */}
      <g className="stroke-ink" {...THIN}>
        <rect x="100" y="448" width="10" height="26" rx="2" className="fill-paper" />
        <rect x="138" y="448" width="10" height="26" rx="2" className="fill-paper" />
        <path d="M124 461l-10-6M124 461l10-6M124 461v11" />
        <rect x="300" y="446" width="14" height="26" rx="2" className="fill-paper" />
        <rect x="168" y="455" width="132" height="7" rx="3.5" className="fill-paper" />
      </g>

      {/* Building, with gaps for the main door, the staff entry and the shop door. */}
      <rect x="360" y="56" width="392" height="340" className="fill-paper" />
      <g className="stroke-ink">
        <path d="M450 396H360V56H752V90M752 140V396H730M690 396H500" {...WALL} />
        {/* Office, its door at the bottom; the shop, open to the corridor. */}
        <path d="M520 56V200H440M400 200H360" {...WALL} />
        <path d="M600 396V340M600 300V240H752" {...WALL} />
      </g>
      <g className="stroke-line-strong" {...THIN}>
        {/* Door leaves and their swings. */}
        <path d="M400 200V160A40 40 0 0 1 440 200" />
        <path d="M450 396V371A25 25 0 0 1 475 396M500 396V371A25 25 0 0 0 475 396" />
        <path d="M752 90H702A50 50 0 0 0 752 140" />
      </g>
      <g className="stroke-ink" {...THIN}>
        {/* The shop counter, the reader beside the main door and the terminal by the staff entry. */}
        <rect x="638" y="274" width="84" height="24" rx="3" className="fill-paper-3" />
        <rect x="506" y="402" width="9" height="13" rx="2" className="fill-paper" />
        <rect x="741" y="148" width="8" height="15" rx="2" className="fill-paper" />
      </g>
    </g>
  );
}
