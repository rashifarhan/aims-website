import { expect, test } from "@playwright/test";
import { heroStill, recordHeroFrame } from "./hero";
import { expectReachFinished, expectReachResting, expectReachWaiting } from "./reach";

/*
 * Homepage motion (taste motion.md; CLAUDE.md §3 as updated by the client, and client decisions 4 and 7, 24 Nov
 * 2026): the hero enters once (the verified frame locks on, one scan, the chip springs in, the beam runs; one GSAP
 * timeline since 25 Nov 2026) and its screen loops with a pause button; section titles rise once through GSAP SplitText
 * and blocks reveal with native scroll; under reduced motion everything rests whole.
 * The door teaser left the home page (client decision 6; covered on the access control spec). The reach map came back
 * with the locations preview (client decision, 25 Nov 2026) as the page's dealt moment: it draws once in view.
 */

const runningOutsideHero = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (a) =>
            a.playState === "running" &&
            a.timeline instanceof DocumentTimeline &&
            !(a.effect as KeyframeEffect).target?.closest(".home-hero"),
        ).length,
  );

test("reduced motion: everything rests at its final state and nothing moves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  await expect(page.locator(".home-motion-toggle")).toHaveCount(0);
  await expect(page.locator("[data-hero-animation]")).toHaveAttribute("data-state", "verified");
  await expect(page.locator(".home-verified-chip")).toHaveCSS("opacity", "1");
  await expect(page.locator(".home-corner svg")).toHaveCount(4);
  for (const bracket of await page.locator(".home-corner svg").all()) await expect(bracket).toHaveCSS("opacity", "1");
  await expect(page.locator('[data-screen="verified"]')).toHaveCSS("opacity", "1");
  // No scrub either: scrolled, the hero's parts carry no GSAP style and stand still.
  await page.evaluate(() => scrollTo(0, innerHeight / 2));
  await expect(page.locator(".home-device[style], .home-corner > i[style], .home-verified-anchor[style]")).toHaveCount(
    0,
  );
  expect(await heroStill(page, 600)).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(page.locator(".home-family-grid")).toHaveCSS("opacity", "1");
  // No title is split or hidden: the GSAP heading reveal never loads under reduced motion.
  await page.locator("#closing-title").scrollIntoViewIfNeeded();
  await expect(page.locator(".heading-line")).toHaveCount(0);
  await expect(page.locator("#families-title")).not.toHaveAttribute("aria-label");
  await expectReachResting(page.locator("#showrooms .ui-reach-map"));
  expect(await runningOutsideHero(page)).toBe(0);
});

test("the reach map draws its routes once in view and then stands still", async ({ page }) => {
  await page.goto("/");
  const map = page.locator("#showrooms .ui-reach-map");
  const routes = map.locator(".reach-route");
  // Off screen the routes wait undrawn, so the draw is never spent where nobody sees it.
  await expectReachWaiting(map);
  await map.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(routes).toHaveCount(6);
  await expectReachFinished(map);
});

test("the verified frame locks on once, in order, then stands still", async ({ page }) => {
  const log = await recordHeroFrame(page);
  await page.goto("/");
  const art = page.locator("[data-hero-animation]");
  await expect(art).toHaveAttribute("data-state", "animated");
  await expect(page.locator(".home-verified-chip")).toHaveCSS("opacity", "1", { timeout: 6000 });
  // Everything the frame does is finite: within 5 s of the timeline's first frame it stands, the beam gone.
  await expect.poll(() => heroStill(page, 400, "frame"), { timeout: 8000 }).toBe(true);
  await expect(page.locator(".home-frame-beam")).toHaveCSS("opacity", "0");
  await expect(page.locator(".home-frame-scan i")).toHaveCSS("opacity", "0");
  for (const bracket of await page.locator(".home-corner svg").all()) {
    await expect(bracket).toHaveCSS("opacity", "1");
    await expect(bracket).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  }
  const entries = await log();
  const of = (part: string) => entries.filter((entry) => entry.part === part);
  const start = Math.min(...entries.map((entry) => entry.t));
  // The brackets close in from wider apart: outward is (-x, -y) inside each mirrored corner (HeroFrame).
  expect(of("bracket")[0].style).toMatch(/translate\(-\d+(\.\d+)?%, -\d+(\.\d+)?%\)/);
  expect(of("bracket")[0].style).toContain("opacity: 0");
  expect(of("bracket").at(-1)?.style).toContain("opacity: 1");
  expect(Math.max(...entries.map((entry) => entry.t)) - start).toBeLessThanOrEqual(5000);
  // In order: the brackets, then the scan line, then the chip, then the beam (each part's first move after the
  // timeline's opening frame).
  const firstMove = (part: string) => of(part)[1]?.t ?? Infinity;
  expect(firstMove("bracket")).toBeLessThan(firstMove("scan"));
  expect(firstMove("scan")).toBeLessThan(firstMove("chip"));
  expect(firstMove("chip")).toBeLessThan(firstMove("beam"));
  await expect(page.locator("[data-signal], .home-signals")).toHaveCount(0);
});

test("the hero exits with the scroll from 1024px, transform and opacity only, no text moving", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-hero-animation]")).toHaveAttribute("data-state", "animated");
  const wide = (page.viewportSize()?.width ?? 0) >= 1024;
  const device = page.locator(".home-device");
  const anchor = page.locator(".home-verified-anchor");
  const scale = () => device.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  const titleTop = () => page.locator("#home-title").evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const before = await titleTop();
  await page.evaluate(() => scrollTo(0, innerHeight * 0.6));
  if (wide) {
    // The terminal eases down toward 0.96, the chip fades, the brackets open outward in their mirrored space.
    await expect.poll(scale).toBeLessThan(0.995);
    expect(await scale()).toBeGreaterThanOrEqual(0.96);
    await expect.poll(() => anchor.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(1);
    const corner = await page
      .locator(".home-corner > i")
      .first()
      .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
    expect(corner.e).toBeLessThan(0);
    expect(corner.f).toBeLessThan(0);
  } else {
    // Below 1024px the exit does not read, so there is none.
    await page.waitForTimeout(800);
    expect(await scale()).toBe(1);
    await expect(anchor).toHaveCSS("opacity", "1");
  }
  // No parallax on text: the headline scrolls with the page, exactly.
  expect(await titleTop()).toBeCloseTo(before, 0);
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(scale).toBe(1);
});

test("section titles rise out of masked lines once, and blocks reveal with native scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-scene]")).toHaveCount(0);
  const card = page.locator(".home-family-grid");
  const title = page.locator("#families-title");
  // Below the fold the title waits split into masked lines, its words hidden, its text kept as its accessible name.
  await expect(title.locator(".heading-line-mask").first()).toBeAttached();
  const text = (await title.getAttribute("aria-label")) ?? "";
  expect(text.length).toBeGreaterThan(0);
  await expect(title).toHaveAccessibleName(text);
  await expect(title.locator(".heading-line div").first()).toHaveCSS("opacity", "0");
  // No h1 and nothing on the first screen is ever split (LCP and first paint untouched).
  await expect(page.locator("h1 .heading-line, .home-hero .heading-line")).toHaveCount(0);
  // The block waits for its CSS view timeline.
  await expect(card).not.toHaveCSS("opacity", "1");
  await card.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(card).toHaveCSS("opacity", "1");
  // Played once, the split reverts: the resting title is the server's plain text again.
  await expect(title.locator(".heading-line")).toHaveCount(0, { timeout: 4000 });
  await expect(title).toHaveText(text);
  await expect(title).not.toHaveAttribute("aria-label");
  const timelines = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.timeline && !(a.timeline instanceof DocumentTimeline))
      .map((a) => a.timeline?.constructor.name),
  );
  expect(timelines.length).toBeGreaterThan(0);
  expect(new Set(timelines)).toEqual(new Set(["ViewTimeline"]));
});

test("Arabic titles rise as whole lines, so no word is broken apart", async ({ page }) => {
  await page.goto("/ar");
  const title = page.locator("#families-title");
  await expect(title.locator(".heading-line").first()).toBeAttached();
  // Lines only: each line keeps its words as one text run (letters join, Latin names keep their bidi order).
  await expect(title.locator(".heading-line div")).toHaveCount(0);
  await expect(title.locator(".heading-line").first()).toHaveCSS("opacity", "0");
  await title.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(title.locator(".heading-line")).toHaveCount(0, { timeout: 4000 });
});

test("titles below the home journey's pin rise when they reach the viewport, not screens early", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("#closing-title");
  await expect(title.locator(".heading-line-mask").first()).toBeAttached();
  // Two screens above the title it still waits: its trigger counts the journey's pin spacer.
  await title.evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 2));
  await page.waitForTimeout(600);
  await expect(title.locator(".heading-line div").first()).toHaveCSS("opacity", "0");
  await title.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(title.locator(".heading-line")).toHaveCount(0, { timeout: 4000 });
});

test("the hero animation has a pause button that stops it", async ({ page }) => {
  await page.goto("/");
  const art = page.locator("[data-hero-animation]");
  const toggle = page.getByRole("button", { name: /pause animation/i });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(art).toHaveAttribute("data-playing", "true");
  // The client asked for no visible button over the hero (24 Nov 2026): it shows only on keyboard focus, so the
  // test reaches it the way its users do, by keyboard.
  await toggle.focus();
  await expect(toggle).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(art).toHaveAttribute("data-playing", "false");
  expect(await heroStill(page, 1200)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(art).toHaveAttribute("data-playing", "true");
});

/*
 * Regression: Next 16 segment prefetch plus the locale rewrite once looped on the homepage segment
 * (~2,400 RSC requests in 5 s, 22 Nov 2026). prefetchSafe() keeps those links off prefetch.
 */
for (const path of ["/", "/ar", "/products", "/solutions/time-attendance", "/quote"]) {
  test(`no prefetch storm on ${path}`, async ({ page }) => {
    let rsc = 0;
    page.on("request", (request) => {
      if (request.headers()["rsc"] === "1" || request.url().includes("_rsc=")) rsc += 1;
    });
    await page.goto(path);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);
    expect(rsc).toBeLessThan(80);
  });
}

// Client decision, 25 Nov 2026: the model-code strip runs on its own as a ticker, not with the scroll. It loops past
// 5 s, so it must pause by keyboard (WCAG 2.2.2), hold still while a code has focus, and rest under reduced motion.
test("the model strip runs on its own and pauses by keyboard", async ({ page }) => {
  await page.goto("/");
  const strip = page.locator(".model-strip");
  await strip.scrollIntoViewIfNeeded();
  const track = strip.locator(".model-strip-track");
  const offset = () => track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  const first = await offset();
  await expect.poll(offset, { timeout: 3000 }).not.toBe(first);
  const toggle = strip.getByRole("button", { name: /pause/i });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await page.locator("h1").focus();
  const held = await offset();
  await page.waitForTimeout(600);
  expect(await offset()).toBe(held);
});

test("the model strip rests as one list under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const strip = page.locator(".model-strip");
  await expect(strip.locator(".model-strip-list[aria-hidden='true']")).toBeHidden();
  await expect(strip.getByRole("button", { name: /pause/i })).toBeHidden();
  await expect(strip.locator(".model-strip-track")).toHaveCSS("animation-name", "none");
});
