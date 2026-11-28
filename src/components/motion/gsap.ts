import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/*
 * The one GSAP entry (CLAUDE.md §3 GSAP rule): plugins are registered once, here, and only lazy chunks import this
 * module (the home hero and journey, the reach map, the access control door kit, and the section title reveal), so
 * GSAP never reaches the first paint. ScrollTrigger is exported for the pieces that create triggers directly.
 */
gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger, SplitText);
// A phone's address bar showing or hiding changes the viewport height; re-measuring every trigger then makes pinned
// and scrubbed pieces jump in the middle of a scroll (GSAP's own advice for touch screens).
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, useGSAP, ScrollTrigger, SplitText };

/** Set on <html> (or sent as an event) to put every GSAP sequence at its final, static frame: the e2e axe audit reads
 * resting text this way, as it cancels the CSS scroll reveals (tests/e2e/smoke.spec.ts). */
export const REST_EVENT = "aims:motion-rest";
export const restRequested = () => document.documentElement.dataset.motionRest === "true";
