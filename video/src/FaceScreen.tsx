import { faceDots } from "./face";
import { C } from "./theme";

// The SpeedFace screen (px in the 362×776 cutout), shared by the journey film and the hero reel.
export const DEV_W = 362;
export const DEV_H = 776;
export const SCREEN = { x: 55, y: 155, w: 249, h: 443 };

/** The terminal's screen: a face of points condenses, a scan passes, the brackets lock and "Verified" lands. */
export function Screen(p: {
  dots: ReturnType<typeof faceDots>;
  cos: number;
  sin: number;
  gather: number;
  scanY: number;
  scanOn: number;
  verify: number;
  tick: number;
  label: number;
}) {
  const box = { x: 38, y: 70, w: 173, h: 250 };
  const sy = box.y + p.scanY * box.h;
  const inset = 14 * (1 - p.verify);
  const bc = p.verify > 0.5 ? C.lime : "rgba(233,242,236,0.75)";
  return (
    <div
      style={{
        position: "absolute",
        left: `${(SCREEN.x / DEV_W) * 100}%`,
        top: `${(SCREEN.y / DEV_H) * 100}%`,
        width: `${(SCREEN.w / DEV_W) * 100}%`,
        height: `${(SCREEN.h / DEV_H) * 100}%`,
        background: `radial-gradient(80% 60% at 50% 40%, #0d2617, #040a07)`,
        overflow: "hidden",
        borderRadius: 3,
      }}
    >
      <svg viewBox={`0 0 ${SCREEN.w} ${SCREEN.h}`} width="100%" height="100%">
        <text x="14" y="22" fill={C.nightMuted} fontFamily="Plex Mono" fontSize="9" letterSpacing="1">
          MAIN ENTRANCE
        </text>
        <circle cx="232" cy="19" r="3" fill={C.lime} opacity={0.6 + 0.4 * Math.sin(p.gather * 9)} />
        {p.dots.map((d, i) => {
          const x = d.x * p.cos + d.z * p.sin;
          const z = -d.x * p.sin + d.z * p.cos;
          const k = Math.min(1, Math.max(0, (p.gather - d.r * 0.5) / 0.5));
          const tx = 124 + x * 78;
          const ty = 196 - d.y * 108;
          const ox = 124 + (d.r - 0.5) * 420;
          const oy = 196 + ((d.r * 7.3) % 1 - 0.5) * 520;
          const px = ox + (tx - ox) * k;
          const py = oy + (ty - oy) * k;
          const scanned = p.scanOn > 0 && py < sy ? 1 : 0;
          const lit = Math.max(scanned * 0.85, p.verify);
          const band = Math.exp(-(((py - sy) / 7) ** 2)) * p.scanOn;
          const col = lit > 0.3 || band > 0.4 ? C.lime : "#7fc79a";
          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r={0.55 + d.s * 0.75 + band * 0.8}
              fill={band > 0.5 ? "#f4ffe8" : col}
              opacity={k * (0.25 + 0.75 * d.s * d.s) * (0.55 + 0.45 * (z + 1) * 0.5) + band * 0.5}
            />
          );
        })}
        {/* The scan line */}
        <rect x={box.x - 8} y={sy - 0.75} width={box.w + 16} height={1.5} fill={C.lime} opacity={p.scanOn} />
        <rect x={box.x - 8} y={sy - 10} width={box.w + 16} height={10} fill="url(#trail)" opacity={p.scanOn * 0.6} />
        <defs>
          <linearGradient id="trail" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={C.lime} stopOpacity="0.6" />
            <stop offset="1" stopColor={C.lime} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Brackets close in and turn lime on the match */}
        <path
          d={`M${box.x + inset} ${box.y + 26 + inset}V${box.y + inset}H${box.x + 26 + inset}M${box.x + box.w - 26 - inset} ${box.y + inset}H${box.x + box.w - inset}V${box.y + 26 + inset}M${box.x + box.w - inset} ${box.y + box.h - 26 - inset}V${box.y + box.h - inset}H${box.x + box.w - 26 - inset}M${box.x + 26 + inset} ${box.y + box.h - inset}H${box.x + inset}V${box.y + box.h - 26 - inset}`}
          fill="none"
          stroke={bc}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.3 + 0.7 * p.gather}
        />
        {/* The result */}
        <g opacity={p.label} transform={`translate(0 ${(1 - p.label) * 14})`}>
          <rect x="34" y="352" width="181" height="58" rx="14" fill="rgba(120,190,32,0.14)" stroke={C.lime} strokeWidth="1" />
          <circle cx="62" cy="381" r="13" fill={C.lime} />
          <path
            d="M55.5 381.5L60 386L68.5 377"
            fill="none"
            stroke={C.night900}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p.tick}
          />
          <text x="84" y="377" fill={C.nightText} fontFamily="Archivo" fontWeight="650" fontSize="14">
            Verified
          </text>
          <text x="84" y="395" fill={C.nightMuted} fontFamily="Plex Mono" fontSize="10">
            Check-in 08:57
          </text>
        </g>
      </svg>
    </div>
  );
}

