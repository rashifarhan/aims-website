import { gsap, SplitText } from "@/components/motion/gsap";
import { journeyStep } from "@/lib/journeyStep";

/** The journey's moving parts, read from the server-rendered section (HomeJourney, JourneyCard). */
export type JourneyParts = {
  section: HTMLElement;
  heading: HTMLElement;
  intro: HTMLElement[];
  counter: HTMLElement;
  reel: HTMLElement;
  track: HTMLElement;
  steps: HTMLElement[];
  cards: HTMLElement[];
  nodes: HTMLElement[];
  numbers: HTMLElement[];
  ticks: SVGPathElement[];
  fills: HTMLElement[];
  ring: HTMLElement;
};

export function journeyParts(section: HTMLElement): JourneyParts | null {
  const all = <T extends Element>(selector: string) => [...section.querySelectorAll<T>(selector)];
  const one = <T extends Element>(selector: string) => section.querySelector<T>(selector);
  const heading = one<HTMLElement>(".section-title");
  const counter = one<HTMLElement>(".hj-counter");
  const reel = one<HTMLElement>(".hj-counter-reel");
  const track = one<HTMLElement>(".hj-list");
  const ring = one<HTMLElement>(".hj-node-ring");
  const steps = all<HTMLElement>(".hj-step");
  if (!heading || !counter || !reel || !track || !ring || steps.length === 0) return null;
  return {
    section,
    heading,
    intro: all<HTMLElement>(".section-lead, .section-heading > a"),
    counter,
    reel,
    track,
    steps,
    cards: all<HTMLElement>(".hj-card"),
    nodes: all<HTMLElement>(".hj-node"),
    numbers: all<HTMLElement>(".hj-node-number"),
    ticks: all<SVGPathElement>(".hj-node-tick path"),
    fills: all<HTMLElement>(".hj-seg-fill"),
    ring,
  };
}

/** The heading's words rise out of masked lines, the lead and end link after them, once (replaces SplitWords here). */
export function revealIntro(p: JourneyParts) {
  const trigger = { trigger: p.heading, start: "top 85%", once: true };
  SplitText.create(p.heading, {
    type: "lines,words",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.words, {
        yPercent: 110,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.04,
        scrollTrigger: trigger,
      }),
  });
  gsap.from(p.intro, { opacity: 0, y: 24, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: trigger });
}

/** A node's verification: its numeral gives way and the lime tick draws, as the hero's tick lights. */
const verify = (p: JourneyParts, tl: gsap.core.Timeline, k: number, at: number) =>
  tl
    .fromTo(p.numbers[k], { opacity: 1 }, { opacity: 0, duration: 0.1 }, at)
    .fromTo(p.ticks[k], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.15 }, at + 0.05);

/** The final step's ring: one lime pulse out of the last node, the journey ending on the hero's verified tick. */
const pulse = (p: JourneyParts, tl: gsap.core.Timeline, at: number) =>
  tl
    .fromTo(p.ring, { opacity: 0, scale: 0.6 }, { opacity: 0.9, scale: 1.25, duration: 0.25 }, at)
    .to(p.ring, { opacity: 0, scale: 1.9, duration: 0.35 }, at + 0.25);

const LEAD = 0.3;

/**
 * From 1024px: the section's content pins below the header and one scrubbed timeline plays across about 2.6
 * viewports. The list slides up a step at a time beside the start column; the rail fills; each card in turn rises
 * from rest (dim, 24px low) to active (whole, lifted to the plinth's second shadow); its node verifies; the counter
 * rolls to the step. Returns the timeline so focus can scroll to a step.
 */
export function pinnedTimeline(p: JourneyParts, wrap: HTMLElement) {
  const n = p.steps.length;
  const header = document.querySelector("header");
  gsap.set(p.cards.slice(1), { opacity: 0.4, y: 24 });
  gsap.set(p.cards[0], { y: -2, "--hj-lift": 1 });
  gsap.set(p.fills, { scaleY: 0, transformOrigin: "top" });
  gsap.set(p.reel, { yPercent: 0 });
  // Step k's card stands k/(n-1) of the way down the window: the first at its top, beside the heading, the last at
  // its foot, so the window stays full while the list slides and the journey ends on the last card's whole face.
  const frame = p.track.parentElement ?? p.track;
  const place = (k: number) => {
    const style = getComputedStyle(frame);
    const inner = frame.clientHeight - parseFloat(style.paddingBlockStart) - parseFloat(style.paddingBlockEnd);
    const room = inner - p.steps[n - 1].offsetHeight;
    return (Math.max(0, room) * k) / (n - 1) - p.steps[k].offsetTop;
  };
  let shown = 0;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: wrap,
      start: () => `top ${header?.offsetHeight ?? 0}px`,
      end: () => `+=${Math.round(innerHeight * 2.6)}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
    // The timeline's own update, not the trigger's: with scrub the timeline catches up after the scroll stops.
    onUpdate: () => {
      const step = journeyStep(tl.time(), LEAD, n);
      if (step === shown) return;
      shown = step;
      gsap.to(p.reel, { yPercent: (-100 * step) / n, duration: 0.45, ease: "power3.out", overwrite: true });
    },
  });
  verify(p, tl, 0, 0);
  for (let k = 0; k < n - 1; k++) {
    const at = LEAD + k;
    tl.addLabel(`step-${k}`, at)
      .to(p.track, { y: () => place(k + 1), duration: 1, ease: "power1.inOut" }, at)
      .to(p.fills[k], { scaleY: 1, duration: 1 }, at)
      .to(p.cards[k], { y: 0, "--hj-lift": 0, duration: 0.4 }, at)
      .to(p.cards[k + 1], { opacity: 1, y: -2, "--hj-lift": 1, duration: 0.5, ease: "power2.out" }, at + 0.45);
    verify(p, tl, k + 1, at + 0.85);
  }
  tl.addLabel(`step-${n - 1}`, LEAD + n - 1);
  pulse(p, tl, LEAD + n - 1);
  tl.to({}, { duration: 0.3 });
  return tl;
}

/** Below 1024px (or on a short screen): no pin. Each card rises in once; the rail fills down the start edge with the
 * scroll, each segment while the viewport's middle runs from its node to the next; each node verifies at the middle. */
export function flowMotion(p: JourneyParts) {
  gsap.set(p.fills, { transformOrigin: "top" });
  p.steps.forEach((step, k) => {
    const node = p.nodes[k];
    const centre = () => node.offsetTop + node.offsetHeight / 2;
    gsap.from(p.cards[k], {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: { trigger: p.cards[k], start: "top 88%", once: true },
    });
    if (p.fills[k])
      gsap.fromTo(
        p.fills[k],
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: step,
            start: () => `top+=${centre()} center`,
            end: () => `bottom+=${centre()} center`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    const tl = gsap.timeline({ scrollTrigger: { trigger: node, start: "center 62%", end: "center 50%", scrub: true } });
    verify(p, tl, k, 0);
    if (k === p.steps.length - 1) pulse(p, tl, 0.2);
  });
}
