"use client";

import { RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
import type { Palette } from "./palette";

type P = { pal: Palette };
type Xyz = [number, number, number];

/** A soft matte block: the clay look of the storyboard. */
export function Block({
  size,
  position,
  color,
  radius = 0.04,
  rough = 0.6,
  emissive,
  glow = 0,
  rotation,
  children,
  shadow = true,
}: {
  size: Xyz;
  position: Xyz;
  color: string;
  radius?: number;
  rough?: number;
  emissive?: string;
  glow?: number;
  rotation?: Xyz;
  children?: ReactNode;
  shadow?: boolean;
}) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, ...size.map((s) => s / 2 - 0.001))}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow={shadow}
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={rough} emissive={emissive ?? "#000000"} emissiveIntensity={glow} />
      {children}
    </RoundedBox>
  );
}

/** The parking barrier: cabinet beside the road, a striped arm that lifts. */
export function Barrier({ pal, lift }: P & { lift: number }) {
  const L = 2.7;
  return (
    <group position={[-4.45, 0, 0.6]}>
      <Block size={[0.4, 1.0, 0.4]} position={[0, 0.5, 0]} color={pal.white} rough={0.35} />
      <Block size={[0.42, 0.05, 0.42]} position={[0, 1.02, 0]} color={pal.green} />
      <Block
        size={[0.03, 0.12, 0.12]}
        position={[-0.21, 0.82, 0]}
        color={pal.lime}
        emissive={pal.lime}
        glow={1.4 * lift}
      />
      <group position={[-0.1, 0.86, 0]} rotation={[0, 0, (lift * Math.PI * 82) / 180]}>
        <Block size={[L, 0.08, 0.08]} position={[-L / 2, 0, 0]} color={pal.white} rough={0.35} radius={0.03} />
        {[0, 1, 2, 3].map((k) => (
          <Block
            key={k}
            size={[0.34, 0.085, 0.085]}
            position={[-0.4 - k * 0.66, 0, 0]}
            color={pal.green}
            radius={0.02}
          />
        ))}
      </group>
    </group>
  );
}

/** The walk-through metal detector; its strips light lime as someone passes. */
export function Detector({ pal, scan }: P & { scan: number }) {
  return (
    <group position={[-1.6, 0, 0]}>
      {[-0.55, 0.55].map((z) => (
        <group key={z}>
          <Block size={[0.5, 2.1, 0.16]} position={[0, 1.05, z]} color={pal.white} rough={0.35} />
          <Block
            size={[0.06, 1.6, 0.012]}
            position={[0, 1.05, z - Math.sign(z) * 0.086]}
            color={pal.lime}
            emissive={pal.lime}
            glow={0.5 + 2.5 * scan}
            shadow={false}
          />
        </group>
      ))}
      <Block size={[0.5, 0.18, 1.26]} position={[0, 2.19, 0]} color={pal.green} rough={0.45} />
    </group>
  );
}

/** Two speed-gate pedestals with glass wings that swing open on a verified face. */
export function Gates({ pal, open }: P & { open: number }) {
  const swing = (open * Math.PI * 80) / 180;
  return (
    <group position={[0.9, 0, 0]}>
      {[-0.5, 0.5].map((z) => {
        const s = Math.sign(z);
        return (
          <group key={z}>
            <Block size={[1.4, 0.95, 0.24]} position={[0, 0.475, z]} color={pal.white} rough={0.3} />
            <Block size={[1.38, 0.02, 0.22]} position={[0, 0.96, z]} color={pal.night} rough={0.2} radius={0.005} />
            <Block
              size={[0.9, 0.03, 0.012]}
              position={[0, 0.8, z - s * 0.125]}
              color={pal.lime}
              emissive={pal.lime}
              glow={0.6 + 2 * open}
              shadow={false}
            />
            {/* The wing hinges on the pedestal's inner face and swings back along the lane. */}
            <group position={[0.15, 0.62, z - s * 0.12]} rotation={[0, s * swing, 0]}>
              <mesh position={[0, 0, -s * 0.19]}>
                <boxGeometry args={[0.02, 0.6, 0.38]} />
                <meshPhysicalMaterial color={pal.glass} transmission={0.85} roughness={0.08} thickness={0.02} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}

/** A door access reader: a small dark block with a lime light. */
export function Reader({ pal, position, on, rotationY = 0 }: P & { position: Xyz; on: number; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Block size={[0.13, 0.22, 0.045]} position={[0, 0, 0]} color={pal.night} rough={0.35} radius={0.015} />
      <Block
        size={[0.06, 0.06, 0.006]}
        position={[0, 0.04, 0.025]}
        color={pal.lime}
        emissive={pal.lime}
        glow={0.6 + 3 * on}
        radius={0.02}
        shadow={false}
      />
    </group>
  );
}

/** The wall with the office door: a glass door that swings once the reader verifies. */
export function DoorWall({ pal, open }: P & { open: number }) {
  return (
    <group position={[3.85, 0, 0]}>
      <Block size={[0.2, 2.4, 1.1]} position={[0, 1.2, -1.15]} color={pal.clay} radius={0.02} />
      <Block size={[0.2, 2.4, 1.1]} position={[0, 1.2, 1.15]} color={pal.clay} radius={0.02} />
      <Block size={[0.2, 0.35, 1.2]} position={[0, 2.225, 0]} color={pal.clay} radius={0.02} />
      <group position={[0, 1.0, -0.58]} rotation={[0, (-open * Math.PI * 75) / 180, 0]}>
        <mesh position={[0, 0, 0.58]}>
          <boxGeometry args={[0.05, 2.0, 1.12]} />
          <meshPhysicalMaterial color={pal.glass} transmission={0.85} roughness={0.08} thickness={0.03} />
        </mesh>
        <Block size={[0.05, 0.4, 0.04]} position={[-0.05, 0, 1.0]} color={pal.steel} rough={0.25} radius={0.01} />
      </group>
      <Reader pal={pal} position={[-0.12, 1.25, 0.85]} on={open} rotationY={-Math.PI / 2} />
    </group>
  );
}

/**
 * The face terminal on the back wall. `explode` (0 → 1) opens it into its layers along its depth: glass, screen,
 * frame, board and back plate, the close-up that ends the loop.
 */
export function Terminal({ pal, verified, explode }: P & { verified: number; explode: number }) {
  const e = explode;
  const layer = (z: number, spread: number) => z + e * spread;
  return (
    <group position={[3.0, 1.5, -2.45]}>
      <Block size={[0.62, 1.25, 0.04]} position={[0, 0, layer(-0.06, -0.05)]} color={pal.night} rough={0.4} />
      <Block size={[0.52, 1.0, 0.02]} position={[0, 0, layer(-0.03, 0.35)]} color={pal.pcb} rough={0.45} radius={0.01}>
        {[
          [-0.12, 0.25, 0.16, 0.16],
          [0.12, 0.2, 0.1, 0.22],
          [0, -0.15, 0.3, 0.12],
        ].map(([x, y, w, h], i) => (
          <Block key={i} size={[w!, h!, 0.03]} position={[x!, y!, 0.02]} color={pal.night} rough={0.3} radius={0.01} />
        ))}
      </Block>
      <Block size={[0.62, 1.25, 0.05]} position={[0, 0, layer(0, 0.75)]} color={pal.night} rough={0.3} radius={0.045} />
      <Block
        size={[0.5, 0.76, 0.012]}
        position={[0, 0.09, layer(0.032, 1.05)]}
        color={pal.screen}
        emissive={verified > 0.5 ? pal.screenOn : pal.screen}
        glow={0.25 + 0.5 * verified}
        radius={0.01}
        shadow={false}
      />
      <mesh position={[0, 0.15, layer(0.042, 1.05)]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.008, 40]} />
        <meshStandardMaterial color={pal.lime} emissive={pal.lime} emissiveIntensity={3 * verified} />
      </mesh>
      <mesh position={[0, 0, layer(0.05, 1.4)]}>
        <boxGeometry args={[0.6, 1.2, 0.012]} />
        <meshPhysicalMaterial color={pal.glass} transmission={0.9} roughness={0.05} thickness={0.01} />
      </mesh>
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.52, layer(0.06, 1.4)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.01, 24]} />
          <meshStandardMaterial color={pal.night} roughness={0.1} />
        </mesh>
      ))}
      <Block
        size={[0.3, 0.02, 0.01]}
        position={[0, -0.45, layer(0.03, 0.75)]}
        color={pal.lime}
        emissive={pal.lime}
        glow={2}
        shadow={false}
      />
    </group>
  );
}

export function Car({ pal, z }: P & { z: number }) {
  return (
    <group position={[-5.75, 0, z]}>
      <Block size={[0.88, 0.42, 1.9]} position={[0, 0.36, 0]} color={pal.white} rough={0.3} radius={0.15} />
      <mesh position={[0, 0.72, 0.1]} castShadow>
        <boxGeometry args={[0.76, 0.34, 1.0]} />
        <meshPhysicalMaterial color={pal.glass} roughness={0.15} transmission={0.4} />
      </mesh>
      {[-0.6, 0.6].flatMap((dz) =>
        [-0.44, 0.44].map((dx) => (
          <mesh key={`${dx}${dz}`} position={[dx, 0.17, dz]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.17, 0.17, 0.12, 24]} />
            <meshStandardMaterial color={pal.night} roughness={0.6} />
          </mesh>
        )),
      )}
    </group>
  );
}

export function Person({ pal, position, color }: P & { position: Xyz; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.6, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.27, 0]} castShadow>
        <sphereGeometry args={[0.13, 24, 16]} />
        <meshStandardMaterial color={pal.clay} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** BioTime's dashboard: a white panel with bars that grow as the check-ins arrive. */
export function Dashboard({ pal, show }: P & { show: number }) {
  const bars = [0.35, 0.6, 0.45, 0.8, 0.55, 0.95, 0.7];
  return (
    <group position={[0.9, 3.6 + (1 - show) * 0.4, -1.9]} scale={(0.001 + show * 0.999) * 1.3}>
      <Block size={[2.4, 1.4, 0.06]} position={[0, 0, 0]} color={pal.white} rough={0.25} radius={0.08} />
      {bars.map((h, i) => {
        const hh = h * (0.3 + 0.7 * show);
        return (
          <Block
            key={i}
            size={[0.16, hh, 0.03]}
            position={[-0.85 + i * 0.28, -0.55 + hh / 2, 0.045]}
            color={i === 5 ? pal.lime : pal.green}
            emissive={i === 5 ? pal.lime : undefined}
            glow={i === 5 ? 1.2 : 0}
            radius={0.01}
            shadow={false}
          />
        );
      })}
      <Block size={[2.0, 0.03, 0.02]} position={[0, 0.55, 0.045]} color={pal.night} radius={0.01} shadow={false} />
    </group>
  );
}
