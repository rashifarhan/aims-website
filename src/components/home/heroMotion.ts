import { gsap } from "@/components/motion/gsap";

/** The hero's moving parts, read from the server-rendered stage (Hero, HeroFrame, HeroScreen). */
export type HeroParts = {
  /** `.home-corner > i`: the scroll exit opens them outward. */
  corners: HTMLElement[];
  /** The bracket svgs inside them: the entrance closes them in. */
  brackets: SVGSVGElement[];
  scan: HTMLElement;
  beam: HTMLElement;
  anchor: HTMLElement;
  chip: HTMLElement;
  chipTick: SVGPathElement;
  device: HTMLElement;
  light: HTMLElement;
  screens: { idle: HTMLElement; scan: HTMLElement; verified: HTMLElement };
  screenBeam: HTMLElement;
  disc: HTMLElement;
  tick: SVGPathElement;
};

export function heroParts(hero: HTMLElement): HeroParts | null {
  const one = <T extends Element>(selector: string) => hero.querySelector<T>(selector);
  const corners = [...hero.querySelectorAll<HTMLElement>(".home-corner > i")];
  const brackets = [...hero.querySelectorAll<SVGSVGElement>(".home-corner svg")];
  const scan = one<HTMLElement>(".home-frame-scan i");
  const beam = one<HTMLElement>(".home-frame-beam");
  const anchor = one<HTMLElement>(".home-verified-anchor");
  const chip = one<HTMLElement>(".home-verified-chip");
  const chipTick = one<SVGPathElement>(".home-verified-tick path");
  const device = one<HTMLElement>(".home-device");
  const light = one<HTMLElement>(".home-wash-verified");
  const idle = one<HTMLElement>('[data-screen="idle"]');
  const scanning = one<HTMLElement>('[data-screen="scan"]');
  const verified = one<HTMLElement>('[data-screen="verified"]');
  const screenBeam = one<HTMLElement>("[data-beam]");
  const disc = one<HTMLElement>(".home-device-tick");
  const tick = one<SVGPathElement>(".home-device-tick path");
  if (corners.length !== 4 || brackets.length !== 4) return null;
  if (!scan || !beam || !anchor || !chip || !chipTick || !device || !light) return null;
  if (!idle || !scanning || !verified || !screenBeam || !disc || !tick) return null;
  const screens = { idle, scan: scanning, verified };
  return { corners, brackets, scan, beam, anchor, chip, chipTick, device, light, screens, screenBeam, disc, tick };
}

/* The approved prototype's screen beats (Design Doc 8.1, docs/prototypes/hero): 450ms cross-fades, verified 1.5s
   after the scan starts, verified held 2.35s, 5.8s a cycle. */
const FADE = 0.45;
const SCAN_TO_VERIFIED = 1.5;
const VERIFIED_HOLD = 2.35;
const CYCLE = 5.8;
/** The screen starts scanning as the brackets lock on and the frame's scan line starts down. */
const SCAN_AT = 0.6;

type Screen = keyof HeroParts["screens"];

/** Cross-fades the device screen to one state (the prototype's 0.98 settle), the verified light with it. */
function show(tl: gsap.core.Timeline, p: HeroParts, state: Screen, at: number) {
  const fade = { duration: FADE, ease: "power1.inOut" };
  for (const [name, screen] of Object.entries(p.screens)) {
    const on = name === state;
    tl.to(screen, { opacity: on ? 1 : 0, scale: on ? 1 : 0.98, ...fade }, at);
  }
  tl.to(p.light, { opacity: state === "verified" ? 1 : 0, ...fade }, at);
}

/** "Look at the camera" gives way to the face scan; the screen's own beam runs down and back once. */
function scanning(tl: gsap.core.Timeline, p: HeroParts, at: number) {
  show(tl, p, "scan", at);
  tl.fromTo(
    p.screenBeam,
    { yPercent: 0 },
    { yPercent: 500, duration: (FADE * 2 + SCAN_TO_VERIFIED - FADE) / 2, ease: "sine.inOut", yoyo: true, repeat: 1 },
    at,
  );
}

/** Welcome: the green disc springs from 0.6 and its tick draws 150ms later, as in the prototype. */
function verify(tl: gsap.core.Timeline, p: HeroParts, at: number) {
  show(tl, p, "verified", at);
  tl.to(p.disc, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, at).to(
    p.tick,
    { drawSVG: "100%", duration: 0.5, ease: "power1.out" },
    at + 0.15,
  );
}

function unverify(tl: gsap.core.Timeline, p: HeroParts, at: number) {
  show(tl, p, "idle", at);
  tl.to(p.disc, { scale: 0.6, duration: FADE }, at).to(p.tick, { drawSVG: "0%", duration: FADE }, at);
}

/** The screen loop after the entrance: verified → idle → scan → verified, 5.8s, repeating (paused by HeroTimeline). */
function screenLoop(p: HeroParts) {
  const loop = gsap.timeline({ repeat: -1 });
  const scanAt = CYCLE - VERIFIED_HOLD - FADE - SCAN_TO_VERIFIED;
  unverify(loop, p, 0);
  scanning(loop, p, scanAt);
  verify(loop, p, scanAt + SCAN_TO_VERIFIED);
  loop.set({}, {}, CYCLE);
  return loop;
}

/**
 * The master timeline (client request, 25 Nov 2026). Its first frame matches the pending frame the server paints
 * (home.css), so nothing flashes when it takes over:
 *  0.0s  the four brackets close in from wider apart (expo out, 70ms apart);
 *  0.55s one lime scan line sweeps down the terminal, as the screen starts verifying (0.6s);
 *  2.1s  the screen turns to Welcome, its tick drawing;
 *  2.25s the "Verified · Face · Entrance A" chip springs in and its tick draws;
 *  2.4s  the border beam runs round the frame twice (2s) and fades: the frame stands by 4.7s;
 *  4.9s  after the approved 2.35s hold, the screen loop starts and repeats.
 */
export function heroTimeline(p: HeroParts) {
  gsap.set(p.brackets, { xPercent: -34, yPercent: -34, opacity: 0 });
  // Above the scan window (it clips), so already lit: it shows as it enters.
  gsap.set(p.scan, { yPercent: -100, opacity: 1 });
  gsap.set(p.beam, { opacity: 0, "--beam-angle": "0deg" });
  gsap.set(p.chip, { opacity: 0, y: 12, scale: 0.9 });
  gsap.set(p.chipTick, { drawSVG: "0%" });
  gsap.set(p.screens.idle, { opacity: 1, scale: 1 });
  gsap.set([p.screens.scan, p.screens.verified], { opacity: 0, scale: 0.98 });
  gsap.set(p.light, { opacity: 0 });
  gsap.set(p.disc, { scale: 0.6 });
  gsap.set(p.tick, { drawSVG: "0%" });

  const verifiedAt = SCAN_AT + SCAN_TO_VERIFIED;
  const tl = gsap.timeline();
  tl.to(p.brackets, { xPercent: 0, yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.07 }, 0)
    .to(p.scan, { yPercent: 0, duration: 1.2, ease: "power2.inOut" }, 0.55)
    .to(p.scan, { opacity: 0, duration: 0.2 }, 1.55);
  scanning(tl, p, SCAN_AT);
  verify(tl, p, verifiedAt);
  tl.to(p.chip, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.8)" }, verifiedAt + 0.15)
    .to(p.chipTick, { drawSVG: "100%", duration: 0.4, ease: "power2.out" }, verifiedAt + 0.4)
    .to(p.beam, { opacity: 1, duration: 0.25 }, verifiedAt + 0.3)
    .to(p.beam, { "--beam-angle": "720deg", duration: 2, ease: "none" }, verifiedAt + 0.3)
    .to(p.beam, { opacity: 0, duration: 0.3 }, verifiedAt + 2);
  tl.add(screenLoop(p), verifiedAt + FADE + VERIFIED_HOLD);
  return tl;
}

/**
 * From 1024px, as the hero scrolls away: the brackets open slightly outward, the terminal eases down to 0.96 and the
 * chip fades, scrubbed with the scroll. Transform and opacity only; no text moves (CLAUDE.md §3: no parallax on text).
 */
export function heroExit(p: HeroParts, hero: HTMLElement) {
  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
    })
    .to(p.corners, { xPercent: -14, yPercent: -14, duration: 1 }, 0)
    .to(p.device, { scale: 0.96, duration: 1, ease: "power1.in" }, 0)
    .to(p.anchor, { opacity: 0, duration: 0.6 }, 0);
}
