import { expect, test } from "@playwright/test";

/*
 * Homepage motion (taste motion.md, three layers; CLAUDE.md §3): the hero enters and loops with a pause
 * button, the door and the reach map each play once when they come into view, and scrolling reveals
 * nothing else.
 */

const runningOutsideHero = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running" && !(a.effect as KeyframeEffect).target?.closest(".home-hero")).length,
  );

test("reduced motion: the moments rest at their final state and nothing moves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  await expect(page.locator(".door-granted")).toHaveCSS("opacity", "1");
  await expect(page.locator(".reach-route").first()).toHaveCSS("stroke-dashoffset", "0px");
  await expect(page.locator(".home-motion-toggle")).toHaveCount(0);
  expect(await runningOutsideHero(page)).toBe(0);
});

test("no section fades or rises in on scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-reveal], [data-scene]")).toHaveCount(0);
  await expect(page.locator(".home-family-card").first()).toHaveCSS("opacity", "1");
});

// Approved motion redesign: the desktop door is reversible; phones retain a finite one-shot.
test("the door follows native scroll and has a complete phone fallback", async ({ page }) => {
  await page.goto("/");
  const door = page.locator(".home-door");
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await expect(door).toHaveAttribute("data-mode", "scroll");
    await door.evaluate((el) => {
      const box = el.getBoundingClientRect();
      scrollTo(0, scrollY + box.top + box.height - innerHeight);
    });
    await expect(door.locator(".door-granted")).toHaveCSS("opacity", "1");
    await page.evaluate(() => scrollTo(0, 0));
    await expect(door.locator(".door-granted")).toHaveCSS("opacity", "0");
  } else {
    await expect(door).toHaveAttribute("data-mode", "once");
    await door.locator(".home-door-drawing").scrollIntoViewIfNeeded();
    await expect(door.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
  }
});

test("the reach map draws its routes once and then stands still", async ({ page }) => {
  await page.goto("/");
  const reach = page.locator(".home-reach");
  await page.locator(".home-reach-map").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(reach).toHaveAttribute("data-played", "true");
  await expect(page.locator(".reach-route").last()).toHaveCSS("stroke-dashoffset", "0px", { timeout: 4000 });
  await expect.poll(() => runningOutsideHero(page), { timeout: 4000 }).toBe(0);
});

test("the hero animation has a pause button that stops it", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /pause animation/i });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
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
