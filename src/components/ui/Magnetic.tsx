"use client";

import { useEffect, useRef, type ReactNode } from "react";

const REACH = 6; // px: the pull never exceeds this (client decision 7)
const EASE = 0.18; // fraction of the remaining distance covered per frame

/**
 * Premium pass, client decision 7: the wrapped link or button leans up to 6px toward the pointer and springs
 * back on leave. The wrapper is `display: inline-flex` so the child keeps its own size and its 44px target;
 * only `transform` moves, and focus, tab order and the child's own hover styles are untouched. Fine pointers
 * only, and not at all under reduced motion.
 */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!el || !fine.matches || calm.matches) return;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const tick = () => {
      x += (tx - x) * EASE;
      y += (ty - y) * EASE;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        if (tx === 0 && ty === 0) el.style.transform = "";
      }
    };
    const go = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const box = el.getBoundingClientRect();
      const dx = e.clientX - (box.left + box.width / 2 - x);
      const dy = e.clientY - (box.top + box.height / 2 - y);
      const dist = Math.hypot(dx, dy) || 1;
      const pull = Math.min(REACH, dist / 8);
      tx = (dx / dist) * pull;
      ty = (dy / dist) * pull;
      go();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      go();
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, []);

  return (
    <span ref={ref} className={`inline-flex${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}
