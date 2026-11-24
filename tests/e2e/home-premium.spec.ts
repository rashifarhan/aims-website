import { expect, test } from "@playwright/test";

/*
 * Homepage motion (taste motion.md; CLAUDE.md §3 as updated by the client, and client decisions 4 and 7, 24 Nov
 * 2026): the hero enters once (the verified frame locks on, one scan, the tick lights) and its screen loops with a
 * pause button; section headings and blocks reveal with native scroll; under reduced motion everything rests whole.
 * The door teaser and the reach map left the home page (client decision 6); their motion is covered on the access
 * control, contact and locations specs.
 */

const runningOutsideHero = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running" && !(a.effect as KeyframeEffect).target?.closest(".home-hero")).length,
  );

test("reduced motion: everything rests at its final state and nothing moves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  await expect(page.locator(".home-motion-toggle")).toHaveCount(0);
  await expect(page.locator(".home-verified-chip")).toHaveCSS("opacity", "1");
  await expect(page.locator(".home-corner").first()).toHaveCSS("opacity", "1");
  await expect(page.locator(".home-family-grid")).toHaveCSS("opacity", "1");
  await expect(page.locator(".split-word > span").first()).toHaveCSS("transform", "none");
  expect(await runningOutsideHero(page)).toBe(0);
});

test("the verified frame locks on once, then stands still", async ({ page }) => {
  await page.goto("/");
  const frame = page.locator(".home-frame");
  await expect(page.locator(".home-verified-chip")).toHaveCSS("opacity", "1", { timeout: 5000 });
  await expect(frame.locator(".home-corner").last()).toHaveCSS("opacity", "1");
  // Every entrance animation in the frame (corners, scan, border beam) is finite and done within 5 s.
  await expect
    .poll(
      () => frame.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
      { timeout: 6000 },
    )
    .toBe(0);
  await expect(page.locator("[data-signal], .home-signals")).toHaveCount(0);
});

test("section headings and blocks reveal with native scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-scene]")).toHaveCount(0);
  const card = page.locator(".home-family-grid");
  const word = page.locator("#families-title .split-word > span").first();
  // Below the fold the block waits; scrolled into view it stands whole, driven by the scroll position alone.
  await expect(card).not.toHaveCSS("opacity", "1");
  await card.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(card).toHaveCSS("opacity", "1");
  await expect(word).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  const timelines = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.timeline && !(a.timeline instanceof DocumentTimeline))
      .map((a) => a.timeline?.constructor.name),
  );
  expect(timelines.length).toBeGreaterThan(0);
  expect(new Set(timelines)).toEqual(new Set(["ViewTimeline"]));
});

test("the hero animation has a pause button that stops it", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /pause animation/i });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  // The client asked for no visible button over the hero (24 Nov 2026): it shows only on keyboard focus, so the
  // test reaches it the way its users do, by keyboard.
  await toggle.focus();
  await expect(toggle).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  const running = () =>
    page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a.playState === "running" && (a.effect as KeyframeEffect).target?.closest(".home-hero-art"))
          .length,
    );
  await expect.poll(running, { timeout: 3000 }).toBe(0);
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
