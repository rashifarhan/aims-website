import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useMemo } from "react";
import { C, fontCss } from "./theme";
import { faceDots } from "./face";
import { DEV_H, DEV_W, Screen } from "./FaceScreen";

/**
 * Journey step "Face recognition attendance": AIMS's own SpeedFace photograph on a night stage. The camera drifts in,
 * light sweeps the hardware, a face condenses on the screen and is scanned, it verifies, and a thread of light carries
 * the check-in to the attendance log, where the new row lands. 6 s, fades from and to night so it loops cleanly.
 */
const out = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const r = (f: number, a: number, b: number, from = 0, to = 1, easing = out) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

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
