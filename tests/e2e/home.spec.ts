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

  test(`${locale} door drawing has a text equivalent and external links announce themselves`, async ({ page }) => {
    await page.goto(home);
    const main = page.getByRole("main");
    // Design Doc 14: explainers have a text equivalent (the step list).
    const parts = main.locator(".home-door-parts li");
    await expect(parts).toHaveCount(6);
    await expect(parts.nth(2)).toContainText("AL-M280");
    // Every link that leaves the preview says so to screen readers, not only with a ↗ glyph.
    const external = main.locator('section a[href^="https://"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const link of await external.all()) {
      await expect(link.locator(".sr-only")).toHaveCount(1);
    }
  });

  test(`${locale} software has its own section with a described records-flow drawing`, async ({ page }) => {
    await page.goto(home);
    const prefix = locale === "ar" ? "/ar" : "";
    // Client request (24 Nov 2026): software follows the families band as a section of its own, before the door kit.
    const order = await page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((s) => s.id || s.className));
    const families = order.findIndex((id) => id === "families");
    expect(order[families + 1]).toBe("software");
    expect(order[families + 2]).toContain("home-door");
    const software = page.locator("#software");
    await expect(software.locator("h2")).toHaveCount(1);
    await expect(page.locator("#families a[href*='/software/']")).toHaveCount(0);
    // The drawing is one image whose name carries every line as text (CLAUDE.md §4).
    const flow = software.getByRole("img");
    await expect(flow).toHaveAttribute("aria-label", /BioTime Cloud.*BioTime 9\.5.*ZKAccess 3\.5/);
    await expect(flow).toHaveAttribute("aria-label", /IFace 990.*Biopro SA20.*Inbio 260/);
    for (const slug of ["biotimecloud", "biotime-9-5", "zkaccess-3-5"]) {
      await expect(software.locator(`a.home-row[href="${prefix}/software/${slug}"]`)).toHaveCount(1);
    }
    await expect(software.locator(`a[href="${prefix}/software"]`)).toHaveCount(1);
  });

  test(`${locale} FAQ works by keyboard and narrow layout reflows`, async ({ page }) => {
    await page.goto(home);
    const details = page.locator("#faq details");
    await expect(details).toHaveCount(6);
    const summary = details.first().locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(details.first()).toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(details.first()).not.toHaveAttribute("open", "");
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
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      hero.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    )
    .toBe(0);
});

test("desktop hero artwork stays clear of English and Arabic copy", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ["/", "/ar"]) {
    await page.goto(path);
    const title = await page.locator("#home-title").boundingBox();
    const device = await page.locator(".home-device").boundingBox();
    expect(title).not.toBeNull();
    expect(device).not.toBeNull();
    if (title && device) {
      expect(path === "/" ? title.x + title.width <= device.x : device.x + device.width <= title.x).toBe(true);
    }
  }
});
