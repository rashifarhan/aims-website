import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { builtRoutes } from "../../src/lib/routes";

// The home page is always checked; every route flipped to "built" joins it.
const pages = [...new Set(["/", "/ar", ...builtRoutes().map((r) => r.path)])];

test.describe("pages", () => {
  for (const path of pages) {
    test(`${path} renders, one h1, zoom allowed, no axe violations`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="viewport"]')).not.toHaveAttribute(
        "content",
        /user-scalable=no|maximum-scale=1/,
      );
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});

test.describe("locale routing", () => {
  test("English is unprefixed; /en/* redirects to it", async ({ request }) => {
    const res = await request.get("/en/products", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toMatch(/\/products$/);
  });

  test("Arabic pages are RTL", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
});

test.describe("SEO guards", () => {
  test("preview is not indexable", async ({ page, request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
    await page.goto("/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
  });

  test("old URLs 301 to the new routes (AT-13 sample)", async ({ request }) => {
    const cases: [string, string][] = [
      ["/category/time-attendance", "/products/time-attendance"],
      ["/category/alpha", "/products/door-hardware?brand=alpha"],
      ["/getaquote", "/quote"],
      ["/enquiry", "/contact"],
      ["/product/f18-1", "/product/f18"],
    ];
    for (const [from, to] of cases) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(301);
      expect(
        new URL(res.headers().location, "http://x").pathname + new URL(res.headers().location, "http://x").search,
      ).toBe(to);
    }
  });

  test("unknown URLs return a real 404 page", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("Page not found");
  });
});
