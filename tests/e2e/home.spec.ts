import { expect, test } from "@playwright/test";
import { builtRoutes } from "../../src/lib/routes";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "../../src/lib/site";
import catalogue from "../../content/products.json";

for (const locale of ["en", "ar"] as const) {
  const home = locale === "en" ? "/" : "/ar";
  test(`${locale} homepage has working product routes, factual counts and SEO`, async ({ page }) => {
    await page.goto(home);
    const main = page.getByRole("main");
    await expect(main.locator("h1")).toContainText(
      locale === "en" ? "ZKTeco access control" : "أنظمة ZKTeco للتحكم في الدخول",
    );
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "en" ? "ltr" : "rtl");
    const families = main.locator("#families");
    const counts = [20, 34, 29, 15, 55, 6];
    const slugs = ["time-attendance", "access-control", "entrance-control", "door-locks", "door-hardware", "pos"];
    for (const [index, slug] of slugs.entries()) {
      const link = families.locator(`a[href="${locale === "ar" ? "/ar" : ""}/products/${slug}"]`);
      await expect(link).toContainText(String(counts[index]));
    }
    await expect(main).not.toContainText("Project setup is in place");
    // Claims policy (Design Doc 3.1): the line appears exactly when AIMS has confirmed it (site.ts flag).
    if (ZKTECO_AUTHORIZATION_CONFIRMED)
      await expect(main).toContainText(locale === "en" ? "Authorized ZKTeco Distributor" : "موزع معتمد");
    else await expect(main).not.toContainText("Authorized ZKTeco Distributor");
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://aimsuae.me${home === "/" ? "" : home}`,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const localLinks = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => new URL((link as HTMLAnchorElement).href).pathname.replace(/^\/ar(?=\/|$)/, "") || "/"),
      );
    // T5 is built for every catalogue product (generateStaticParams), so any shown product page counts.
    const productPages = catalogue
      .filter((p) => !("duplicateOf" in p && p.duplicateOf))
      .map((p) => `/product/${p.slug}`);
    const available = new Set([...builtRoutes().map((route) => route.path), ...productPages]);
    expect([...new Set(localLinks)].filter((path) => !available.has(path))).toEqual([]);
    const data = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(data ?? "{}")["@type"]).toBe("Organization");
  });

  test(`${locale} external links announce themselves`, async ({ page }) => {
    await page.goto(home);
    const main = page.getByRole("main");
    // Every link that leaves the preview says so to screen readers, not only with a ↗ glyph.
    const external = main.locator('section a[href^="https://"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const link of await external.all()) {
      await expect(link.locator(".sr-only")).toHaveCount(1);
    }
  });

  test(`${locale} sections follow the premium-pass order and software links its built pages`, async ({ page }) => {
    await page.goto(home);
    const prefix = locale === "ar" ? "/ar" : "";
    // Client decision 6 (24 Nov 2026): hero, figures, model strip, families, places, software, showroom, close. The
    // FAQ, buyer routes, reviews, door teaser and reach map left the home page, and the software band lost its
    // records-flow drawing for a calmer screen, so their checks moved out of this spec.
    const order = await page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((s) => s.id || s.className.split(" ").at(-1)));
    expect(order).toEqual([
      "home-hero",
      "home-figures",
      "model-strip",
      "families",
      "places",
      "software",
      "showrooms",
      "ui-close",
    ]);
    for (const gone of ["#faq", ".home-door", ".ui-reach", ".home-review-grid", "#journey"])
      await expect(page.locator(gone)).toHaveCount(0);
    const software = page.locator("#software");
    await expect(software.locator("h2")).toHaveCount(1);
    await expect(page.locator("#families a[href*='/software/']")).toHaveCount(0);
    for (const slug of ["biotimecloud", "biotime-9-5", "zkaccess-3-5"]) {
      await expect(software.locator(`a.home-sw-name[href="${prefix}/software/${slug}"]`)).toHaveCount(1);
    }
    await expect(software.locator(`a[href="${prefix}/software"]`)).toHaveCount(1);
    // The journey is the one line of steps under the closing button.
    await expect(page.locator(".ui-close-steps li")).toHaveCount(5);
  });

  test(`${locale} narrow layout reflows`, async ({ page }) => {
    await page.goto(home);
    for (const width of [390, 320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test("hero respects reduced motion and pauses off-screen", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator("[data-hero-animation]");
  await expect(hero).toHaveAttribute("data-state", "verified");
  await expect(hero.locator('[data-screen="verified"]')).toBeVisible();
  expect(
    await hero.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(() =>
      hero.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    )
    .toBeGreaterThan(0);
  // After the prototype's 450ms return transition, idle holds until the next scan.
  await hero.locator("[data-screen]").evaluateAll((screens) => {
    for (const screen of screens) for (const animation of screen.getAnimations()) animation.currentTime = 1900 + 4900;
  });
  await expect(hero.locator('[data-screen="idle"]')).toHaveCSS("opacity", "1");
  await expect(hero.locator('[data-screen="verified"]')).toHaveCSS("opacity", "0");
  await page.locator("#showrooms").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      hero.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    )
    .toBe(0);
});

test("desktop hero artwork stays clear of English and Arabic copy", async ({ page }) => {
  for (const width of [1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/ar"]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const title = await page.locator("#home-title").boundingBox();
      const frame = await page.locator(".home-frame").boundingBox();
      expect(title).not.toBeNull();
      expect(frame).not.toBeNull();
      if (title && frame) {
        expect(path === "/" ? title.x + title.width <= frame.x : frame.x + frame.width <= title.x).toBe(true);
      }
      // Client decision 2 (24 Nov 2026): from 1024px the headline is two lines, neither wrapping nor clipped.
      const lines = await page.locator("#home-title > span").evaluateAll((spans) =>
        spans.map((span) => ({
          fits: span.scrollWidth <= span.clientWidth + 1,
          oneLine: span.getBoundingClientRect().height < 1.5 * parseFloat(getComputedStyle(span).lineHeight),
        })),
      );
      expect(lines).toEqual([
        { fits: true, oneLine: true },
        { fits: true, oneLine: true },
      ]);
    }
  }
});
