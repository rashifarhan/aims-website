import { gsap } from "@/components/motion/gsap";

const CENTRE = { transformOrigin: "50% 50%" } as const;
const FIRST_ROUTE = 0.55;
const GAP = 0.15;
const DRAW = 1.1;

/**
 * The reach map's one sequence (client decision, 25 Nov 2026; Design Doc 8.3): the hub appears with one soft ring pulse,
 * the routes draw out of Dubai 150 ms apart on an ease that gathers speed and settles like a signal arriving, each
 * destination pops in and is named as its route lands, and the region label comes last. Every part is tweened
 * toward the finished map it was server-rendered in, so reverting (reduced motion, the test rest switch) puts the
 * final frame back exactly. Transform, opacity and stroke-dashoffset only; it plays once and stands.
 */
export function reachTimeline(svg: SVGSVGElement) {
  const all = <T extends Element>(selector: string) => [...svg.querySelectorAll<T>(selector)];
  const at = (selector: string, to: string | null) => all<SVGElement>(selector).filter((el) => el.dataset.to === to);
  const ring = svg.querySelector<SVGElement>(".reach-ring");
  const tl = gsap.timeline({ paused: true });

  tl.from(all(".reach-office"), { scale: 0.4, opacity: 0, ...CENTRE, duration: 0.5, ease: "back.out(2)" }, 0);
  if (ring) {
    const resting = Number(getComputedStyle(ring).opacity);
    tl.fromTo(
      ring,
      { scale: 0.4, opacity: 0, ...CENTRE },
      { scale: 1.9, opacity: 0.5, duration: 0.7, ease: "power2.out" },
      0,
    ).to(ring, { scale: 1, opacity: resting, duration: 0.6, ease: "power2.inOut" }, 0.7);
  }
  tl.from(all(".reach-label-strong"), { opacity: 0, duration: 0.5, ease: "power1.out" }, 0.25);

  const routes = all<SVGPathElement>(".reach-route");
  routes.forEach((route, i) => {
    const start = FIRST_ROUTE + i * GAP;
    const land = start + DRAW - 0.05;
    const to = route.dataset.to ?? null;
    tl.fromTo(route, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: DRAW, ease: "power2.inOut" }, start);
    const pop = { scale: 0.4, opacity: 0, ...CENTRE };
    tl.from(at(".reach-city", to), { ...pop, duration: 0.4, ease: "back.out(2.4)" }, land - 0.1);
    tl.from(at(".reach-arrive", to), { ...pop, duration: 0.5, ease: "power2.out" }, land - 0.1);
    tl.from(at(".reach-labels text", to), { opacity: 0, duration: 0.45, ease: "power1.out" }, land);
  });

  const landed = FIRST_ROUTE + Math.max(routes.length - 1, 0) * GAP + DRAW;
  tl.from(all(".reach-label-region"), { opacity: 0, duration: 0.6, ease: "power1.out" }, landed + 0.1);
  return tl;
}
