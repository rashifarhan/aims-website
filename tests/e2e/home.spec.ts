import { expect, test } from "@playwright/test";
import { builtRoutes } from "../../src/lib/routes";

for (const locale of ["en", "ar"] as const) {
  const home = locale === "en" ? "/" : "/ar";
  test(`${locale} homepage has working product routes, factual counts and SEO`, async ({ page }) => {
    await page.goto(home);
    const main = page.getByRole("main");
    await expect(main.locator("h1")).toContainText(
      locale === "en" ? "Access control & attendance," : "التحكم في الدخول والحضور،",
    );
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "en" ? "ltr" : "rtl");
    const families = main.locator("#families");
    const counts = [20, 34, 29, 15, 55, 6];
    const slugs = ["time-attendance", "access-control", "entrance-control", "door-locks", "door-hardware", "pos"];
    for (const [index, slug] of slugs.entries()) {
      const link = families.locator(`a[href="${locale === "ar" ? "/ar" : ""}/products/${slug}"]`);
      await expect(link).toContainText(String(counts[index]));
    }
    await expect(main).not.toContainText("Project setup is in place");
    await expect(main).not.toContainText("Authorized ZKTeco Distributor");
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://aimsuae.me${home === "/" ? "" : home}`,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const localLinks = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => new URL((link as HTMLAnchorElement).href).pathname.replace(/^\/ar(?=\/|$)/, "") || "/"),
      );
    const available = new Set(builtRoutes().map((route) => route.path));
    expect([...new Set(localLinks)].filter((path) => !available.has(path))).toEqual([]);
    const data = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(data ?? "{}")["@type"]).toBe("Organization");
  });

  test(`${locale} door drawing has a text equivalent and external links announce themselves`, async ({ page }) => {
    await page.goto(home);
    const main = page.getByRole("main");
    // Design Doc 14: explainers have a text equivalent (the step list).
    const parts = main.locator(".home-door-parts li");
    await expect(parts).toHaveCount(6);
    await expect(parts.nth(2)).toContainText("AL-M280");
    // Every link that leaves the preview says so to screen readers, not only with a ↗ glyph.
    const external = main.locator('section a[href^="https://"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const link of await external.all()) {
      await expect(link.locator(".sr-only")).toHaveCount(1);
    }
  });

  test(`${locale} FAQ works by keyboard and narrow layout reflows`, async ({ page }) => {
    await page.goto(home);
    const details = page.locator("#faq details");
    await expect(details).toHaveCount(6);
    const summary = details.first().locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(details.first()).toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(details.first()).not.toHaveAttribute("open", "");
    for (const width of [390, 320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test("hero respects reduced motion and pauses off-screen", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator("[data-hero-animation]");
  await expect(hero).toHaveAttribute("data-state", "verified");
  await expect(hero.locator('[data-screen="verified"]')).toBeVisible();
  expect(
    await hero.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(() =>
      hero.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    )
    .toBeGreaterThan(0);
  // After the prototype's 450ms return transition, idle holds until the next scan.
  await hero.locator("[data-screen]").evaluateAll((screens) => {
    for (const screen of screens) for (const animation of screen.getAnimations()) animation.currentTime = 1900 + 4900;
  });
  await expect(hero.locator('[data-screen="idle"]')).toHaveCSS("opacity", "1");
  await expect(hero.locator('[data-screen="verified"]')).toHaveCSS("opacity", "0");
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      hero.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    )
    .toBe(0);
});

test("desktop hero artwork stays clear of English and Arabic copy", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ["/", "/ar"]) {
    await page.goto(path);
    const title = await page.locator("#home-title").boundingBox();
    const device = await page.locator(".home-device").boundingBox();
    expect(title).not.toBeNull();
    expect(device).not.toBeNull();
    if (title && device) {
      expect(path === "/" ? title.x + title.width <= device.x : device.x + device.width <= title.x).toBe(true);
    }
  }
});
