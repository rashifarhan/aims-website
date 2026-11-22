import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ARTICLE =
  "how-to-choose-an-access-control-system-for-your-business-a-complete-guide-by-aims-security-systems-trading-llc";
const PAGES = [
  "/about",
  "/services",
  "/support",
  "/locations",
  "/privacy-policy",
  "/terms-and-conditions",
  "/blog",
  `/blog/${ARTICLE}`,
];

for (const locale of ["en", "ar"]) {
  const prefix = locale === "ar" ? "/ar" : "";
  for (const path of PAGES) {
    test(`${locale} ${path.slice(0, 40)}: one h1, short title, canonical, axe clean`, async ({ page }) => {
      const response = await page.goto(`${prefix}${path}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect((await page.title()).length).toBeLessThanOrEqual(60);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${prefix}${path}$`));
      await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations.map((v) => v.id)).toEqual([]);
    });
  }
}

test("legal pages show AIMS's text in full with an index that jumps to a section", async ({ page, isMobile }) => {
  await page.goto("/privacy-policy");
  await expect(page.getByRole("heading", { name: "9. Contact Us" })).toHaveCount(1);
  await expect(page.getByText("sends nothing to AIMS")).toBeVisible();
  // The index is a "Jump to" disclosure on mobile and a side list on desktop.
  if (isMobile) await page.locator(".ed-index-narrow summary").click();
  const link = page.locator(".ed-index a:visible").first();
  const href = await link.getAttribute("href");
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
});

test("the blog index links the built article locally and other posts to aimsuae.me", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.locator(`a[href="/blog/${ARTICLE}"]`)).toHaveCount(1);
  const external = page.locator('a[href^="https://aimsuae.me/blog/"]');
  expect(await external.count()).toBeGreaterThan(10);
});
