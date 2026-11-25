"use client";

import dynamic from "next/dynamic";

/**
 * The door kit's GSAP motion, loaded only after hydration and only on the access control page (CLAUDE.md §3 GSAP rule,
 * §5): the chunk never blocks the first paint. Until it arrives, and if it never does, the finished frame stands.
 */
const DoorTimeline = dynamic(() => import("./DoorTimeline").then((m) => m.DoorTimeline), { ssr: false });

export function DoorMotion() {
  return <DoorTimeline />;
}
