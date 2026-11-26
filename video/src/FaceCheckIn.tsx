import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useMemo } from "react";
import { C, fontCss } from "./theme";
import { faceDots } from "./face";

/**
 * Journey step "Face recognition attendance": AIMS's own SpeedFace photograph on a night stage. The camera drifts in,
 * light sweeps the hardware, a face condenses on the screen and is scanned, it verifies, and a thread of light carries
 * the check-in to the attendance log, where the new row lands. 6 s, fades from and to night so it loops cleanly.
 */
const out = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const r = (f: number, a: number, b: number, from = 0, to = 1, easing = out) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

// The device, and where its screen sits in the cutout (px in the 362×776 photo).
const DEV_W = 362;
const DEV_H = 776;
const SCREEN = { x: 55, y: 155, w: 249, h: 443 };
const SCALE = 1.08;

export const FaceCheckIn = () => {
  const f = useCurrentFrame();
  const dots = useMemo(() => faceDots(1500), []);
  const dust = useMemo(() => {
    let s = 3;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), z: rnd(), p: rnd() }));
  }, []);

  const fade = Math.max(r(f, 0, 22, 1, 0, inOut), r(f, 162, 180, 0, 1, inOut));
  const push = r(f, 0, 180, 1, 1.06, inOut);
  const turn = r(f, 0, 180, -26, -12, inOut);
  const float = Math.sin(f / 26) * 5;

  // Screen story.
  const gather = r(f, 14, 62);
  const scanY = r(f, 52, 92, -0.05, 1.05, inOut); // 0 top … 1 bottom of the face box
  const scanOn = r(f, 50, 56) * (1 - r(f, 90, 96));
  const verify = r(f, 90, 102);
  const tick = r(f, 96, 112);
  const label = r(f, 100, 116);
  const sweep = r(f, 8, 74, -0.6, 1.6, inOut);
  const sweep2 = r(f, 118, 170, -0.6, 1.6, inOut);

  // Thread and log.
  const panel = r(f, 96, 124);
  const thread = r(f, 104, 140, 0, 1, inOut);
  const row = r(f, 136, 154);
  const flash = r(f, 136, 146) * (1 - r(f, 150, 176));
  const present = f >= 146 ? 48 : 47;

  const faceRot = Math.sin(f / 40) * 0.18 - 0.1;
  const cos = Math.cos(faceRot);
  const sin = Math.sin(faceRot);

  return (
    <AbsoluteFill style={{ background: C.night950, fontFamily: "Inter", overflow: "hidden" }}>
      <style>{fontCss}</style>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* The stage: a green light pooled behind the device, a floor that recedes, drifting dust. */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(38% 52% at 34% 46%, rgba(120,190,32,0.16), rgba(38,112,58,0.18) 40%, transparent 72%), radial-gradient(60% 50% at 75% 60%, rgba(38,112,58,0.16), transparent 70%), ${C.night950}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -400,
            right: -400,
            top: 760,
            height: 900,
            transformOrigin: "50% 0",
            transform: "perspective(900px) rotateX(72deg)",
            backgroundImage: `linear-gradient(${C.nightLine} 1px, transparent 1px), linear-gradient(90deg, ${C.nightLine} 1px, transparent 1px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: `0 ${f * 0.6}px`,
            opacity: 0.55,
            maskImage: "linear-gradient(to bottom, black, transparent 70%)",
          }}
        />
        {dust.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(d.x * 100 + f * 0.02 * (d.z + 0.3)) % 100}%`,
              top: `${(d.y * 100 - f * 0.05 * (d.z + 0.2) + 100) % 100}%`,
              width: 2 + d.z * 3,
              height: 2 + d.z * 3,
              borderRadius: 99,
              background: C.lime,
              opacity: (0.08 + d.z * 0.25) * (0.6 + 0.4 * Math.sin(f / 18 + d.p * 6)),
              filter: `blur(${(1 - d.z) * 1.5}px)`,
            }}
          />
        ))}

        {/* The device in 3D, with its floor reflection. */}
        <div style={{ position: "absolute", left: 640 - (DEV_W * SCALE) / 2, top: 92 + float, perspective: 2200 }}>
          <div
            style={{
              width: DEV_W * SCALE,
              height: DEV_H * SCALE,
              transformStyle: "preserve-3d",
              transform: `rotateY(${turn}deg) rotateX(2deg)`,
              position: "relative",
            }}
          >
            <Img
              src={staticFile("img/speedface-cut.png")}
              style={{ width: "100%", height: "100%", filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.6))" }}
            />
            <Screen
              dots={dots}
              cos={cos}
              sin={sin}
              gather={gather}
              scanY={scanY}
              scanOn={scanOn}
              verify={verify}
              tick={tick}
              label={label}
            />
            {/* Light raking across the glass and metal, masked to the device. */}
            {[sweep, sweep2].map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  maskImage: `url(${staticFile("img/speedface-cut.png")})`,
                  maskSize: "100% 100%",
                  background: `linear-gradient(105deg, transparent ${s * 100 - 18}%, rgba(255,255,255,${i ? 0.18 : 0.32}) ${s * 100}%, transparent ${s * 100 + 18}%)`,
                  mixBlendMode: "screen",
                }}
              />
            ))}
            <Img
              src={staticFile("img/speedface-cut.png")}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                height: "100%",
                transform: "scaleY(-1)",
                opacity: 0.16,
                maskImage: "linear-gradient(to top, black, transparent 35%)",
              }}
            />
          </div>
        </div>

        <Thread t={thread} />

        <Log panel={panel} row={row} flash={flash} present={present} />
      </AbsoluteFill>

      {/* Film finish: vignette and a fine grain. */}
      <AbsoluteFill
        style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55))" }}
      />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="n">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6} />
          </filter>
          <rect width="100%" height="100%" filter="url(#n)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.night950, opacity: fade }} />
    </AbsoluteFill>
  );
};

function Screen(p: {
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

/** The check-in travelling from the terminal to the log: a lime thread with a bright head. */
function Thread({ t }: { t: number }) {
  const P0 = [812, 520];
  const P1 = [930, 520];
  const P2 = [980, 420];
  const P3 = [1112, 420];
  const bez = (u: number, i: number) =>
    (1 - u) ** 3 * P0[i] + 3 * (1 - u) ** 2 * u * P1[i] + 3 * (1 - u) * u * u * P2[i] + u ** 3 * P3[i];
  const d = `M${P0}C${P1} ${P2} ${P3}`;
  const hx = bez(t, 0);
  const hy = bez(t, 1);
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke={C.nightLine} strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" opacity={t > 0 ? 0.9 : 0} />
      <path d={d} fill="none" stroke={C.lime} strokeWidth="6" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} filter="url(#glow)" opacity="0.8" />
      <path d={d} fill="none" stroke={C.lime} strokeWidth="2.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} strokeLinecap="round" />
      {t > 0 && t < 1 && (
        <>
          <circle cx={hx} cy={hy} r="16" fill={C.lime} opacity="0.35" filter="url(#glow)" />
          <circle cx={hx} cy={hy} r="5" fill="#f4ffe8" />
        </>
      )}
    </svg>
  );
}

const ROWS = [
  ["08:53", "EMP-0096", "Check-in"],
  ["08:49", "EMP-0127", "Check-in"],
  ["08:41", "EMP-0118", "Check-in"],
];

/** The attendance log, a glass panel angled towards the terminal; the new check-in lands on top. */
function Log({ panel, row, flash, present }: { panel: number; row: number; flash: number; present: number }) {
  const rowH = 64;
  return (
    <div style={{ position: "absolute", left: 1112, top: 300, perspective: 1800 }}>
      <div
        style={{
          width: 640,
          padding: "30px 32px 28px",
          borderRadius: 28,
          background: "linear-gradient(160deg, rgba(30,58,46,0.78), rgba(15,31,23,0.82))",
          border: `1px solid ${C.nightLine}`,
          boxShadow: "0 50px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(233,242,236,0.08)",
          backdropFilter: "blur(14px)",
          opacity: panel,
          transform: `translateX(${(1 - panel) * 60}px) rotateY(${-16 + 4 * panel}deg)`,
          transformOrigin: "0 50%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: C.nightText, fontFamily: "Archivo", fontWeight: 650, fontStretch: "112%", fontSize: 28, letterSpacing: "-0.02em" }}>
              Attendance
            </div>
            <div style={{ color: C.nightMuted, fontSize: 16, marginTop: 4 }}>Today · Main entrance</div>
          </div>
          <div style={{ textAlign: "end" }}>
            <div style={{ color: C.nightText, fontFamily: "Archivo", fontWeight: 650, fontSize: 34, fontVariantNumeric: "tabular-nums" }}>
              {present}
            </div>
            <div style={{ color: C.nightMuted, fontSize: 14 }}>present</div>
          </div>
        </div>
        <div style={{ height: 1, background: C.nightLine, margin: "22px 0 8px" }} />
        <div style={{ position: "relative", height: rowH * 3, overflow: "hidden" }}>
          <div style={{ transform: `translateY(${-rowH + row * rowH}px)` }}>
            {[["08:57", "EMP-0142", "Check-in"], ...ROWS].map(([time, id, ev], i) => (
              <div
                key={time}
                style={{
                  height: rowH,
                  display: "grid",
                  gridTemplateColumns: "92px 1fr 1fr auto",
                  alignItems: "center",
                  padding: "0 14px",
                  borderRadius: 14,
                  background: i === 0 ? `rgba(120,190,32,${0.16 * flash})` : "transparent",
                  opacity: i === 0 ? row : 1,
                  color: C.nightText,
                  fontSize: 18,
                }}
              >
                <span style={{ fontFamily: "Plex Mono", fontWeight: 500, color: i === 0 ? C.lime : C.nightText }}>{time}</span>
                <span style={{ fontFamily: "Plex Mono", color: C.nightMuted, fontSize: 16 }}>{id}</span>
                <span>{ev}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.lime,
                    border: `1px solid rgba(120,190,32,0.45)`,
                    borderRadius: 99,
                    padding: "5px 12px",
                  }}
                >
                  On time
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
