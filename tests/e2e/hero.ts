import type { Page } from "@playwright/test";

/*
 * Helpers for the home hero's GSAP motion (README Decisions, "Hero choreography with GSAP"). GSAP tweens write inline
 * styles, not CSS or Web Animations, so the specs read computed styles and the art's `data-state` / `data-playing`.
 */

/** The frame's parts, which enter once and then stand. */
const FRAME = [".home-corner svg", ".home-frame-scan i", ".home-frame-beam", ".home-verified-chip"];
/** The device screen's parts, which keep looping. */
const SCREEN = ["[data-screen]", "[data-beam]", ".home-device-tick", ".home-device-tick path", ".home-wash-verified"];

/** Computed opacity, transform, dash and beam angle of the parts the timeline drives on the clock (not the scroll). */
const heroClockFrame = (page: Page, parts: "frame" | "all" = "all") =>
  page.locator(".home-stage").evaluate(
    (stage, selectors) =>
      JSON.stringify(
        selectors.flatMap((selector) =>
          [...stage.querySelectorAll(selector)].map((el) => {
            const style = getComputedStyle(el);
            return [style.opacity, style.transform, style.strokeDasharray, style.getPropertyValue("--beam-angle")];
          }),
        ),
      ),
    parts === "frame" ? FRAME : [...FRAME, ...SCREEN],
  );

/** True when nothing the clock drives (in the frame, or anywhere) changes over `ms`. */
export async function heroStill(page: Page, ms: number, parts: "frame" | "all" = "all") {
  const before = await heroClockFrame(page, parts);
  await page.waitForTimeout(ms);
  return before === (await heroClockFrame(page, parts));
}

/** Records every inline style the timeline writes on the frame's parts, with its time, from the first paint. */
export async function recordHeroFrame(page: Page) {
  await page.addInitScript(() => {
    const log: { part: string; t: number; style: string }[] = [];
    Object.assign(window, { __heroLog: log });
    const parts: Record<string, string> = {
      bracket: ".home-corner-ee svg",
      scan: ".home-frame-scan i",
      chip: ".home-verified-chip",
      beam: ".home-frame-beam",
    };
    document.addEventListener("DOMContentLoaded", () => {
      for (const [part, selector] of Object.entries(parts)) {
        const el = document.querySelector<HTMLElement | SVGElement>(selector);
        if (!el) continue;
        new MutationObserver(() => log.push({ part, t: performance.now(), style: el.style.cssText })).observe(el, {
          attributes: true,
          attributeFilter: ["style"],
        });
      }
    });
  });
  return () =>
    page.evaluate(() => (window as unknown as { __heroLog: { part: string; t: number; style: string }[] }).__heroLog);
}
