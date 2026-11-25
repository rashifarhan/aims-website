import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/*
 * The one GSAP entry (CLAUDE.md §3 GSAP rule): plugins are registered once, here, and only the lazy chunks of the home
 * hero (HeroTimeline) and journey (JourneyTimeline) import this module, so GSAP never reaches a layout or the first
 * paint.
 */
gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger, SplitText);

export { gsap, useGSAP, SplitText };

/** Set on <html> (or sent as an event) to put every GSAP sequence at its final, static frame: the e2e axe audit reads
 * resting text this way, as it cancels the CSS scroll reveals (tests/e2e/smoke.spec.ts). */
export const REST_EVENT = "aims:motion-rest";
export const restRequested = () => document.documentElement.dataset.motionRest === "true";

/* The access control door kit (solution/access-control/doorMotion.ts) creates its per-step triggers directly. */
export { ScrollTrigger };
