"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { storyFrame, type StoryFrame } from "@/lib/doorStory";

/** Writes one timeline frame to the server-rendered drawing (transform, opacity, stroke-dashoffset only). */
function paint(svg: SVGSVGElement, f: StoryFrame) {
  const q = (s: string) => svg.querySelector<SVGElement>(s);
  [".door-reader", ".door-controller", ".door-lock", ".door-exit", ".door-software"].forEach((s, i) => {
    const el = q(s);
    if (el) el.style.opacity = String(f.parts[i]);
  });
  const wires = [...svg.querySelectorAll<SVGPathElement>(".door-wires .door-wire, .door-software .door-wire")];
  wires.forEach((w, i) => (w.style.strokeDashoffset = String(1 - (f.wires[i] ?? 1))));
  const card = q(".door-card");
  if (card) {
    card.style.opacity = String(f.card.opacity);
    card.style.transform = `translate(${f.card.dx}px, ${f.card.dy}px) rotate(${f.card.rotate}deg)`;
  }
  const leds = svg.querySelectorAll<SVGElement>(".door-led");
  if (leds[0]) leds[0].style.opacity = f.readerLed ? "1" : "0";
  if (leds[1]) leds[1].style.opacity = f.lockLed ? "1" : "0";
  const leaf = q(".door-leaf");
  if (leaf) leaf.style.transform = `scaleX(${f.leaf})`;
  const granted = q(".door-granted");
  if (granted) granted.style.opacity = String(f.granted);
  const log = q(".door-log");
  if (log) log.style.opacity = String(f.log);
  const pulse = svg.querySelector<SVGCircleElement>(".door-pulse");
  const [toController, toLock] = wires;
  if (pulse && toController && toLock) {
    if (f.pulse === null) pulse.style.opacity = "0";
    else {
      // Reader → controller runs the reader wire backwards, then controller → lock forwards.
      const u = f.pulse;
      const path = u < 0.5 ? toController : toLock;
      const len = path.getTotalLength();
      const at = path.getPointAtLength(u < 0.5 ? len * (1 - u * 2) : len * (u - 0.5) * 2);
      pulse.style.opacity = "1";
      pulse.style.transform = `translate(${at.x - 248}px, ${at.y - 318}px)`;
    }
  }
}

/**
 * The door-kit scroll story (Design Doc 8.2, the approved prototype, CLAUDE.md §3: the page's dealt
 * moment). Scroll progress through the host section scrubs the drawing; the section holds the
 * drawing with position: sticky while the page scrolls natively. Under reduced motion, under
 * 1024px and without JavaScript the drawing stays on its finished frame (the server markup).
 */
export function DoorKitStage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = stage.current?.closest<HTMLElement>("[data-door-story]");
    const svg = stage.current?.querySelector("svg");
    if (!host || !svg) return;
    const still = matchMedia("(prefers-reduced-motion: reduce), (max-width: 1023px)");
    const steps = [...host.querySelectorAll<HTMLElement>("[data-story-step]")];
    let frame = 0;

    const render = () => {
      frame = 0;
      const r = host.getBoundingClientRect();
      const f = storyFrame(-r.top / Math.max(1, r.height - innerHeight));
      paint(svg, f);
      steps.forEach((li, i) => li.toggleAttribute("data-current", i === f.step));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const finish = () => {
      paint(svg, storyFrame(1));
      steps.forEach((li) => li.removeAttribute("data-current"));
    };
    // Listen only while the section is near the screen (loops and scrubs pause off-screen).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !still.matches) {
          addEventListener("scroll", onScroll, { passive: true });
          render();
        } else removeEventListener("scroll", onScroll);
      },
      { rootMargin: "50% 0px" },
    );
    const onMedia = () => (still.matches ? finish() : render());
    io.observe(host);
    still.addEventListener("change", onMedia);
    host.dataset.storyLive = still.matches ? "still" : "live";
    if (still.matches) finish();
    return () => {
      io.disconnect();
      still.removeEventListener("change", onMedia);
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={stage} className="door-story__stage">
      {children}
    </div>
  );
}
