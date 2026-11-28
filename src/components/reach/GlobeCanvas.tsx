"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createGlobeEngine, type GlobeEngine } from "./globeEngine";
import type { GlobePlace } from "./globePlaces";

/**
 * The reach globe (decorative: the places it shows are listed in text beside it). It can be dragged and glides to
 * rest; choosing a review turns it to that review's place, where a lime ring marks it (reach/globeEngine.ts).
 * Without WebGL a plain disc stands in.
 */
export function GlobeCanvas({ focus }: { focus: GlobePlace }) {
  const box = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const engine = useRef<GlobeEngine | null>(null);
  const firstFocus = useRef(focus);
  const [gl, setGl] = useState<"pending" | "ready" | "off">("pending");

  useEffect(() => {
    if (!box.current || !ring.current) return;
    const created = createGlobeEngine(box.current, ring.current, firstFocus.current, setGl);
    engine.current = created;
    return () => {
      created.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.focusOn(focus);
  }, [focus]);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    engine.current?.down(e);
  };

  return (
    <div
      ref={box}
      className="rg-box"
      dir="ltr"
      data-gl={gl}
      aria-hidden="true"
      onPointerDown={down}
      onPointerMove={(e) => engine.current?.move(e)}
      onPointerUp={(e) => engine.current?.up(e)}
      onPointerCancel={(e) => engine.current?.up(e)}
    >
      <span ref={ring} className="rg-ring" />
    </div>
  );
}
