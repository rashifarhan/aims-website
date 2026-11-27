import { expect, test, type Page } from "@playwright/test";
import { builtRoutes } from "../../src/lib/routes";
import { CONTACT, CUSTOMER_REVIEWS, LIVE_AIMS, ZKTECO_AUTHORIZATION_CONFIRMED } from "../../src/lib/site";
import catalogue from "../../content/products.json";

/*
 * The home page, direction 2 "Step inside the terminal" (CLAUDE.md → Design rules; rewritten for the new design on
 * 27 Nov 2026, replacing the old hero, families grid, model strip and reach map specs): the dive, then the figures,
 * places, software, the job ticket, the branches and the close, night and paper alternating.
 */

const shown = catalogue.filter((p) => !("duplicateOf" in p && p.duplicateOf)).length;

for (const locale of ["en", "ar"] as const) {
  const home = locale === "en" ? "/" : "/ar";
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} homepage has working routes, factual counts and SEO`, async ({ page }) => {
    await page.goto(home);
    const main = page.getByRole("main");
    await expect(main.locator("h1")).toHaveCount(1);
    await expect(main.locator("h1")).toContainText(
      locale === "en" ? "ZKTeco access control" : "أنظمة ZKTeco للتحكم في الدخول",
    );
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "en" ? "ltr" : "rtl");
    // The six families inside the terminal's screen, each with its catalogue count and its family page.
    const slides = main.locator(".dv-slide");
    await expect(slides).toHaveCount(6);
    const counts = { "access-control": 34, "time-attendance": 20, "entrance-control": 29, "door-locks": 15 };
    for (const [slug, count] of Object.entries(counts))
      await expect(main.locator(`.dv-slide a[href="${prefix}/products/${slug}"]`)).toContainText(String(count));
    // Claims policy (Design Doc 3.1): the claim appears exactly when AIMS has confirmed it (site.ts flag).
    if (ZKTECO_AUTHORIZATION_CONFIRMED)
      await expect(main.locator(".dv-claim")).toContainText(
        locale === "en" ? "Authorized ZKTeco Distributor" : "موزع معتمد",
      );
    else await expect(main.locator(".dv-claim")).toHaveCount(0);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://aimsuae.me${prefix}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const localLinks = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => new URL((link as HTMLAnchorElement).href).pathname.replace(/^\/ar(?=\/|$)/, "") || "/"),
      );
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
    const external = page.getByRole("main").locator('section a[href^="https://"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const link of await external.all()) await expect(link.locator(".sr-only")).toHaveCount(1);
  });

  test(`${locale} sections in order, night and paper alternating, each ending on its menu page`, async ({ page }) => {
    await page.goto(home);
    const sections = page.locator("main > section");
    expect(await sections.evaluateAll((all) => all.map((s) => s.id))).toEqual([
      "home-dive",
      "figures",
      "places",
      "software",
      "journey",
      "showrooms",
      "close",
    ]);
    // CLAUDE.md → Design rules, Rhythm: never two paper sections touching.
    const grounds = await sections.evaluateAll((all) =>
      all.map((s) => (s.matches(".in-paper") ? "paper" : s.matches(".in-night, .in-stage, .dv") ? "night" : "?")),
    );
    expect(grounds).toEqual(["night", "paper", "night", "paper", "night", "paper", "night"]);
    for (const [section, path] of [
      ["#home-dive", "/products"],
      ["#places", "/solutions"],
      ["#software", "/software"],
      ["#journey", "/services"],
      ["#showrooms", "/locations"],
      ["#close", "/quote"],
    ])
      await expect(page.locator(`${section} a[href="${prefix}${path}"]`).first()).toBeAttached();
    for (const slug of ["biotimecloud", "biotime-9-5", "zkbio-cvsecurity", "zkbio-cvaccess"])
      await expect(page.locator(`#software a[href="${prefix}/software/${slug}"]`)).toHaveCount(1);
    // One giant word per stage, hidden from screen readers (the real heading is the h1 or h2).
    for (const word of await page.locator(".in-word").all())
      expect(await word.evaluate((el) => el.closest("[aria-hidden='true']") !== null)).toBe(true);
  });

  test(`${locale} figures, reviews, places, the job ticket and the branches`, async ({ page }) => {
    await page.goto(home);
    const figures = page.locator("#figures");
    await expect(figures.locator(".hf-figure")).toHaveCount(4);
    await expect(figures.locator("figure")).toHaveCount(CUSTOMER_REVIEWS.length);
    await expect(figures.locator(`a[href="${LIVE_AIMS.home}"]`)).toHaveCount(0);
    // Solutions: each photo opens the solution that fits the place; the photos are labelled stand-ins.
    const places = page.locator("#places a.hp-tile");
    expect(await places.evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(
      ["entrance-parking", "door-locks", "access-control", "entrance-parking"].map((s) => `${prefix}/solutions/${s}`),
    );
    await expect(places.locator("img[data-source='stand-in']")).toHaveCount(4);
    // Services: five steps, each with an h3, its owner and what it includes; the quote and the warranty links.
    const journey = page.locator("#journey");
    const steps = journey.locator("ol.hj-steps > li");
    await expect(steps).toHaveCount(5);
    for (const step of await steps.all()) {
      await expect(step.locator("h3")).toHaveCount(1);
      await expect(step.locator(".hj-who")).toContainText(locale === "en" ? "Who" : "المسؤول");
    }
    await expect(steps.nth(0).locator(`a[href="${prefix}/quote"]`)).toHaveCount(1);
    await expect(steps.nth(4).locator(`a[href="${prefix}/support"]`)).toHaveCount(1);
    await expect(steps.nth(2)).toContainText(String(shown));
    // The ticket and the counter repeat the list, so screen readers never hear them change on scroll.
    await expect(journey.locator(".hj-ticket")).toHaveAttribute("aria-hidden", "true");
    await expect(journey.locator(".hj-count")).toHaveAttribute("aria-hidden", "true");
    // Locations: AIMS's real lines, numbers left to right, the email and each branch's map.
    const showrooms = page.locator("#showrooms");
    await expect(showrooms.locator("address").first()).toContainText(CONTACT.showroomAddress);
    for (const line of [CONTACT.lines.headOffice, CONTACT.lines.showroom, CONTACT.lines.abuDhabi]) {
      const call = showrooms.locator(`a[href="tel:${line.tel}"]`);
      await expect(call).toHaveCount(1);
      await expect(call.locator("bdi")).toHaveAttribute("dir", "ltr");
    }
    await expect(showrooms.locator(`a[href^="mailto:${CONTACT.email}"]`)).toHaveCount(1);
    await expect(showrooms.locator(`a[href="${CONTACT.showroomMap}"]`)).toHaveCount(1);
    await expect(showrooms.locator(".hv-pass")).toHaveAttribute("aria-hidden", "true");
  });

  test(`${locale} narrow layout reflows`, async ({ page }) => {
    await page.goto(home);
    for (const width of [390, 320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

/** Scrolls the dive to a point of its progress, 0 to 1, and waits for the scrub to settle there. */
async function diveTo(page: Page, p: number) {
  await page.evaluate((p) => {
    const section = document.getElementById("home-dive");
    if (!section) return;
    const header = document.querySelector("header")?.offsetHeight ?? 0;
    const start = section.getBoundingClientRect().top + scrollY - header;
    const end = start + section.offsetHeight - innerHeight + header;
    scrollTo({ top: start + p * (end - start), behavior: "instant" });
  }, p);
}

const deviceScale = (page: Page) =>
  page.locator("[data-dive-device]").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);

test.describe("the dive", () => {
  test.skip(({ isMobile }) => isMobile, "Scrubbed with a desktop scroll; the phone runs the same code path");

  test("the terminal flies forward and the families open out of its screen", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".dv")).not.toHaveAttribute("data-inside");
    // Before the dive the families are fully shut (they never show through the terminal on its way in).
    await expect(page.locator(".dv")).toHaveAttribute("style", /--clip: inset\(50%\)/);
    await diveTo(page, 0.3);
    // The terminal has flown forward: its screen now fills the stage's height.
    await expect.poll(() => deviceScale(page)).toBeGreaterThan(1.5);
    await expect(page.locator(".dv")).toHaveAttribute("data-inside", "");
    await expect(page.locator(".dv-counter")).toHaveText("01 / 06");
    // Only the family in front takes focus and clicks; the others are inert.
    await expect(page.locator(".dv-slide:not([inert])")).toHaveCount(1);
    await expect(page.locator(".dv-chips button[aria-current='true']")).toHaveText("ACCESS");
  });

  test("the arrows and chips move the scroll to a family, so the screen and the scroll agree", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".dv")).toHaveAttribute("style", /--clip/);
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await diveTo(page, 0.3);
    await expect(page.locator(".dv-counter")).toHaveText("01 / 06");
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.locator(".dv-counter")).toHaveText("02 / 06", { timeout: 4000 });
    await page.locator(".dv-chips button").filter({ hasText: "POS" }).click();
    await expect(page.locator(".dv-counter")).toHaveText("06 / 06", { timeout: 4000 });
    await expect(page.locator(".dv-slide").nth(5)).not.toHaveAttribute("inert");
    await expect(page.locator(".dv-slide").nth(5).locator(".dv-ticket")).toBeInViewport();
  });

  test("tabbing into the families opens the screen; tabbing back returns to the hero", async ({ page }) => {
    await page.goto("/");
    // The motion loads lazily after hydration; it is ready once it has written the first frame.
    await expect(page.locator(".dv")).toHaveAttribute("style", /--clip/);
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await page.locator(".dv-copy .in-link").focus();
    // Each move is a 1.1 s glide; the wider window allows for a busy machine running several browsers.
    await page.keyboard.press("Tab");
    await expect(page.locator(".dv")).toHaveAttribute("data-inside", "", { timeout: 8000 });
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator(".dv")).not.toHaveAttribute("data-inside", { timeout: 8000 });
    await expect(page.locator("#home-title")).toBeInViewport();
  });
});

test("the job ticket pins on a desktop and steps through the five stages", async ({ page, isMobile }) => {
  test.skip(isMobile, "Covered by the phone layout test below");
  await page.goto("/");
  const journey = page.locator("#journey");
  await expect(journey).toHaveAttribute("data-motion", "pinned");
  const stepTo = (i: number) =>
    journey.evaluate((el, i) => {
      const header = document.querySelector("header")?.offsetHeight ?? 0;
      const start = el.getBoundingClientRect().top + scrollY - header;
      const end = start + (el as HTMLElement).offsetHeight - innerHeight + header;
      scrollTo({ top: start + ((i + 0.5) / 5) * (end - start), behavior: "instant" });
    }, i);
  for (const i of [0, 2, 4]) {
    await stepTo(i);
    await expect(journey.locator(".hj-step").nth(i)).toHaveAttribute("data-active");
    await expect(journey.locator(".hj-row").nth(i)).toHaveAttribute("data-state", "now");
    await expect(journey.locator(".hj-count-now")).toHaveText(`0${i + 1}`);
  }
  await expect(journey.locator(".hj-row").nth(0)).toHaveAttribute("data-state", "done");
});

test("reduced motion: no pins, every family and step stands in the flow", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".dv-stage")).toHaveCSS("position", "relative");
  for (const slide of await page.locator(".dv-slide").all()) {
    await expect(slide).toHaveCSS("opacity", "1");
    await expect(slide).not.toHaveAttribute("inert");
  }
  await expect(page.locator("[data-dive-device]")).not.toHaveAttribute("style", /.+/);
  await expect(page.locator("#journey")).not.toHaveAttribute("data-motion");
  for (const step of await page.locator(".hj-step").all()) await expect(step).toBeVisible();
  // Nothing loops or plays.
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline)
          .length,
    ),
  ).toBe(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the hero, every family and every step are readable", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".dv-stage")).toHaveCSS("position", "relative");
    for (const slide of await page.locator(".dv-slide").all()) await expect(slide).toHaveCSS("opacity", "1");
    for (const step of await page.locator(".hj-step").all()) await expect(step).toBeVisible();
  });
});

/*
 * Regression: Next 16 segment prefetch plus the locale rewrite once looped on the homepage segment
 * (~2,400 RSC requests in 5 s, 22 Nov 2026). prefetchSafe() keeps those links off prefetch.
 */
for (const path of ["/", "/ar", "/products", "/solutions/time-attendance", "/quote"]) {
  test(`no prefetch storm on ${path}`, async ({ page }) => {
    let rsc = 0;
    page.on("request", (request) => {
      if (request.headers()["rsc"] === "1" || request.url().includes("_rsc=")) rsc += 1;
    });
    await page.goto(path);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);
    expect(rsc).toBeLessThan(80);
  });
}
