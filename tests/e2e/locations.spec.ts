import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("delivery map plays once when visible and rests under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/locations");
  const map = page.locator(".locations-hub .reach-map");
  await map.scrollIntoViewIfNeeded();
  await expect(map).toHaveAttribute("data-played", "true");
  await expect
    .poll(() =>
      map.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "finished").length),
    )
    .toBe(6);
  await page.locator("h1").scrollIntoViewIfNeeded();
  await map.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      map.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    )
    .toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => map.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const locale of ["en", "ar"]) {
  test(`${locale} locations hub routes visits and export destinations`, async ({ page }, info) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("aims.quote.v1"))
        localStorage.setItem(
          "aims.quote.v1",
          JSON.stringify({ v: 1, updatedAt: Date.now(), lines: [{ kind: "product", slug: "f18", qty: 2 }] }),
        );
    });
    const path = locale === "en" ? "/locations" : "/ar/locations";
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".locations-offices article")).toHaveCount(3);
    await expect(page.locator('main a[href="https://maps.app.goo.gl/JJvK9uCbyHMoK4J1A"]')).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 1440) {
        await expect(page.locator('label[for="header-search"]')).toBeVisible();
        const bounds = await page
          .locator(".locations-offices, .locations-faq dl")
          .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
        expect(Math.abs(bounds[0] - bounds[1])).toBeLessThanOrEqual(1);
        expect((await page.locator("#uae").boundingBox())?.height).toBeLessThanOrEqual(902);
      }
      if (width !== 320)
        await page.screenshot({ path: info.outputPath(`locations-${locale}-${width}.png`), fullPage: true });
    }
    await page.locator(".locations-markets .locations-primary").hover();
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
    const kenya = page.locator('main a[href$="zkteco-distributors-in-kenya"]');
    await kenya.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".location-hero")).toBeVisible();
    await page.locator(".location-hero .locations-primary").click();
    await expect(page.locator("#quote-country")).toHaveValue("Kenya");
    await page.goto(locale === "en" ? "/quote" : "/ar/quote");
    await page.reload();
    await expect(page.locator("#quote-country")).toHaveValue("Kenya");
  });
}
