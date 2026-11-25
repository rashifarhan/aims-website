import { expect, test } from "@playwright/test";
import { builtRoutes } from "../../src/lib/routes";
import { CONTACT, CUSTOMER_REVIEWS, LIVE_AIMS, ZKTECO_AUTHORIZATION_CONFIRMED } from "../../src/lib/site";
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

  test(`${locale} sections preview the header menu in order, each ending on its menu page`, async ({ page }) => {
    await page.goto(home);
    const prefix = locale === "ar" ? "/ar" : "";
    // Client decision, 25 Nov 2026: the home page previews the header menu, one section per item in menu order
    // (About as the figures and reviews, Products, Solutions, Software, Services, Locations). The FAQ, buyer routes
    // and door teaser stay off.
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
      "journey",
      "showrooms",
      "ui-close",
    ]);
    for (const gone of ["#faq", ".home-door", ".ui-close-steps"]) await expect(page.locator(gone)).toHaveCount(0);
    // Two night bands mid-page, never side by side: the light journey parts the software band from the locations.
    const grounds = await page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((s) => s.classList.contains("section-night")));
    expect(grounds.slice(5, 8)).toEqual([true, false, true]);
    // Each preview ends on its menu page, from the shared section header.
    for (const [section, path] of [
      ["#families", "/products"],
      ["#places", "/solutions"],
      ["#software", "/software"],
      ["#journey", "/services"],
      ["#showrooms", "/locations"],
    ])
      await expect(page.locator(`${section} .section-heading a[href="${prefix}${path}"]`)).toHaveCount(1);
    const software = page.locator("#software");
    await expect(software.locator("h2")).toHaveCount(1);
    await expect(page.locator("#families a[href*='/software/']")).toHaveCount(0);
    for (const slug of ["biotimecloud", "biotime-9-5", "zkaccess-3-5"]) {
      await expect(software.locator(`a.home-sw-name[href="${prefix}/software/${slug}"]`)).toHaveCount(1);
    }
  });

  test(`${locale} previews: reviews, solution tiles, journey and the map with the offices`, async ({ page }) => {
    await page.goto(home);
    const prefix = locale === "ar" ? "/ar" : "";
    // About: AIMS's published reviews under the company figures, on the same light band.
    const figures = page.locator("main > section.home-figures");
    await expect(figures).not.toHaveClass(/section-night/);
    await expect(figures.locator(".home-figure")).toHaveCount(4);
    await expect(figures.locator(".home-review-card")).toHaveCount(CUSTOMER_REVIEWS.length);
    await expect(figures.locator("h3")).toHaveText(locale === "en" ? "From reviews published by AIMS" : /AIMS/);
    await expect(figures.locator(`a[href="${LIVE_AIMS.home}"]`)).toHaveCount(1);
    // Solutions: each photo tile opens the solution page that fits the place.
    const places = page.locator("#places .home-place");
    await expect(places).toHaveCount(4);
    expect(await places.evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(
      ["entrance-parking", "door-locks", "access-control", "entrance-parking"].map(
        (slug) => `${prefix}/solutions/${slug}`,
      ),
    );
    await expect(places.locator("img[data-source='stand-in']")).toHaveCount(4);
    // Services: the five steps of the journey, in order, as one list.
    const journey = page.locator("#journey");
    await expect(journey.locator("h2")).toHaveCount(1);
    await expect(journey.locator("ol.journey-list > li")).toHaveCount(5);
    if (locale === "en")
      await expect(journey.locator(".journey-title")).toHaveText([
        "Tell us the job",
        "Get a quotation",
        "Supply",
        "Install",
        "Support",
      ]);
    for (const body of await journey.locator(".journey-body").all()) await expect(body).not.toBeEmpty();
    // Locations: the reach map beside the showroom and AIMS's real lines, numbers left to right.
    const showrooms = page.locator("#showrooms");
    await expect(showrooms).toHaveClass(/section-night/);
    await expect(showrooms.locator(".ui-reach-map svg[role='img']")).toHaveAttribute("aria-label", /.+/);
    await expect(showrooms.locator("address")).toContainText(CONTACT.showroomAddress);
    for (const line of [CONTACT.lines.headOffice, CONTACT.lines.showroom, CONTACT.lines.abuDhabi]) {
      const call = showrooms.locator(`a[href="tel:${line.tel}"]`);
      await expect(call).toHaveCount(1);
      await expect(call.locator("bdi")).toHaveAttribute("dir", "ltr");
    }
    await expect(showrooms.locator(`a[href^="mailto:${CONTACT.email}"]`)).toHaveCount(1);
    await expect(showrooms.locator(`a[href="${CONTACT.showroomMap}"]`)).toHaveCount(1);
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
    await hero.evaluate(
      (el) =>
        el
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline).length,
    ),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(() =>
      hero.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline).length,
      ),
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
      hero.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline).length,
      ),
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
