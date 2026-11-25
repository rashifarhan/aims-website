import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, REST_EVENT, restRequested, SplitText } from "./gsap";
import { HEADING_SELECTOR } from "./headingSelector";

/*
 * Section titles rise out of masked lines as they enter, once (client approval of GSAP, 25 Nov 2026; replaces the
 * CSS scroll-timeline word reveal, which Firefox never played). English splits into lines and words and the words
 * rise; Arabic splits into lines only and the lines rise, so every word stays one text run: Arabic letters keep
 * joining, and Latin model names keep their bidi order (an inline-block word would count as a neutral in RTL).
 */
const START = "top 85%";
const WORDS = { yPercent: 110, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.04 };
const LINES = { yPercent: 130, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 };

/** One heading's split and reveal. Once played, the split reverts, so the resting heading is the server's markup. */
function reveal(heading: HTMLElement) {
  const rtl = getComputedStyle(heading).direction === "rtl";
  SplitText.create(heading, {
    type: rtl ? "lines" : "lines,words",
    mask: "lines",
    linesClass: "heading-line",
    // Lines are measured after the webfonts load and again on resize until the reveal plays: no stale breaks, no shift.
    autoSplit: true,
    // aria "auto": the heading keeps its text as an aria-label and the split parts are aria-hidden (CLAUDE.md §4).
    aria: "auto",
    onSplit: (self) =>
      gsap.from(rtl ? self.lines : self.words, {
        ...(rtl ? LINES : WORDS),
        // Measured after the triggers above them (the journey's pin among them), so a pin's spacer is counted.
        scrollTrigger: { trigger: heading, start: START, once: true, refreshPriority: -1 },
        onComplete: () => {
          self.revert();
        },
      }),
  });
}

/**
 * ScrollTrigger measures each start once, so content that grows the page later (the home journey's pin spacer, which
 * lazy-loads on its own clock, or a late block) would leave the titles below it firing screens early, unseen. A
 * change in the page's height re-measures every trigger, as a resize does.
 */
function refreshOnGrowth() {
  let timer = 0;
  let height = document.body.offsetHeight;
  const observer = new ResizeObserver(() => {
    if (document.body.offsetHeight === height) return;
    height = document.body.offsetHeight;
    clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
  });
  observer.observe(document.body);
  return () => {
    clearTimeout(timer);
    observer.disconnect();
  };
}

/**
 * Splits every marked title that starts below the first screen; one ScrollTrigger each, all created here. A title on
 * the first screen at load (or above it, after a restored scroll) is left alone, so no visible text is ever hidden and
 * the first paint and LCP are untouched. Under reduced motion, and on the rest switch, everything reverts to the
 * server-rendered heading. Returns the cleanup.
 */
export function revealHeadings() {
  if (restRequested()) return () => undefined;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const below = [...document.querySelectorAll<HTMLElement>(HEADING_SELECTOR)].filter(
      (heading) => heading.getBoundingClientRect().top >= innerHeight,
    );
    below.forEach(reveal);
    return below.length > 0 ? refreshOnGrowth() : undefined;
  });
  const rest = () => mm.revert();
  document.addEventListener(REST_EVENT, rest);
  return () => {
    document.removeEventListener(REST_EVENT, rest);
    mm.revert();
  };
}
