import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/*
 * Locations hub and the four T7 location pages (Master Plan 12 #6, #32–35; Design Doc 10.1 T2/T7).
 * The Dubai page has two kept URLs: English /zkteco-distributor-in-dubai, Arabic /ar/zkteco-dubai.
 */
const PAGES = [
  { path: "/locations", lang: "en" },
  { path: "/ar/locations", lang: "ar" },
  { path: "/zkteco-distributor-in-dubai", lang: "en" },
  { path: "/ar/zkteco-dubai", lang: "ar" },
  { path: "/zkteco-distributor-in-oman", lang: "en" },
  { path: "/ar/zkteco-distributor-in-oman", lang: "ar" },
  { path: "/zkteco-distributors-in-kenya", lang: "en" },
  { path: "/ar/zkteco-distributors-in-kenya", lang: "ar" },
] as const;

/** Let the hero entrance and the map's one-time draw finish, so axe audits the settled frame. */
async function settle(page: Page) {
  await page.locator(".loc-reach").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(page.locator(".loc-reach")).toHaveAttribute("data-played", "true");
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}

for (const { path, lang } of PAGES) {
  test(`${path}: 200, one H1, title, self-canonical, breadcrumb JSON-LD, no axe violations`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("h1")).toHaveCount(1);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => scripts.map((el) => el.textContent ?? ""));
    expect(jsonLd.filter((text) => text.includes('"BreadcrumbList"'))).toHaveLength(1);
    await settle(page);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test(`${path}: every local link answers 200`, async ({ page, request }) => {
    await page.goto(path);
    const hrefs = await page
      .locator("main a[href^='/']")
      .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute("href") ?? ""))]);
    expect(hrefs.length).toBeGreaterThan(3);
    for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
  });
}

test("the Dubai page keeps both URLs: aliases 301 straight to their pair, the switch pairs them", async ({
  page,
  request,
}) => {
  for (const [from, to] of [
    ["/zkteco-dubai", "/zkteco-distributor-in-dubai"],
    ["/ar/zkteco-distributor-in-dubai", "/ar/zkteco-dubai"],
  ]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(301);
    expect(new URL(res.headers().location, "http://x").pathname).toBe(to);
  }
  await page.goto("/zkteco-distributor-in-dubai#visit");
  await expect(page.locator('header a[hreflang="ar"]').first()).toHaveAttribute("href", "/ar/zkteco-dubai#visit");
  await page.goto("/ar/zkteco-dubai");
  await expect(page.locator('header a[hreflang="en"]').first()).toHaveAttribute("href", "/zkteco-distributor-in-dubai");
});

test("hub: every listed market is a page or an export quote with its destination", async ({ page }) => {
  await page.goto("/locations");
  const markets = page.locator(".loc-market");
  await expect(markets).toHaveCount(8);
  await expect(page.getByRole("link", { name: /^Oman\b.*supply page/ })).toHaveAttribute(
    "href",
    "/zkteco-distributor-in-oman",
  );
  await expect(page.getByRole("link", { name: /^Bahrain\b.*start an export quote/ })).toHaveAttribute(
    "href",
    "/quote?need=export&country=Bahrain",
  );
});

test("SIGNAL on the hub: the routes draw once when the band comes into view, then stand", async ({ page }) => {
  await page.goto("/locations");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
  const band = page.locator(".loc-reach");
  await expect(band).toHaveAttribute("data-moment");
  await expect(band).not.toHaveAttribute("data-played");
  await expect(band.locator(".reach-route").first()).toHaveCSS("stroke-dashoffset", "1px");
  await band.locator(".loc-reach-map").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(band).toHaveAttribute("data-played", "true");
  await expect(band.locator(".reach-route")).toHaveCount(6);
  await expect(band.locator(".reach-route").last()).toHaveCSS("stroke-dashoffset", "0px", { timeout: 4000 });
  await expect
    .poll(
      () => band.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
      { timeout: 4000 },
    )
    .toBe(0);
});

test("SIGNAL on Oman: one route to Muscat, and the market lights up on arrival", async ({ page }) => {
  await page.goto("/zkteco-distributor-in-oman");
  const band = page.locator(".loc-reach");
  await expect(band.locator(".reach-route")).toHaveCount(1);
  await expect(band.getByRole("img", { name: /Muscat, Oman/ })).toBeAttached();
  await expect(band.locator(".reach-arrive")).toHaveCSS("opacity", "0");
  await band.locator(".loc-reach-map").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(band).toHaveAttribute("data-played", "true");
  await expect(band.locator(".reach-route")).toHaveCSS("stroke-dashoffset", "0px", { timeout: 4000 });
  await expect(band.locator(".reach-arrive")).toHaveCSS("opacity", "0.3", { timeout: 4000 });
});

test("reduced motion: hero and map rest at their final frame, nothing hidden or moving", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/zkteco-distributors-in-kenya");
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  for (const part of await page.locator(".t3-enter, .t3-hero-photo").all())
    await expect(part).toHaveCSS("opacity", "1");
  await expect(page.locator(".reach-route")).toHaveCSS("stroke-dashoffset", "0px");
  await expect(page.locator(".reach-arrive")).toHaveCSS("opacity", "0.3");
  expect(
    await page
      .locator("main")
      .evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
  ).toBe(0);
});

test("destination: adding a model on the Kenya page carries Kenya into the quote", async ({ page }) => {
  await page.goto("/zkteco-distributors-in-kenya");
  await page.locator("#models").getByRole("button", { name: "Add to quote" }).first().click();
  await page.goto("/quote");
  await expect(page.getByRole("radio", { name: /Delivery abroad/ })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Destination country" })).toHaveValue("Kenya");
});

test("destination: an export link presets the market; an unlisted one only sets the need", async ({ page }) => {
  await page.goto("/quote?need=export&country=Bahrain");
  await expect(page.getByRole("radio", { name: /Delivery abroad/ })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Destination country" })).toHaveValue("Bahrain");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/quote?need=export&country=Atlantis");
  await expect(page.getByRole("radio", { name: /Delivery abroad/ })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Destination country" })).toHaveValue("");
});

test("phones: no horizontal page scroll at 390 and 320", async ({ page }) => {
  for (const path of ["/locations", "/ar/zkteco-dubai", "/zkteco-distributor-in-oman"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
  }
});
