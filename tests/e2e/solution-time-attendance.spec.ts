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
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    // Phones play the four stages in order while the drawing is in view; every stage is shown, none skipped.
    await story.evaluate((el) => {
      const seen: string[] = [];
      (window as unknown as { storySteps: string[] }).storySteps = seen;
      new MutationObserver(() => {
        const step = el.getAttribute("data-step");
        if (step && seen.at(-1) !== step) seen.push(step);
      }).observe(el, { attributeFilter: ["data-step"] });
    });
    await page.locator(".story-stage").scrollIntoViewIfNeeded();
    await expect(story).toHaveAttribute("data-step", "4");
    expect(await page.evaluate(() => (window as unknown as { storySteps: string[] }).storySteps)).toEqual([
      "2",
      "3",
      "4",
    ]);
    await expect(steps.nth(3)).toHaveAttribute("aria-current", "step");
  } else
    for (const n of [1, 2, 3, 4, 3, 2, 1, 4]) {
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
  await page.locator('.ui-close a[href="/quote?need=install"]').click();
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

// T12: the hero leads with the F18 photograph, preloaded as the LCP image.
test("the hero shows the F18 photograph beside the copy", async ({ page }) => {
  await page.goto(PATH);
  const photo = page.locator(".page-hero-media img");
  await expect(photo).toBeVisible();
  await expect(photo).toHaveAttribute("src", /f18/);
  // Next 16's `preload` loads the LCP photo early through a preload link (CLAUDE.md §5).
  await expect(page.locator('link[rel="preload"][as="image"][imagesrcset*="f18"]')).toHaveCount(1);
  // The entrance plays once and stands.
  const iterations = await page
    .locator(".page-hero-grid")
    .evaluate((el) => el.getAnimations({ subtree: true }).map((a) => a.effect?.getTiming().iterations));
  expect(iterations.every((n) => n === 1)).toBe(true);
});

test("reduced motion: the hero is still and the story steps keep their natural height", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PATH);
  await expect(page.locator(".story")).toHaveAttribute("data-motion", "off");
  for (const step of await page.locator("[data-story-step]").all())
    expect((await step.boundingBox())?.height ?? 0).toBeLessThan(900 * 0.55 - 1);
  for (const part of await page.locator(".hero-enter, .page-hero-media").all())
    await expect(part).toHaveCSS("opacity", "1");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("story steps keep their natural height", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PATH);
    for (const step of await page.locator("[data-story-step]").all())
      expect((await step.boundingBox())?.height ?? 0).toBeLessThan(844 * 0.4 - 1);
  });
});

// Micro VERIFY on the header Quote badge: a rise shows the tick; loading a page with items does not.
test("the header quote badge verifies an addition, not a page load", async ({ page }) => {
  await page.goto(PATH);
  await page.evaluate(() =>
    localStorage.setItem(
      "aims.quote.v1",
      JSON.stringify({ v: 1, updatedAt: Date.now(), lines: [{ kind: "product", slug: "f18", qty: 1 }] }),
    ),
  );
  await page.reload();
  const tick = page.locator("header [data-quote-tick]");
  await expect(tick).toHaveCount(1);
  expect(await tick.evaluate((el) => el.getAnimations().length)).toBe(0);
  await expect(tick).toHaveCSS("opacity", "0");
  const card = page.locator(".pick-card").filter({ hasNotText: "F18" }).first();
  await card.getByRole("button", { name: "Add to quote" }).click();
  await page.waitForFunction(
    () => (document.querySelector("header [data-quote-tick]")?.getAnimations().length ?? 0) > 0,
  );
  await expect(page.getByRole("banner").getByRole("link", { name: /Quote 2 items/ })).toBeVisible();
});
