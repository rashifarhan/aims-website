import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { restMotion } from "./rest";
import pages from "../../content/pages.json";

/** Let finite CSS animations (the entrance) end, so axe audits the settled frame (smoke.spec.ts). */
const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
        .map((a) => (a.timeline instanceof DocumentTimeline ? a.finished.catch(() => undefined) : a.cancel())),
    ),
  );
const axe = async (page: Page) => {
  await restMotion(page);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return result.violations.map((v) => `${v.id}: ${v.nodes.length}`);
};
const noSideScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

// The article in the route registry (Master Plan 12 #14): AIMS's access control buying guide.
const ARTICLE =
  "how-to-choose-an-access-control-system-for-your-business-a-complete-guide-by-aims-security-systems-trading-llc";
const PATHS = ["/privacy-policy", "/terms-and-conditions", "/blog", `/blog/${ARTICLE}`];

for (const base of PATHS) {
  for (const prefix of ["", "/ar"]) {
    const path = `${prefix}${base}`;
    test(`${path}: 200, one H1, title, canonical, axe clean, no side scroll at 320`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect((await page.title()).length).toBeLessThanOrEqual(60);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
      await settle(page);
      expect(await axe(page)).toEqual([]);
      expect(await noSideScroll(page)).toBe(true);
      await page.setViewportSize({ width: 320, height: 720 });
      expect(await noSideScroll(page)).toBe(true);
    });
  }
}

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

test("the blog index lists every article with AIMS's own image, and opens one", async ({ page }) => {
  await page.goto("/blog");
  const cards = page.locator("main .ed-card");
  await expect(cards).toHaveCount(pages.articles.length);
  // Every card image is AIMS's, served locally, and has loaded.
  const images = page.locator("main .ed-card img");
  await expect(images).toHaveCount(pages.articles.filter((a) => a.image).length);
  for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveAttribute("src", /images%2Fblog%2F|\/images\/blog\//);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await cards.first().locator("h2 a").click();
  await expect(page).toHaveURL(new RegExp(`/blog/${pages.articles[0].slug}$`));
  // Next keeps the previous page mounted but hidden (React Activity); read the visible heading.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(pages.articles[0].title);
});

test("an article leads to its solution and a quote, in English text marked on /ar", async ({ page, request }) => {
  await page.goto(`/ar/blog/${ARTICLE}`);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("h1")).toHaveAttribute("lang", "en");
  await expect(page.locator(".editorial-body")).toHaveAttribute("lang", "en");
  // The access control buying guide leads to the access control solution (lib/editorial articleSolution).
  const next = page.locator(".ed-next");
  await expect(next.locator('a[href="/ar/solutions/access-control"]')).toHaveCount(1);
  await expect(next.locator('a[href="/ar/quote"]')).toHaveCount(1);
  await expect(page.locator(".ed-more .ed-card")).toHaveCount(3);
  const hero = page.locator(".ed-article-photo img");
  await expect.poll(() => hero.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  for (const href of await page
    .locator(".ed-index-wide a, .ed-index-narrow a")
    .evaluateAll((a) => a.map((el) => el.getAttribute("href") ?? "")))
    await expect(page.locator(href)).toHaveCount(1);
  expect((await request.get("/ar/solutions/access-control")).status()).toBe(200);
});

for (const slug of ["privacy-policy", "terms-and-conditions"] as const) {
  test(`${slug}: AIMS's text, linked locally from the footer, with an index that jumps`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").locator(`a[href="/${slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${slug}$`));
    const first = pages.legal[slug].blocks.find((b) => b.type === "h")?.text ?? "";
    await expect(page.locator(".editorial-body h2").first()).toHaveText(first);
    // The index is a list beside the column on desktop and a closed "Jump to" disclosure on phones.
    const index = page.locator(".ed-index-wide:visible, .ed-index-narrow:visible");
    await expect(index).toHaveCount(1);
    if (await page.locator(".ed-index-narrow").isVisible()) await page.locator(".ed-index-narrow summary").click();
    const link = index.locator("a").nth(1);
    const target = (await link.getAttribute("href")) ?? "";
    await link.click();
    await expect(page.locator(target)).toBeInViewport();
    await page.goto(`/ar/${slug}`);
    await expect(page.locator(".editorial-body")).toHaveAttribute("lang", "en");
    await expect(page.locator(".editorial-body")).toHaveAttribute("dir", "ltr");
  });
}

// Audit 23 Nov 2026 (B-I03, CLAUDE.md §5): the first card's image is the blog's LCP element, so it alone
// loads eagerly at high priority; the rest stay lazy.
test("blog index: only the first card image loads eagerly", async ({ page }) => {
  await page.goto("/blog");
  const images = page.locator(".ed-card-grid img");
  await expect(images.first()).toHaveAttribute("loading", "eager");
  await expect(images.first()).toHaveAttribute("fetchpriority", "high");
  await expect(images.nth(1)).toHaveAttribute("loading", "lazy");
});
