import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations.map((v) => v.id)).toEqual([]);
    });
  }
}

test("Add to quote puts a software line in the quote list", async ({ page }) => {
  await page.goto("/software/zkaccess-3-5");
  await page.locator(".sw-hero").getByRole("button", { name: "Add to quote" }).click();
  await expect(page.locator(".sw-hero").getByText("In your quote")).toBeVisible();
  await page.goto("/quote");
  await expect(page.getByText("ZKAccess 3.5 software", { exact: false }).first()).toBeVisible();
});

test("an unknown software slug renders no software page", async ({ page }) => {
  // Partial prerendering streams not-found with a 200, as for /product/<unknown>; the page must be empty of software.
  await page.goto("/software/not-a-platform");
  await expect(page.locator(".sw-hero")).toHaveCount(0);
});
