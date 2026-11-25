"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./spotlight.css";

/**
 * Premium pass, client decision 7: a soft lime light follows the pointer over every `.spotlight-card` inside.
 * One delegated listener writes `--spot-x`/`--spot-y` straight onto the hovered card, so React never re-renders
 * on a move. Fine pointers only; reduced motion is handled in spotlight.css (the light stays hidden).
 */
export function SpotlightGroup({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const card = (e.target as Element).closest<HTMLElement>(".spotlight-card");
      if (!card || !root.contains(card)) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${e.clientX - box.left}px`);
      card.style.setProperty("--spot-y", `${e.clientY - box.top}px`);
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => root.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
