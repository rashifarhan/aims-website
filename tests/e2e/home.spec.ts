import { expect, test, type Page } from "@playwright/test";
import { stageUnits } from "../../src/lib/familyStage";
import { builtRoutes } from "../../src/lib/routes";
import { CONTACT, CUSTOMER_REVIEWS, ZKTECO_AUTHORIZATION_CONFIRMED } from "../../src/lib/site";
import catalogue from "../../content/products.json";

/*
 * T1 in direction 3 (CLAUDE.md → Design rules; home mockups approved 27 Nov 2026): the pinned family slider, then
 * reading sections alternating chalk and family grounds, each previewing a header menu item and ending on its page.
 */

const FAMILIES = ["access-control", "time-attendance", "entrance-control", "door-locks", "door-hardware", "pos"];
const COUNTS = [34, 20, 29, 15, 55, 6];

for (const locale of ["en", "ar"] as const) {
  const home = locale === "en" ? "/" : "/ar";
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} homepage has working product routes, factual counts and SEO`, async ({ page }) => {
    await page.goto(home);
    const main = page.getByRole("main");
    await expect(main.locator("h1")).toContainText(
      locale === "en" ? "ZKTeco access control" : "أنظمة ZKTeco للتحكم في الدخول",
    );
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "en" ? "ltr" : "rtl");
    // Every family tile links to its family page and reads its count from the catalogue.
    const tiles = main.locator("#families a.fam-tile");
    await expect(tiles).toHaveCount(6);
    for (const [index, slug] of FAMILIES.entries()) {
      const tile = main.locator(`#families a.fam-tile[href="${prefix}/products/${slug}"]`);
      await expect(tile).toContainText(String(COUNTS[index]));
    }
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
    // Every link that leaves the preview says so to screen readers, not only with a ↗ glyph.
    const external = page.getByRole("main").locator('section a[href^="https://"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const link of await external.all()) await expect(link.locator(".sr-only")).toHaveCount(1);
  });

  test(`${locale} sections preview the header menu in order on alternating grounds`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(home);
    const order = await page
      .locator("main > section, main .fam-pin > section")
      .evaluateAll((sections) => sections.map((s) => s.id || s.classList[0]));
    expect(order).toEqual([
      "fam",
      "figures",
      "model-strip",
      "families",
      "places",
      "software",
      "journey",
      "visit",
      "hc",
    ]);
    // Pages alternate floods and chalk: no two touching blocks share a ground (Design rules → Palette).
    const grounds = await page.evaluate(() => {
      const blocks = [...document.querySelectorAll<HTMLElement>(".fam-slide, main > section")];
      return blocks.map((el) => getComputedStyle(el).backgroundColor);
    });
    for (let i = 1; i < grounds.length; i += 1) expect(grounds[i], `block ${i}`).not.toBe(grounds[i - 1]);
    // Each preview ends on its menu page, from its heading block's one link.
    for (const [section, path] of [
      ["#families", "/products"],
      ["#places", "/solutions"],
      ["#software", "/software"],
      ["#journey", "/services"],
      ["#visit", "/locations"],
    ])
      await expect(page.locator(`${section} .flood-head a.flood-link[href="${prefix}${path}"]`)).toHaveCount(1);
    // The close asks for the quote, and offers the catalogue.
    await expect(page.locator(`.hc a[href="${prefix}/quote"]`)).toHaveCount(1);
    await expect(page.locator(`.hc a[href="${prefix}/products"]`)).toHaveCount(1);
    // One h2 per section, headings in order under the one h1.
    await expect(page.locator("h1")).toHaveCount(1);
    for (const id of ["figures", "families", "places", "software", "journey", "visit"])
      await expect(page.locator(`#${id} h2`)).toHaveCount(1);
  });

  test(`${locale} previews: figures, reviews, places, software, journey and the lines`, async ({ page }) => {
    await page.goto(home);
    const figures = page.locator("#figures");
    await expect(figures.locator(".hf-figures > div")).toHaveCount(4);
    await expect(figures.locator(".hf-reviews > li")).toHaveCount(CUSTOMER_REVIEWS.length);
    await expect(figures.locator("h3")).toHaveText(locale === "en" ? "From reviews published by AIMS" : /AIMS/);
    // Places: shown by the AIMS product that goes there (no stock photographs), each opening its solution page.
    const places = page.locator("#places a.hp-place");
    await expect(places).toHaveCount(4);
    expect(await places.evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(
      ["entrance-parking", "entrance-parking", "access-control", "door-locks"].map(
        (slug) => `${prefix}/solutions/${slug}`,
      ),
    );
    await expect(page.locator("main img[data-source='stand-in']")).toHaveCount(0);
    for (const src of await page.locator("#places img").evaluateAll((imgs) => imgs.map((i) => i.getAttribute("src"))))
      expect(decodeURIComponent(src ?? "")).toContain("/images/cutouts/");
    const software = page.locator("#software");
    for (const slug of ["biotimecloud", "biotime-9-5", "zkbio-cvsecurity", "zkbio-cvaccess"])
      await expect(software.locator(`a.hsw-row[href="${prefix}/software/${slug}"]`)).toHaveCount(1);
    // The card beside the rows is decoration; the rows carry the names.
    await expect(software.locator(".hsw-card")).toHaveAttribute("aria-hidden", "true");
    const steps = page.locator("#journey .hj-steps > li");
    await expect(steps).toHaveCount(5);
    if (locale === "en")
      await expect(steps.locator("h3")).toHaveText([
        "Tell us the job",
        "Get a quotation",
        "Supply",
        "Install",
        "Support",
      ]);
    const visit = page.locator("#visit");
    await expect(visit.locator("address")).toContainText(CONTACT.showroomAddress);
    for (const line of [CONTACT.lines.headOffice, CONTACT.lines.showroom, CONTACT.lines.abuDhabi]) {
      const call = visit.locator(`a[href="tel:${line.tel}"]`);
      await expect(call).toHaveCount(1);
      await expect(call.locator("bdi")).toHaveAttribute("dir", "ltr");
    }
    await expect(visit.locator(`a[href^="mailto:${CONTACT.email}"]`)).toHaveCount(1);
    await expect(visit.locator(`a[href="${CONTACT.showroomMap}"]`)).toHaveCount(1);
  });

  test(`${locale} narrow layout reflows and every giant word fits its frame`, async ({ page }) => {
    await page.goto(home);
    for (const width of [390, 320, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      // Measured once the pinned stage has re-measured for the new width (ScrollTrigger refreshes shortly after a
      // resize), and at rest: the entrance (900ms) carries the first family's word in from the side on purpose.
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), { timeout: 3000 })
        .toBe(true);
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => undefined)),
        ),
      );
      await expect.poll(() => wordsOverflowing(page), { message: `at ${width}px`, timeout: 3000 }).toEqual([]);
    }
  });
}

/** Giant words wider than the frame they sit in (Design rules → Type: never clipped, never wider than the frame).
 * Every word is checked for width; its place only where it rests: a family waiting off screen in the swipe carousel
 * (inert) has its layers parked part-way along their parallax on purpose. */
const wordsOverflowing = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".giant-word")].flatMap((word) => {
      const range = document.createRange();
      range.selectNodeContents(word);
      const text = range.getBoundingClientRect();
      const host = word.closest<HTMLElement>(".fam-slide, .hc, .fam-tile");
      const frame = host?.getBoundingClientRect();
      if (!host || !frame) return [];
      if (text.width > frame.width + 2) return [word.textContent];
      if (host.inert) return [];
      return text.left >= frame.left - 1 && text.right <= frame.right + 1 ? [] : [word.textContent];
    }),
  );

/** Which family slide the stage says is shown, and how many slides keep focus out (the hidden ones are inert). */
const stageState = (page: Page) =>
  page.locator(".fam").evaluate((root) => ({
    mode: (root as HTMLElement).dataset.mode ?? null,
    shown: [...root.querySelectorAll<HTMLElement>(".fam-slide")].findIndex((s) => s.dataset.shown === "true"),
    inert: root.querySelectorAll(".fam-slide[inert]").length,
  }));

test("reduced motion: the six families stand as six whole floods, nothing pinned, nothing moving", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const slides = page.locator(".fam-slide");
  await expect(slides).toHaveCount(6);
  expect(await stageState(page)).toEqual({ mode: null, shown: -1, inert: 0 });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".fam-tabs")).toHaveCount(0);
  // Every family is readable in turn: its name, its shown product and its range link.
  for (const [index, slug] of FAMILIES.entries()) {
    const slide = slides.nth(index);
    await expect(slide).toHaveAttribute("id", `family-${slug}`);
    await expect(slide.locator("h2")).toHaveCount(1);
    await expect(slide.locator(`a.fam-range[href="/products/${slug}"]`)).toHaveCount(1);
    await expect(slide.locator("a.fam-chip[href^='/product/']")).toHaveCount(1);
  }
  const running = await page.evaluate(
    () =>
      document.getAnimations().filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline)
        .length,
  );
  expect(running).toBe(0);
});

test("desktop: the stage pins and the scroll moves through the families in order", async ({ page, isMobile }) => {
  test.skip(isMobile, "the desktop engine (Lenis on a fine pointer)");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect.poll(async () => (await stageState(page)).mode).toBe("pinned");
  expect(await stageState(page)).toEqual({ mode: "pinned", shown: 0, inert: 5 });
  const tabs = page.getByRole("navigation", { name: /famil/i }).getByRole("button");
  await expect(tabs).toHaveCount(6);
  await expect(tabs.first()).toHaveAttribute("aria-current", "true");
  // Each family owns one stretch of scroll; resting on it shows that family alone.
  const pin = await page.locator(".pin-spacer").evaluate((el) => ({
    start: el.getBoundingClientRect().top + scrollY,
    length: (el as HTMLElement).offsetHeight - innerHeight,
  }));
  for (let k = 1; k < 6; k += 1) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), pin.start + (pin.length * k) / stageUnits(6));
    await expect.poll(async () => (await stageState(page)).shown).toBe(k);
  }
  // Past the stage the page carries on to the figures.
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), pin.start + pin.length + 200);
  await expect(page.locator("#figures")).toBeInViewport();
});

test("desktop: tabs, arrows and the arrow keys jump the scroll to a family", async ({ page, isMobile }) => {
  test.skip(isMobile, "tabs and arrows are hidden on phones");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect.poll(async () => (await stageState(page)).mode).toBe("pinned");
  await page.getByRole("button", { name: "POS systems", exact: true }).click();
  await expect.poll(async () => (await stageState(page)).shown, { timeout: 4000 }).toBe(5);
  const before = await page.evaluate(() => scrollY);
  expect(before).toBeGreaterThan(0);
  // The arrow names the family it goes to, and the keys move one family at a time.
  const previous = page.getByRole("button", { name: /Door hardware/ }).and(page.locator(".fam-arrow"));
  await previous.click();
  await expect.poll(async () => (await stageState(page)).shown, { timeout: 4000 }).toBe(4);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => (await stageState(page)).shown, { timeout: 4000 }).toBe(3);
  // ↑ ↓, Page Up/Down and Space step one family too (owner, 28 Nov 2026).
  await page.keyboard.press("ArrowUp");
  await expect.poll(async () => (await stageState(page)).shown, { timeout: 4000 }).toBe(2);
  await page.keyboard.press("PageDown");
  await expect.poll(async () => (await stageState(page)).shown, { timeout: 4000 }).toBe(3);
  // Focus never lands on a hidden family: only the shown slide's links are reachable.
  const reachable = await page
    .locator(".fam-slide:not([inert]) a")
    .evaluateAll((links) => links.map((a) => a.closest(".fam-slide")?.id));
  expect(new Set(reachable)).toEqual(new Set(["family-door-locks"]));
});

// Owner, 28 Nov 2026: on touch screens nothing pins. The hero is one screen and the families are a native swipe
// carousel, one family per swipe; the page's own scroll is never taken over.
test("phone: the families swipe one at a time and the page scrolls natively", async ({ page, isMobile, context }) => {
  test.skip(!isMobile, "the touch engine");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect.poll(async () => (await stageState(page)).mode).toBe("swipe");
  expect(await stageState(page)).toEqual({ mode: "swipe", shown: 0, inert: 5 });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  const cdp = await context.newCDPSession(page);
  const { width, height } = page.viewportSize() ?? { width: 390, height: 800 };
  // A hard swipe still moves one family (scroll-snap-stop: always).
  await cdp.send("Input.synthesizeScrollGesture", {
    x: width / 2,
    y: height * 0.55,
    xDistance: -width * 0.9,
    yDistance: 0,
    gestureSourceType: "touch",
    speed: 2500,
  });
  await expect.poll(async () => (await stageState(page)).shown).toBe(1);
  // The arrow names the family it goes to and moves the carousel.
  await page.locator(".fam-next").click();
  await expect.poll(async () => (await stageState(page)).shown).toBe(2);
  // A vertical swipe scrolls the page itself.
  await cdp.send("Input.synthesizeScrollGesture", {
    x: width / 2,
    y: height * 0.7,
    xDistance: 0,
    yDistance: -400,
    gestureSourceType: "touch",
    speed: 1500,
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  expect((await stageState(page)).shown).toBe(2);
});
