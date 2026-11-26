import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useMemo, type ReactNode } from "react";
import { C, fontCss } from "./theme";
import { faceDots } from "./face";
import { DEV_H, DEV_W, Screen } from "./FaceScreen";
import { Finish, Stage } from "./Stage";

/**
 * The hero reel (client direction, 26 Nov 2026: "immersive speed", nothing to wait for). Four 2-second shots of AIMS's
 * own hardware, each already in motion on its first frame: the face terminal verifies, the speed gate's lane lights,
 * the barrier arm lifts, the lock releases. Light wipes cut between them and the last shot wipes into the first, so
 * the 8-second loop has no seam. The subjects keep to the right half; the page's headline owns the left.
 */
export const SHOT = 60;
export const SHOTS = 4;
export const LOOP = SHOT * SHOTS;
const X = 10; // frames each cut overlaps

const out = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const r = (f: number, a: number, b: number, from = 0, to = 1, easing = out) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
const img = (n: string) => staticFile(`img/${n}`);

export const HeroReel = () => {
  const f = useCurrentFrame();
  const shots = [FaceShot, GateShot, BarrierShot, LockShot];
  // Each shot's own clock runs from -X (arriving under the wipe) to SHOT; the arriving shot paints on top.
  const live = shots
    .map((Shot, i) => ({ Shot, i, local: ((((f - i * SHOT + X) % LOOP) + LOOP) % LOOP) - X }))
    .filter((s) => s.local < SHOT)
    .sort((a, b) => b.local - a.local);
  const arriving = live.find((s) => s.local < 0);
  return (
    <AbsoluteFill style={{ background: C.night950, overflow: "hidden" }}>
      <style>{fontCss}</style>
      {live.map(({ Shot, i, local }) => {
        // The arriving shot shows only behind the blade, so two products never overlap.
        const x = bladeX(local);
        const clip = local < 1 ? `polygon(-10% -10%, ${x + 150}px -10%, ${x - 150}px 110%, -10% 110%)` : undefined;
        return (
          <AbsoluteFill key={i} style={{ clipPath: clip }}>
            <Stage f={f} loop={LOOP} />
            <AbsoluteFill
              style={{
                transform: `translateX(${(1 - r(local, -X, 18)) * 140}px) scale(${1.08 - 0.08 * r(local, -X, 26)})`,
                transformOrigin: "70% 50%",
              }}
            >
              <Shot t={local} />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
      {arriving && <Wipe t={arriving.local} />}
      <Finish f={f} />
    </AbsoluteFill>
  );
};

/** The cut: a blade of lime light crossing the frame while the next shot slides in under it. */
const bladeX = (t: number) =>
  interpolate(t, [-X, 1], [-0.12, 1.12], { easing: inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * 1920;

function Wipe({ t }: { t: number }) {
  const x = bladeX(t);
  const a = Math.sin(Math.min(1, Math.max(0, (t + X) / (X + 1))) * Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        top: -200,
        bottom: -200,
        left: x - 160,
        width: 320,
        transform: "skewX(-14deg)",
        background:
          "linear-gradient(90deg, transparent, rgba(120,190,32,0.35) 40%, rgba(244,255,232,0.85) 50%, rgba(120,190,32,0.35) 60%, transparent)",
        filter: "blur(18px)",
        mixBlendMode: "screen",
        opacity: a,
      }}
    />
  );
}

/** A photograph turning slowly in 3D, with a highlight raking across it (masked to the product). */
function Product({
  src,
  w,
  h,
  left,
  top,
  turn,
  sweep,
  children,
  reflect = true,
}: {
  src: string;
  w: number;
  h: number;
  left: number;
  top: number;
  turn: number;
  sweep: number;
  children?: ReactNode;
  reflect?: boolean;
}) {
  return (
    <div style={{ position: "absolute", left, top, perspective: 2400 }}>
      <div style={{ position: "relative", width: w, height: h, transform: `rotateY(${turn}deg)` }}>
        <Img src={src} style={{ width: "100%", height: "100%", filter: "drop-shadow(0 50px 70px rgba(0,0,0,0.6))" }} />
        {children}
        <div
          style={{
            position: "absolute",
            inset: 0,
            maskImage: `url(${src})`,
            maskSize: "100% 100%",
            background: `linear-gradient(105deg, transparent ${sweep * 100 - 16}%, rgba(255,255,255,0.3) ${sweep * 100}%, transparent ${sweep * 100 + 16}%)`,
            mixBlendMode: "screen",
          }}
        />
        {reflect && (
          <Img
            src={src}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              height: "100%",
              transform: "scaleY(-1)",
              opacity: 0.14,
              maskImage: "linear-gradient(to top, black, transparent 30%)",
            }}
          />
        )}
      </div>
    </div>
  );
}

const Glow = ({ x, y, s, o }: { x: number; y: number; s: number; o: number }) => (
  <div
    style={{
      position: "absolute",
      left: x - s / 2,
      top: y - s / 2,
      width: s,
      height: s,
      borderRadius: 999,
      background: `radial-gradient(circle, rgba(244,255,232,${o}), rgba(120,190,32,${o * 0.7}) 30%, transparent 70%)`,
      mixBlendMode: "screen",
    }}
  />
);

/** 1 · Face recognition attendance: close on the terminal as the scan passes and it verifies. */
function FaceShot({ t }: { t: number }) {
  const dots = useMemo(() => faceDots(1500), []);
  const k = 1.3;
  const rot = Math.sin(t / 30) * 0.12 - 0.08;
  return (
    <Product
      src={img("speedface-cut.png")}
      w={DEV_W * k}
      h={DEV_H * k}
      left={1430 - (DEV_W * k) / 2}
      top={-20 + r(t, -X, SHOT, 10, -10)}
      turn={r(t, -X, SHOT, -26, -14, inOut)}
      sweep={r(t, 6, 54, -0.6, 1.6, inOut)}
      reflect={false}
    >
      <Screen
        dots={dots}
        cos={Math.cos(rot)}
        sin={Math.sin(rot)}
        gather={1}
        scanY={r(t, -4, 28, -0.05, 1.05, inOut)}
        scanOn={r(t, -6, -2) * (1 - r(t, 28, 32))}
        verify={r(t, 28, 36)}
        tick={r(t, 32, 42)}
        label={r(t, 34, 44)}
      />
    </Product>
  );
}

/** 2 · Speed gates: the lane lights through the gate, chevrons running towards the camera. */
function GateShot({ t }: { t: number }) {
  const k = 1.45;
  const W = 500 * k;
  const H = 588 * k;
  const pulse = 0.5 + 0.5 * Math.sin(t / 4);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${r(t, -X, SHOT, 40, -40, inOut)}px)` }}>
      <Product
        src={img("zkteco-mars-b1200-double-swing-barrier-gate.png")}
        w={W}
        h={H}
        left={1420 - W / 2}
        top={960 - H}
        turn={r(t, -X, SHOT, -10, 6, inOut)}
        sweep={r(t, 0, 50, -0.6, 1.6, inOut)}
      >
        {/* The entry arrow on the gate's side glows "go". */}
        <Glow x={47 * k} y={253 * k} s={150} o={0.5 + 0.3 * pulse} />
        {/* The lane: chevrons on the floor through the passage. */}
        <svg viewBox="0 0 500 588" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <filter id="cg" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {Array.from({ length: 6 }, (_, i) => {
            const u = ((t / 22 + i / 6) % 1 + 1) % 1; // 0 far … 1 near
            const y = 470 + u * 150;
            const s = 0.5 + u * 0.9;
            const o = Math.sin(u * Math.PI);
            return (
              <g key={i} opacity={o} transform={`translate(${262 - u * 40} ${y}) scale(${s} ${s * 0.45})`}>
                <path d="M-34 -10L0 12L34 -10" fill="none" stroke={C.lime} strokeWidth="9" filter="url(#cg)" />
                <path d="M-34 -10L0 12L34 -10" fill="none" stroke="#f4ffe8" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            );
          })}
          {/* A light curtain between the wings: the gate sees the person pass. */}
          <rect
            x={250 + Math.sin(t / 9) * 70}
            y="170"
            width="3"
            height="300"
            fill={C.lime}
            opacity={0.55}
            filter="url(#cg)"
          />
        </svg>
      </Product>
    </div>
  );
}

/** 3 · Parking barriers: the arm lifts. The arm is its own layer, cut from AIMS's photo, pivoting at the post. */
function BarrierShot({ t }: { t: number }) {
  const k = 2.2;
  const postW = 101 * k;
  const postH = 292 * k;
  const left = 1100;
  const top = 960 - postH;
  const lift = r(t, 2, 30, 0, 1, Easing.bezier(0.5, 0, 0.2, 1.08));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${r(t, -X, SHOT, 1, 1.06, inOut)})`,
        transformOrigin: "60% 70%",
      }}
    >
      <Img
        src={img("barrier-arm.png")}
        style={{
          position: "absolute",
          left: left + 99 * k - 4,
          top: top + 24 * k,
          width: 719 * k,
          height: 40 * k,
          transformOrigin: "0% 50%",
          transform: `rotate(${-84 * lift}deg)`,
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.5))",
        }}
      />
      <Product
        src={img("barrier-post.png")}
        w={postW}
        h={postH}
        left={left}
        top={top}
        turn={0}
        sweep={r(t, 10, 56, -0.6, 1.6, inOut)}
      >
        <Glow x={47 * k} y={155 * k} s={180} o={0.15 + 0.6 * lift} />
      </Product>
    </div>
  );
}

/** 4 · Door access: the magnetic lock holds, then releases with a pulse; the armature plate falls away. */
function LockShot({ t }: { t: number }) {
  const k = 1.12;
  const left = 1010;
  const top = 290;
  const release = r(t, 12, 32, 0, 1, inOut);
  const held = 1 - r(t, 10, 14);
  const ring = r(t, 10, 34);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `rotate(${r(t, -X, SHOT, -2, 1, inOut)}deg) scale(${r(t, -X, SHOT, 1.02, 1.07, inOut)})`,
        transformOrigin: "65% 50%",
      }}
    >
      <Product src={img("lock-body.png")} w={770 * k} h={463 * k} left={left} top={top} turn={0} sweep={r(t, 0, 50, -0.6, 1.6, inOut)} reflect={false} />
      {/* The field while it holds: lime lines between magnet and plate. */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: held }}>
        {Array.from({ length: 7 }, (_, i) => {
          const x0 = left + (90 + i * 85) * k;
          const y0 = top + (300 - i * 40) * k;
          return (
            <path
              key={i}
              d={`M${x0} ${y0}l${-14 * k} ${70 * k}`}
              stroke={C.lime}
              strokeWidth="3"
              strokeDasharray="4 7"
              strokeDashoffset={-t * 2}
              opacity={0.5 + 0.5 * Math.sin(t / 3 + i)}
            />
          );
        })}
      </svg>
      <Img
        src={img("lock-plate.png")}
        style={{
          position: "absolute",
          left: left + 164 * k + release * 30 - (1 - release) * 26,
          top: top + 248 * k + release * 70 - (1 - release) * 64,
          width: 564 * k,
          height: 335 * k,
          transform: `rotate(${release * 4}deg)`,
          filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.55))",
        }}
      />
      {/* Release: a ring of light leaves the magnet face. */}
      <div
        style={{
          position: "absolute",
          left: left + 420 * k - 260 * ring,
          top: top + 230 * k - 260 * ring,
          width: 520 * ring,
          height: 520 * ring,
          borderRadius: 999,
          border: `3px solid ${C.lime}`,
          boxShadow: `0 0 40px ${C.lime}`,
          opacity: (1 - ring) * (ring > 0 ? 1 : 0),
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
