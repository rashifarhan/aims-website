"use client";

import dynamic from "next/dynamic";

/** Loads the reach map's GSAP chunk after hydration, only where a map is drawn; until then the map stands finished. */
const ReachTimeline = dynamic(() => import("./ReachTimeline").then((m) => m.ReachTimeline), { ssr: false });

export function ReachMotion() {
  return <ReachTimeline />;
}
