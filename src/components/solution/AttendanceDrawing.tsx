import type { Dictionary } from "@/i18n/dictionaries";

type Copy = Dictionary["solutionTimeAttendance"]["story"];

/** Illustrative rows only (labelled on the page); not AIMS or customer data. */
const ROWS = [
  ["08:02", "17:05", "9.0"],
  ["07:56", "16:58", "9.0"],
  ["08:11", "17:20", "9.2"],
  ["08:30", "13:30", "5.0"],
] as const;

/**
 * Design Doc 8.3, time attendance: punch dots flow from a terminal into BioTime, a timesheet
 * fills row by row, then compiles into a payroll file. Explainer line art per Design Doc 7.
 * Rendered as its finished frame on the kit page (every group shown).
 */
export function AttendanceDrawing({ copy }: { copy: Copy }) {
  return (
    // Anchors stay left-to-right in Arabic so labels keep their places; text still shapes RTL.
    <svg className="ta-drawing" viewBox="24 76 724 452" role="img" aria-label={copy.alt} direction="ltr">
      <rect x="24" y="76" width="724" height="452" rx="16" className="fill-paper-2" />

      {/* Terminal */}
      <g className="ta-s1">
        <rect x="52" y="140" width="132" height="250" rx="16" className="fill-ink" />
        <rect x="66" y="160" width="104" height="150" rx="6" className="fill-paper" />
        <circle cx="118" cy="214" r="20" className="ta-tick-bg fill-green-700" />
        <path
          d="m108 214 7 7 13-14"
          fill="none"
          className="stroke-paper"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="118" y="258" textAnchor="middle" className="ta-text-name">
          {copy.checked}
        </text>
        <text x="118" y="280" textAnchor="middle" className="ta-text-meta">
          08:02
        </text>
        <rect x="100" y="330" width="36" height="40" rx="8" className="fill-ink-700 stroke-ink-600" />
        <circle cx="118" cy="350" r="9" fill="none" className="stroke-line-strong" strokeWidth="1.5" />
        <text x="118" y="420" textAnchor="middle" className="ta-text-meta">
          {copy.terminal}
        </text>
      </g>

      {/* Wire and punches travelling to BioTime */}
      <g className="ta-s2">
        <path d="M184 266H304" className="ta-wire stroke-line-strong" strokeWidth="1.6" pathLength="1" />
        <g className="ta-dots">
          <circle cx="190" cy="266" r="5" className="fill-lime" />
          <circle cx="190" cy="266" r="5" className="fill-lime" />
          <circle cx="190" cy="266" r="5" className="fill-lime" />
        </g>
        <rect x="304" y="222" width="132" height="88" rx="12" className="fill-paper stroke-ink" strokeWidth="1.8" />
        <circle cx="332" cy="252" r="10" fill="none" className="stroke-green-700" strokeWidth="2" />
        <path d="M332 246v6l4 3" fill="none" className="stroke-green-700" strokeWidth="2" strokeLinecap="round" />
        <text x="352" y="257" className="ta-text-name">
          {copy.server}
        </text>
        <path d="M324 280h92M324 292h64" className="stroke-line-strong" strokeWidth="1.4" />
      </g>

      {/* Timesheet filling row by row */}
      <g className="ta-s3">
        <path d="M436 266H480" className="ta-wire stroke-line-strong" strokeWidth="1.6" pathLength="1" />
        <rect x="480" y="96" width="248" height="280" rx="12" className="fill-paper stroke-ink" strokeWidth="1.8" />
        <rect x="481" y="97" width="246" height="36" rx="11" className="fill-green-50" />
        {/* The rows are illustrative, so the sheet says so on its own title bar (CLAUDE.md §1),
            not in a caption under the picture (design skill house rule 1). */}
        <text x="496" y="121" className="ta-text-name">
          {copy.sheet}
          <tspan className="ta-text-meta"> · {copy.sample}</tspan>
        </text>
        <g className="ta-text-meta">
          <text x="496" y="160">
            {copy.name}
          </text>
          <text x="594" y="160">
            {copy.in}
          </text>
          <text x="644" y="160">
            {copy.out}
          </text>
          <text x="714" y="160" textAnchor="end">
            {copy.hours}
          </text>
        </g>
        <path d="M496 172h218" className="stroke-line" />
        {ROWS.map(([checkIn, checkOut, hours], i) => (
          <g key={copy.people[i]} className="ta-row">
            <text x="496" y={204 + 44 * i} className="ta-text-row">
              {copy.people[i]}
            </text>
            <g className="ta-text-row tabular-nums">
              <text x="594" y={204 + 44 * i}>
                {checkIn}
              </text>
              <text x="644" y={204 + 44 * i}>
                {checkOut}
              </text>
              <text x="714" y={204 + 44 * i} textAnchor="end">
                {hours}
              </text>
            </g>
            <path d={`M496 ${218 + 44 * i}h218`} className="stroke-line" />
          </g>
        ))}
      </g>

      {/* Compiled into a payroll file */}
      <g className="ta-s4">
        <path d="M604 376V418" className="ta-wire stroke-green-700" strokeWidth="1.8" pathLength="1" />
        <g className="ta-file">
          <path
            d="M578 420h40l18 18v70h-58Z"
            className="fill-paper stroke-ink"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M618 420v18h18" fill="none" className="stroke-ink" strokeWidth="1.8" strokeLinejoin="round" />
          <path
            d="M590 456h34M590 470h34M590 484h22"
            className="stroke-green-700"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text x="566" y="470" textAnchor="end" className="ta-text-name">
            {copy.file}
          </text>
        </g>
      </g>
    </svg>
  );
}
