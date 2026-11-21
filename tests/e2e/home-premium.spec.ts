import { expect, test } from "@playwright/test";

test("reduced motion: every section is visible at once and nothing loops", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  for (const el of await page.locator("[data-reveal]").all()) await expect(el).toHaveCSS("opacity", "1");
  await expect(page.locator(".door-granted")).toHaveCSS("opacity", "1");
  await expect(page.locator(".home-proof-band dd").first()).toHaveText("159");
  const running = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running" && !(a.effect as KeyframeEffect).target?.closest(".home-hero")).length,
  );
  expect(running).toBe(0);
});

test("scroll effects reveal sections, assemble the door and count to the real figures", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
  const firstCard = page.locator(".home-family-card").first();
  await expect(firstCard).toHaveCSS("opacity", "0");
  await firstCard.scrollIntoViewIfNeeded();
  await expect(firstCard).toHaveAttribute("data-revealed", "true");

  const door = page.locator(".home-door");
  await page.locator(".home-door-drawing").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(door).toHaveAttribute("data-played", "true");
  await expect(page.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });

  await page.locator(".home-proof-band").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(page.locator(".home-proof-band dd").first()).toHaveText("159", { timeout: 4000 });
});

test("background loops pause when their section leaves the screen", async ({ page }) => {
  await page.goto("/");
  const closing = page.locator(".home-closing");
  await closing.scrollIntoViewIfNeeded();
  await expect(closing).toHaveAttribute("data-inview", "true");
  await expect(closing.locator(".home-glow-a")).toHaveCSS("animation-play-state", "running");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(closing).toHaveAttribute("data-inview", "false");
  await expect(closing.locator(".home-glow-a")).toHaveCSS("animation-play-state", "paused");
});
