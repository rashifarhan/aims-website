import { AbsoluteFill } from "remotion";
import { useMemo } from "react";
import { C } from "./theme";

/**
 * The night stage every film shares: a pool of green light, a receding floor grid and drifting dust. Every motion is
 * periodic over `loop` frames, so a film that loops never shows a seam.
 */
export function Stage({ f, loop, glow = "66% 46%" }: { f: number; loop: number; glow?: string }) {
  const dust = useMemo(() => {
    let s = 5;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: 80 }, () => ({ x: rnd(), y: rnd(), z: rnd(), p: rnd() }));
  }, []);
  const ph = (f / loop) * Math.PI * 2;
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(42% 58% at ${glow}, rgba(120,190,32,0.15), rgba(38,112,58,0.2) 42%, transparent 74%), radial-gradient(70% 60% at 20% 70%, rgba(16,38,25,0.9), transparent 70%), ${C.night950}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -500,
          right: -500,
          top: 800,
          height: 900,
          transformOrigin: "50% 0",
          transform: "perspective(900px) rotateX(72deg)",
          backgroundImage: `linear-gradient(${C.nightLine} 1px, transparent 1px), linear-gradient(90deg, ${C.nightLine} 1px, transparent 1px)`,
          backgroundSize: "90px 90px",
          // One full cell per loop: the floor glides forward and lands exactly where it began.
          backgroundPosition: `0 ${(f / loop) * 180}px`,
          opacity: 0.5,
          maskImage: "linear-gradient(to bottom, black, transparent 70%)",
        }}
      />
      {dust.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${d.x * 100 + Math.sin(ph + d.p * 6) * 1.5 * (d.z + 0.3)}%`,
            top: `${d.y * 100 + Math.cos(ph + d.p * 9) * 2 * (d.z + 0.2)}%`,
            width: 2 + d.z * 3,
            height: 2 + d.z * 3,
            borderRadius: 99,
            background: C.lime,
            opacity: (0.07 + d.z * 0.22) * (0.6 + 0.4 * Math.sin(ph * 2 + d.p * 6)),
            filter: `blur(${(1 - d.z) * 1.5}px)`,
          }}
        />
      ))}
    </>
  );
}

/** Vignette and grain, the film finish over everything. */
export function Finish({ f }: { f: number }) {
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55))" }} />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6} />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </>
  );
}
