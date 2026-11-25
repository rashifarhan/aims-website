import { expect, test } from "@playwright/test";
import { heroStill } from "./hero";
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
    // Night green only on the software band and the close (client decision, 25 Nov 2026): locations is light.
    const grounds = await page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((s) => s.classList.contains("section-night")));
    expect(grounds.slice(5, 8)).toEqual([true, false, false]);
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
    // Services: the journey timeline (client request, 25 Nov 2026), five step cards in order on one list, each with
    // its owner, what it includes and an h3; two links, the quote from step one and the warranty from step five.
    const journey = page.locator("#journey");
    await expect(journey.locator("h2")).toHaveCount(1);
    const steps = journey.locator("ol.hj-list > li");
    await expect(steps).toHaveCount(5);
    if (locale === "en")
      await expect(journey.locator(".hj-title")).toHaveText([
        "Tell us the job",
        "Get a quotation",
        "Supply",
        "Install",
        "Support",
      ]);
    for (const step of await steps.all()) {
      await expect(step.locator("h3")).toHaveCount(1);
      await expect(step.locator(".hj-body")).not.toBeEmpty();
      await expect(step.locator(".hj-who")).toContainText(locale === "en" ? "Who" : "المسؤول");
      const points = await step.locator("ul.hj-points > li").count();
      expect(points >= 2 && points <= 3).toBe(true);
    }
    await expect(journey.locator(".hj-card a")).toHaveCount(2);
    await expect(steps.nth(0).locator(`a[href="${prefix}/quote"]`)).toHaveCount(1);
    await expect(steps.nth(4).locator(`a[href="${prefix}/support"]`)).toHaveCount(1);
    // The supply step reads the catalogue count, as the families header does, never a hard-coded figure.
    const shown = catalogue.filter((p) => !("duplicateOf" in p && p.duplicateOf)).length;
    await expect(steps.nth(2).locator(".hj-points")).toContainText(String(shown));
    // The counter repeats the list, so screen readers never hear it change on scroll.
    await expect(journey.locator(".hj-counter")).toHaveAttribute("aria-hidden", "true");
    // Locations: the reach map beside the showroom and AIMS's real lines, numbers left to right.
    const showrooms = page.locator("#showrooms");
    await expect(showrooms).toHaveClass(/section-band/);
    await expect(showrooms).toHaveClass(/ui-reach-light/);
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
  // GSAP writes inline styles; at rest it has written none, and nothing moves.
  await expect(
    page.locator(".home-stage :is(.home-corner svg, .home-verified-chip, [data-screen])[style]"),
  ).toHaveCount(0);
  expect(await heroStill(page, 600)).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(hero).toHaveAttribute("data-state", "animated");
  await expect(hero).toHaveAttribute("data-playing", "true");
  // The screen verifies, then loops: after the approved hold it returns to idle (450ms) and scans again.
  await expect(hero.locator('[data-screen="verified"]')).toHaveCSS("opacity", "1", { timeout: 6000 });
  await expect(hero.locator('[data-screen="idle"]')).toHaveCSS("opacity", "1", { timeout: 6000 });
  await expect(hero.locator('[data-screen="verified"]')).toHaveCSS("opacity", "0");
  await expect(hero.locator('[data-screen="scan"]')).toHaveCSS("opacity", "1", { timeout: 4000 });
  await page.locator("#showrooms").scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-playing", "false");
  expect(await heroStill(page, 800)).toBe(true);
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

/*
 * The journey timeline's GSAP motion (client decision, 25 Nov 2026; CLAUDE.md §3 GSAP rule). The server renders the
 * final frame; the lazy motion pins and scrubs it from 1024px, runs an unpinned flow below, and stays out of the way
 * under reduced motion.
 */
const journeyFrame = (page: import("@playwright/test").Page) =>
  page.locator("#journey").evaluate((section) => ({
    motion: (section as HTMLElement).dataset.motion ?? null,
    pinned: !!section.querySelector(".pin-spacer"),
    live: section.querySelector(".hj-counter")?.hasAttribute("data-live") ?? false,
    fills: [...section.querySelectorAll(".hj-seg-fill")].map((el) => getComputedStyle(el).transform),
    numbers: [...section.querySelectorAll(".hj-node-number")].map((el) => getComputedStyle(el).opacity),
    ticks: [...section.querySelectorAll(".hj-node-tick path")].map((el) => getComputedStyle(el).strokeDasharray),
    cards: [...section.querySelectorAll(".hj-card")].map((el) => getComputedStyle(el).opacity),
  }));
const restingFrame = {
  motion: null,
  pinned: false,
  live: false,
  fills: Array(4).fill("none"),
  numbers: Array(5).fill("0"),
  ticks: Array(5).fill("none"),
  cards: Array(5).fill("1"),
};

test("journey rests at its final frame under reduced motion: no pin, rail full, every node ticked", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#journey").scrollIntoViewIfNeeded();
  expect(await journeyFrame(page)).toEqual(restingFrame);
  // The counter shows the total, as it does without JS.
  await expect(page.locator("#journey .hj-counter")).toHaveText(/05\s*steps/);
});

test("journey pins on a desktop and scrubs rail, cards, nodes and counter to the verified end", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const section = page.locator("#journey");
  await expect(section).toHaveAttribute("data-motion", "pinned");
  // The section itself stays a child of main (the content pins, not the section), so the page order holds.
  await expect(page.locator("main > section#journey")).toHaveCount(1);
  const counter = section.locator(".hj-counter");
  await expect(counter).toHaveAttribute("data-live", "");
  const pin = await section.locator(".pin-spacer").evaluate((el) => ({
    start: el.getBoundingClientRect().top + scrollY - (document.querySelector("header")?.offsetHeight ?? 0),
    length: (el as HTMLElement).offsetHeight - (el.firstElementChild as HTMLElement).offsetHeight,
  }));
  expect(pin.length).toBeGreaterThan(2 * 900);
  expect(pin.length).toBeLessThan(3 * 900);
  // Mid-way: some of the rail is drawn, some not; the counter has rolled past the first step.
  await page.evaluate((y) => scrollTo(0, y), pin.start + pin.length * 0.5);
  const scaleY = (t: string) => (t === "none" ? 1 : Number(t.slice(7, -1).split(",")[3]));
  await expect
    .poll(async () => {
      const fills = (await journeyFrame(page)).fills.map(scaleY);
      return fills.some((s) => s > 0) && fills.some((s) => s < 1);
    })
    .toBe(true);
  await expect(counter.locator(".hj-counter-reel")).not.toHaveCSS("transform", /matrix\(1, 0, 0, 1, 0, 0\)/);
  // At the end every card is whole, every node ticked and the rail full.
  await page.evaluate((y) => scrollTo(0, y), pin.start + pin.length + 2);
  await expect.poll(async () => (await journeyFrame(page)).cards).toEqual(Array(5).fill("1"));
  await expect.poll(async () => (await journeyFrame(page)).numbers).toEqual(Array(5).fill("0"));
  await expect
    .poll(() => counter.locator(".hj-counter-reel").evaluate((el) => getComputedStyle(el).transform))
    .toMatch(/matrix\(1, 0, 0, 1, 0, -\d+/);
  // Keyboard: focusing the last card's link from the top brings its card into view.
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator('#journey a[href="/support"]').focus();
  await expect(page.locator('#journey a[href="/support"]')).toBeInViewport();
});

test("journey flows without a pin on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const section = page.locator("#journey");
  await expect(section).toHaveAttribute("data-motion", "flow");
  await expect(section.locator(".pin-spacer")).toHaveCount(0);
  await expect(section.locator(".hj-counter")).toBeHidden();
  // Scrolled through, every card has risen in whole and every node is ticked.
  for (const card of await section.locator(".hj-card").all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS("opacity", "1");
  }
  await page.evaluate(() => scrollBy(0, innerHeight));
  await expect.poll(async () => (await journeyFrame(page)).numbers).toEqual(Array(5).fill("0"));
});
