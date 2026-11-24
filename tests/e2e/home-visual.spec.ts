import { expect, test } from "@playwright/test";

for (const locale of ["en", "ar"]) {
  test(`${locale} homepage renders at the design viewports`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(locale === "en" ? "/" : "/ar");
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator(".home-device-photo")).toBeVisible();
      const edges = await page
        .locator("header > div, .home-hero-inner, main .wrap, footer > div")
        .evaluateAll((containers) =>
          containers.map((container) => {
            const rect = container.getBoundingClientRect();
            const style = getComputedStyle(container);
            return {
              start: rect.left + parseFloat(style.paddingLeft),
              end: rect.right - parseFloat(style.paddingRight),
            };
          }),
        );
      for (const edge of edges.slice(1)) {
        expect(Math.abs(edge.start - edges[0].start)).toBeLessThanOrEqual(1);
        expect(Math.abs(edge.end - edges[0].end)).toBeLessThanOrEqual(1);
      }
      const smallTargets = await page.locator("a, button, summary, input").evaluateAll((elements) =>
        elements.flatMap((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          if (
            !rect.width ||
            !rect.height ||
            style.visibility === "hidden" ||
            style.clip !== "auto" ||
            style.clipPath !== "none"
          )
            return [];
          // WCAG 2.5.8 exempts a link set inline in a sentence (the footer's one stand-in credit line, CLAUDE.md §2).
          if (style.display === "inline" && element.closest("p")) return [];
          return rect.width < 44 || rect.height < 44
            ? [`${element.tagName}: ${element.textContent?.trim().slice(0, 40)} (${rect.width}×${rect.height})`]
            : [];
        }),
      );
      expect(smallTargets).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`home-${locale}-${width}.png`), fullPage: true });
    }
  });
}
