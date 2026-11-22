import { expect, test } from "@playwright/test";
import pages from "../../content/pages.json";

// Every article on the live blog keeps its URL (CLAUDE.md §6), each with its own title as the one H1.
test("every imported blog article URL renders with its own title", async ({ request, isMobile }) => {
  test.skip(isMobile, "URL check, one viewport is enough");
  for (const a of pages.articles) {
    const res = await request.get(`/blog/${a.slug}`);
    expect(res.status(), a.slug).toBe(200);
    const html = await res.text();
    expect(html.match(/<h1[\s>]/g)?.length, a.slug).toBe(1);
    expect(html).toContain(a.title.replace(/&/g, "&amp;").slice(0, 30));
  }
});

test("the blog index lists every article and opens one", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.locator("main article")).toHaveCount(pages.articles.length);
  await page.locator("main article h2 a").first().click();
  await expect(page).toHaveURL(new RegExp(`/blog/${pages.articles[0].slug}$`));
  // Next keeps the previous page mounted but hidden (React Activity); read the visible heading.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(pages.articles[0].title);
});

for (const slug of ["privacy-policy", "terms-and-conditions"] as const) {
  test(`${slug}: AIMS's text, linked locally from the footer, English text marked in Arabic`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").locator(`a[href="/${slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${slug}$`));
    // Next keeps the previous page mounted but hidden (React Activity); read the visible heading.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(pages.legal[slug].title);
    await expect(page.locator(".editorial-body h2").first()).toBeVisible();
    await page.goto(`/ar/${slug}`);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator(".editorial-body")).toHaveAttribute("lang", "en");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
