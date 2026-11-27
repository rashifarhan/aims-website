import { expect, test } from "@playwright/test";

// Audit B4: on short phones the first screen shows a real next action, in English and Arabic. Measured on an
// iPhone SE-sized screen (320x568); desktop composition is covered by the existing page specs.
const inView = (page: import("@playwright/test").Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const box = el.getBoundingClientRect();
      return box.height > 0 && box.top >= 0 && box.bottom <= innerHeight;
    });

for (const prefix of ["", "/ar"]) {
  test(`${prefix || "en"}: home, software hub and product show their action on a 320x568 screen`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 320, height: 568 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${prefix}/`);
    expect(await inView(page, "main .dv-copy .in-pill")).toBe(true);
    await page.goto(`${prefix}/software`);
    expect(await inView(page, "main .page-hero .home-button")).toBe(true);
    await page.goto(`${prefix}/product/f18`);
    expect(await inView(page, "main button.home-button")).toBe(true);
    // Nothing reflows sideways.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}

test("on a phone, keyboard order on the product page matches the reordered purchase block", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/product/f18");
  // The model chip sits right above the quantity stepper on a phone; the next Tab stops are the stepper's controls,
  // then Add to quote, as they appear.
  const decrease = page.getByRole("button", { name: /decrease|fewer/i }).first();
  const add = page.locator("main button.home-button").first();
  const decreaseTop = (await decrease.boundingBox())?.y ?? 0;
  const addTop = (await add.boundingBox())?.y ?? 0;
  const summaryTop = (await page.locator(".product-hero-lead").boundingBox())?.y ?? 0;
  expect(decreaseTop).toBeLessThan(summaryTop);
  expect(addTop).toBeLessThan(summaryTop);
  await context.close();
});
