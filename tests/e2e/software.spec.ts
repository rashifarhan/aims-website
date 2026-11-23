import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

// Audit the finished frame (as smoke.spec.ts does): the hero's entrance fades in, and axe measuring
// contrast mid-fade reports colours the page never rests on.
const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );

const PAGES = ["biotime-9-5", "biotimecloud", "zkaccess-3-5"];

for (const locale of ["en", "ar"]) {
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} Download Centre filters by URL and links built pages locally`, async ({ page }) => {
    await page.goto(`${prefix}/software`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".sw-card-grid > li")).toHaveCount(8);
    await page.goto(`${prefix}/software?type=access-control`);
    // Access control: Bio Security 3.2, ZKAccess 3.5, CVAccess, CVSecurity.
    await expect(page.locator(".sw-card-grid > li")).toHaveCount(4);
    await page.goto(`${prefix}/software?type=nonsense`);
    await expect(page.locator(".sw-card-grid > li")).toHaveCount(8);
    for (const slug of PAGES) {
      await expect(page.locator(`.sw-card-grid a[href="${prefix}/software/${slug}"]`)).toHaveCount(1);
    }
    await settle(page);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });

  for (const slug of PAGES) {
    test(`${locale} ${slug} page: one h1, short title, canonical, axe clean`, async ({ page }) => {
      const response = await page.goto(`${prefix}/software/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect((await page.title()).length).toBeLessThanOrEqual(60);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/software/${slug}$`));
      await settle(page);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations.map((v) => v.id)).toEqual([]);
    });
  }
}

for (const locale of ["en", "ar"]) {
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} Download Centre filter chips keep state in the URL, by keyboard`, async ({ page }) => {
    await page.goto(`${prefix}/software`);
    const filter = page.locator(".sw-filter");
    await expect(filter.locator('[aria-current="page"]')).toHaveCount(1);
    const chip = filter.locator(`a[href="${prefix}/software?type=access-control"]`);
    // The chips hydrate out of a Suspense fallback; a keypress during the swap is lost, so retry until then.
    await expect(async () => {
      await chip.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${prefix}/software\\?type=access-control$`), { timeout: 1000 });
    }).toPass();
    await expect(chip).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".sw-card-grid > li")).toHaveCount(4);
    await expect(filter.locator("[aria-live]")).toContainText("4");
    await expect(chip).toBeFocused();
  });

  test(`${locale} software pages draw SIGNAL only to what their own data lists`, async ({ page }) => {
    for (const slug of ["biotime-9-5", "zkaccess-3-5"]) {
      await page.goto(`${prefix}/software/${slug}`);
      const signal = page.locator("#terminals .sw-signal");
      await expect(signal).toHaveCount(1);
      const nodes = signal.locator(".sw-signal-node");
      const count = await nodes.count();
      expect(count).toBeGreaterThanOrEqual(2);
      // One line per terminal in each drawing (desktop and phone), each node a product link.
      await expect(signal.locator("svg").first().locator("path")).toHaveCount(count);
      await expect(nodes.locator(`a[href^="${prefix}/product/"]:not([tabindex="-1"])`)).toHaveCount(count);
    }
    // No AIMS product page names BioTime Cloud: no terminal is claimed for it.
    await page.goto(`${prefix}/software/biotimecloud`);
    await expect(page.locator("#terminals .sw-signal-node")).toHaveCount(4);
    await expect(page.locator(`#terminals a[href^="${prefix}/product/"]`)).toHaveCount(0);
  });
}

test("Arabic software pages keep AIMS's English copy left-to-right", async ({ page }) => {
  await page.goto("/ar/software/zkaccess-3-5");
  const list = page.locator(".sw-feature-list");
  await expect(list).toHaveAttribute("lang", "en");
  await expect(list).toHaveAttribute("dir", "ltr");
  await expect(page.locator(".sw-terminal-model").first()).toHaveAttribute("dir", "ltr");
  await expect(page.locator(".page-hero-eyebrow")).toHaveCount(0);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("the SIGNAL diagram rests drawn", async ({ page }) => {
    await page.goto("/software/biotime-9-5");
    const signal = page.locator("#terminals .sw-signal");
    await signal.scrollIntoViewIfNeeded();
    const line = signal.locator(".sw-signal-line").first();
    await expect(line).toHaveCSS("stroke-dashoffset", "0px");
    const dot = await signal
      .locator(".sw-signal-node")
      .first()
      .evaluate((el) => getComputedStyle(el, "::after").opacity);
    expect(dot).toBe("1");
  });
});

test("Add to quote puts a software line in the quote list", async ({ page }) => {
  await page.goto("/software/zkaccess-3-5");
  await page.locator(".page-hero").getByRole("button", { name: "Add to quote" }).click();
  await expect(page.locator(".page-hero").getByText("In your quote")).toBeVisible();
  // Focus moves to the link that replaced the button (WCAG 2.4.3).
  await expect(page.locator(".page-hero").getByRole("link", { name: "View quote list" })).toBeFocused();
  await page.goto("/quote");
  await expect(page.getByText("ZKAccess 3.5 software", { exact: false }).first()).toBeVisible();
});

test("an unknown software slug renders no software page", async ({ page }) => {
  // Partial prerendering streams not-found with a 200, as for /product/<unknown>; the page must be empty of software.
  await page.goto("/software/not-a-platform");
  await expect(page.locator(".page-hero")).toHaveCount(0);
});
