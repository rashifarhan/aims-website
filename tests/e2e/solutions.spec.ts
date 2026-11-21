import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["en", "ar"]) {
  const path = locale === "en" ? "/solutions" : "/ar/solutions";
  test(`${locale} solutions hub connects five needs to working destinations`, async ({ page, request, isMobile }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    const cards = page.locator(".solution-card");
    await expect(cards).toHaveCount(5);
    // Each card is one heading link (stretched over the card): its name is the title only.
    const links = page.locator(".solution-card h2 a");
    await expect(links).toHaveCount(5);
    for (const href of await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))) {
      expect(href).toMatch(new RegExp(`^${locale === "ar" ? "/ar" : ""}/(products|solutions)/`));
      expect((await request.get(href ?? "")).status()).toBe(200);
    }
    const firstFaq = page.locator(".solution-faq summary").first();
    await firstFaq.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".solution-faq details").first()).toHaveAttribute("open", "");
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
    if (isMobile) await page.getByRole("button", { name: locale === "en" ? "Open menu" : "فتح القائمة" }).click();
    const solutions = isMobile
      ? page.locator("dialog summary").filter({ hasText: locale === "en" ? "Solutions" : "الحلول" })
      : page.getByRole("button", { name: locale === "en" ? "Solutions" : "الحلول", exact: true });
    await solutions.click();
    const hubLink = page.locator(`header a[href="${path}"]:visible`);
    await expect(hubLink).toHaveCount(1);
    await hubLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await links.first().focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/products\/time-attendance$/);
  });

  test(`${locale} solutions hub keeps the shared grid and reduced-motion layout`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.locator(".solution-card")).toHaveCount(5);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const edges = await page.locator("header > div, .solutions-hub .page-container").evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          const s = getComputedStyle(node);
          return [r.left + parseFloat(s.paddingLeft), r.right - parseFloat(s.paddingRight)];
        }),
      );
      for (const edge of edges.slice(1)) {
        expect(Math.abs(edge[0] - edges[0][0])).toBeLessThanOrEqual(1);
        expect(Math.abs(edge[1] - edges[0][1])).toBeLessThanOrEqual(1);
      }
      // The global safeguard sets a tiny duration; transition-property:none disables it entirely.
      await expect(page.locator(".solution-card img").first()).toHaveCSS("transition-property", "none");
      if (width !== 320)
        await page.screenshot({ path: testInfo.outputPath(`solutions-${locale}-${width}.png`), fullPage: true });
    }
  });
}
