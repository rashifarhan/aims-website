"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { NeutralToneMapping } from "three";
import { Barrier, Block, Car, Dashboard, Detector, DoorWall, Gates, Person, Terminal } from "./parts";
import { readPalette, type Palette } from "./palette";
import { LOOP, cameraAt, mix, momentsAt, pulse, type Moments } from "./timeline";

/** Where the reduced-motion still sits: every device verified, the dashboard up. */
const STILL_AT = 8.8;

/**
 * Drives the loop: advances the clock while playing, places the camera, and hands the story's moments to the
 * scene about 30 times a second (often enough for smooth motion, rarely enough to keep React's work small).
 */
function Rig({
  playing,
  still,
  at,
  onMoments,
}: {
  playing: boolean;
  still: boolean;
  at?: number;
  onMoments: (m: Moments, t: number) => void;
}) {
  const clock = useRef(at ?? (still ? STILL_AT : 0));
  const since = useRef(1);
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (playing && !still) clock.current = (clock.current + Math.min(delta, 0.1)) % LOOP;
    const t = clock.current;
    // Reduced motion keeps the opening wide shot; a pinned review time (`at`) shows that moment's own camera.
    const shot = cameraAt(still && at === undefined ? 0 : t);
    camera.position.set(...shot.position);
    camera.lookAt(...shot.target);
    since.current += delta;
    if (since.current >= 1 / 30 || still) {
      since.current = 0;
      onMoments(momentsAt(t), t);
    }
  });
  return null;
}

function Site({ pal, m, t }: { pal: Palette; m: Moments; t: number }) {
  const walkerX = mix(-3.4, 5.0, m.walker);
  const walkerShow = pulse(t, 3.5, 3.9, 8.6, 9.0);
  const carShow = pulse(t, 0.2, 0.8, 5.2, 5.8);
  // Five check-ins rise from the terminal to the dashboard, one after another.
  const data = [0, 1, 2, 3, 4].map((i) => {
    const k = Math.min(1, Math.max(0, (m.data * 1.6 - i * 0.15) / 1));
    return { k, show: k > 0 && k < 1 };
  });
  return (
    <group>
      <Block size={[15.5, 0.1, 9]} position={[0, -0.05, 0]} color={pal.ground} radius={0.3} rough={0.85} />
      <Block
        size={[2.6, 0.02, 9]}
        position={[-5.8, 0.01, 0]}
        color={pal.clay}
        radius={0.01}
        rough={0.9}
        shadow={false}
      />
      {[-3, -1.4, 0.2, 1.8, 3.4].map((z) => (
        <Block
          key={z}
          size={[0.1, 0.012, 0.7]}
          position={[-5.8, 0.03, z]}
          color={pal.white}
          radius={0.005}
          shadow={false}
        />
      ))}
      <Block size={[8.8, 2.4, 0.2]} position={[0.2, 1.2, -2.7]} color={pal.clay} radius={0.02} />
      <Barrier pal={pal} lift={m.barrier} />
      <group scale={carShow}>
        <Car pal={pal} z={m.carZ} />
      </group>
      <Detector pal={pal} scan={m.detector} />
      <Gates pal={pal} open={m.gates} />
      <DoorWall pal={pal} open={m.door} />
      <Terminal pal={pal} verified={m.verified} explode={m.explode} />
      <group position={[walkerX, 0, 0]} scale={walkerShow}>
        <Person pal={pal} position={[0, 0, 0]} color={pal.green} />
      </group>
      <Person pal={pal} position={[0.9, 0, 1.5]} color={pal.clay} />
      <Dashboard pal={pal} show={m.dashboard} />
      {data.map(({ k, show }, i) =>
        show ? (
          <mesh
            key={i}
            position={[mix(3.0, 0.9, k), mix(1.6, 3.2, k) + Math.sin(k * Math.PI) * 0.6, mix(-2.35, -2.05, k)]}
          >
            <sphereGeometry args={[0.06, 16, 12]} />
            <meshStandardMaterial color={pal.lime} emissive={pal.lime} emissiveIntensity={2.5} />
          </mesh>
        ) : null,
      )}
    </group>
  );
}

export default function Scene({ playing, still, at }: { playing: boolean; still: boolean; at?: number }) {
  const pal = useMemo(() => readPalette(), []);
  const [state, setState] = useState<{ m: Moments; t: number }>(() => {
    const t = at ?? (still ? STILL_AT : 0);
    return { m: momentsAt(t), t };
  });
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      frameloop={still ? "demand" : playing ? "always" : "never"}
      camera={{ fov: 30, near: 0.1, far: 80, position: [12.5, 11.2, 15.0] }}
      gl={{ antialias: true, alpha: true, toneMapping: NeutralToneMapping }}
    >
      <Rig playing={playing} still={still} at={at} onMoments={(m, t) => setState({ m, t })} />
      <hemisphereLight args={[pal.white, pal.ground, 1.3]} />
      <directionalLight
        position={[6, 11, 7]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <Environment resolution={128}>
        <Lightformer intensity={1.6} position={[0, 6, 4]} scale={[12, 6, 1]} />
        <Lightformer intensity={0.8} position={[-6, 3, 0]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
      </Environment>
      <Site pal={pal} m={state.m} t={state.t} />
    </Canvas>
  );
}
