import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  ["/zkteco-distributor-in-dubai", "en", "/ar/zkteco-dubai"],
  ["/zkteco-distributor-in-oman", "en", "/ar/zkteco-distributor-in-oman"],
  ["/zkteco-distributors-in-kenya", "en", "/ar/zkteco-distributors-in-kenya"],
  ["/ar/zkteco-dubai", "ar", "/zkteco-distributor-in-dubai"],
  ["/ar/zkteco-distributor-in-oman", "ar", "/zkteco-distributor-in-oman"],
  ["/ar/zkteco-distributors-in-kenya", "ar", "/zkteco-distributors-in-kenya"],
] as const;

for (const [path, locale, counterpart] of pages) {
  test(`${path} has accessible T7 content, canonical and language counterpart`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.locator("h1")).toHaveCount(1);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://aimsuae.me${path}`);
    await expect(page.locator(`link[hreflang="${locale === "ar" ? "en" : "ar"}"]`)).toHaveAttribute(
      "href",
      `https://aimsuae.me${counterpart}`,
    );
    await expect(page.locator(".location-products article")).toHaveCount(4);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator(".location-support .locations-primary").hover();
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    const switcher = page.locator(`header a[hreflang="${locale === "ar" ? "en" : "ar"}"]`).filter({ visible: true });
    await switcher.click();
    await expect(page).toHaveURL(new RegExp(`${counterpart}$`));
  });
}

for (const [market, country] of [
  ["oman", "Oman"],
  ["kenya", "Kenya"],
] as const) {
  test(`${country} product addition retains existing lines and sets the export destination`, async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("aims.quote.v1"))
        localStorage.setItem(
          "aims.quote.v1",
          JSON.stringify({ v: 1, updatedAt: Date.now(), lines: [{ kind: "product", slug: "al-m280", qty: 3 }] }),
        );
    });
    await page.goto(market === "oman" ? "/zkteco-distributor-in-oman" : "/zkteco-distributors-in-kenya");
    await page.locator('.location-products article[data-model="f18"] button').click();
    await page.goto("/quote");
    await expect(page.locator("#quote-country")).toHaveValue(country);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("aims.quote.v1") ?? "{}").lines)).toEqual(
      expect.arrayContaining([
        { kind: "product", slug: "al-m280", qty: 3 },
        { kind: "product", slug: "f18", qty: 1 },
      ]),
    );
    await page.reload();
    await expect(page.locator("#quote-country")).toHaveValue(country);
  });

  test(`${country} hero quote carries its destination without claiming local premises`, async ({ page }) => {
    await page.goto(market === "oman" ? "/zkteco-distributor-in-oman" : "/zkteco-distributors-in-kenya");
    await expect(page.locator(".location-hero")).toContainText("Delivered from Dubai");
    await expect(page.locator("main")).not.toContainText(
      /(?:we have|visit our|AIMS has) (?:an? )?(?:office|showroom) in (?:Oman|Kenya)|30 minutes|next.day/i,
    );
    await page.locator(".location-hero .locations-primary").click();
    await expect(page.locator("#quote-country")).toHaveValue(country);
  });
}

test("Dubai retains showroom directions and guarded phone contact", async ({ page }) => {
  await page.goto("/zkteco-distributor-in-dubai");
  await expect(page.locator("main")).toContainText("Showroom #14, Naif Bazar Building");
  await expect(page.locator('main a[href="https://maps.app.goo.gl/JJvK9uCbyHMoK4J1A"]')).toHaveCount(1);
  await page.locator('main a[href="tel:+97148808445"]').click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Dubai aliases are single-hop 301s", async ({ request }) => {
  for (const [from, to] of [
    ["/ar/zkteco-distributor-in-dubai", "/ar/zkteco-dubai"],
    ["/zkteco-dubai", "/zkteco-distributor-in-dubai"],
  ]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(new URL(res.headers().location, "http://localhost").pathname).toBe(to);
  }
});

test("the phone hero fits the first screen", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zkteco-distributor-in-oman");
  await page.evaluate(() => document.fonts.ready);
  expect((await page.locator(".location-hero").boundingBox())?.height).toBeLessThanOrEqual(784);
});

test("tablet navigation stays on one line", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/zkteco-distributor-in-oman");
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() =>
      page
        .locator("header nav > ul > li > a > span:first-child")
        .evaluateAll((nodes) => Math.max(...nodes.map((node) => node.getBoundingClientRect().height))),
    )
    .toBeLessThanOrEqual(24);
});

test("route map runs once and settles when reduced motion changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/zkteco-distributor-in-oman");
  const map = page.locator(".location-page .reach-map");
  await map.scrollIntoViewIfNeeded();
  await expect(map).toHaveAttribute("data-played", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => map.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
  await page.locator("h1").scrollIntoViewIfNeeded();
  await map.scrollIntoViewIfNeeded();
  await expect.poll(() => map.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test("T7 remains readable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/ar/zkteco-dubai`);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".location-products article")).toHaveCount(4);
  await expect(page.locator(".reach-map")).toBeVisible();
  await context.close();
});

test("keyboard users can skip to content and keep focus after adding a model", async ({ page }) => {
  await page.goto("/zkteco-distributors-in-kenya");
  await page.keyboard.press("Tab");
  await expect(page.locator('header > a[href="#main"]')).toBeFocused();
  await page.keyboard.press("Enter");
  const add = page.locator('.location-products article[data-model="f18"] button');
  await add.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.locator('.location-products article[data-model="f18"] button:not(:disabled)').first(),
  ).toBeFocused();
  await page.locator(".location-products .locations-primary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#quote-country")).toHaveValue("Kenya");
});
