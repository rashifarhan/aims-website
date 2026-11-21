import { expect, test } from "@playwright/test";

const PATH = "/solutions/time-attendance";

for (const locale of ["en", "ar"] as const) {
  const path = locale === "ar" ? `/ar${PATH}` : PATH;
  test(`${locale} time attendance page: one H1, method counts match the listing, local links only`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));

    // Method guide: four options, each opening a filtered listing that returns 200.
    const methods = page.locator(".method-card");
    await expect(methods).toHaveCount(4);
    for (const href of await methods.evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""))) {
      expect(href).toMatch(/\/products\/time-attendance\?verify=/);
      expect((await request.get(href)).status()).toBe(200);
    }
    // Six terminals, each with a model link and Add to quote.
    await expect(page.locator(".pick-card")).toHaveCount(6);
    await expect(
      page.locator(".pick-card").getByRole("button", { name: /Add to quote|أضف إلى عرض السعر/ }),
    ).toHaveCount(6);
    // Both quote actions preset the installation need (Design Doc 12).
    await expect(page.locator(`main a[href="${locale === "ar" ? "/ar" : ""}/quote?need=install"]`)).toHaveCount(2);
  });
}

test("story steps follow the scroll and the drawing reaches the payroll file", async ({ page }) => {
  await page.goto(PATH);
  const story = page.locator(".story");
  await expect(story).toHaveAttribute("data-motion", "on");
  const steps = page.locator("[data-story-step]");
  await expect(steps).toHaveCount(4);
  for (const n of [1, 2, 3, 4]) {
    await steps.nth(n - 1).evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(story).toHaveAttribute("data-step", String(n));
    await expect(steps.nth(n - 1)).toHaveAttribute("aria-current", "step");
  }
  await expect(page.locator(".ta-file")).toHaveCSS("opacity", "1");
});

test("reduced motion shows the final drawing with every step readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH);
  const story = page.locator(".story");
  await expect(story).toHaveAttribute("data-motion", "off");
  await expect(story).toHaveAttribute("data-step", "4");
  for (const row of await page.locator(".ta-row").all()) await expect(row).toHaveCSS("opacity", "1");
  for (const step of await page.locator("[data-story-step] h3").all())
    await expect(step).toHaveCSS("color", "rgb(14, 21, 18)");
  expect(
    await story.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
  ).toBe(0);
});

test("adding a terminal updates the quote, and the quote opens with installation chosen", async ({ page }) => {
  await page.goto(PATH);
  const card = page.locator(".pick-card").first();
  await card.getByRole("button", { name: "Add to quote" }).click();
  await expect(card.getByText("In quote")).toBeVisible();
  await page.locator('.t3-cta a[href="/quote?need=install"]').click();
  await expect(page).toHaveURL(/\/quote\?need=install$/);
  await expect(page.getByRole("radio", { name: "Supply and installation" })).toBeChecked();
  // Next keeps the previous page mounted but display:none (React Activity); query the visible landmark.
  await expect(page.getByRole("main")).toContainText("Biopro MH20");
});

test("phones scroll the terminals sideways without widening the page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PATH);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const row = page.locator(".pick-row");
  expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
