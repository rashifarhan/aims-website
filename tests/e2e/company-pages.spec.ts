import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Let finite CSS animations end, so axe audits the settled frame (smoke.spec.ts). */
const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
const noSideScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

for (const base of ["/about", "/services", "/support"]) {
  for (const prefix of ["", "/ar"]) {
    const path = `${prefix}${base}`;
    test(`${path}: 200, one H1, title, canonical, axe clean, no side scroll at 320`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect((await page.title()).length).toBeLessThanOrEqual(60);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
      // Play the page's moment, if it has one, then audit the finished frame.
      const moment = page.locator("[data-moment]");
      if (await moment.count()) {
        await moment.first().evaluate((el) => el.scrollIntoView({ block: "center" }));
        await expect(moment.first()).toHaveAttribute("data-played", "true");
      }
      await settle(page);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
      expect(await noSideScroll(page)).toBe(true);
      await page.setViewportSize({ width: 320, height: 720 });
      expect(await noSideScroll(page)).toBe(true);
    });
  }
}

test("header and footer reach the built company pages, not the contact fallback", async ({ page, isMobile }) => {
  test.skip(isMobile, "the desktop header carries the links");
  await page.goto("/");
  // The desktop bar and the menu both carry them; none falls back to /contact or aimsuae.me.
  await expect(page.getByRole("banner").locator('a[href="/services"]').first()).toBeVisible();
  await expect(page.getByRole("banner").locator('a[href="/about"]').first()).toBeVisible();
  for (const href of ["/about", "/services", "/support", "/blog"])
    expect(await page.getByRole("contentinfo").locator(`a[href="${href}"]`).count(), href).toBeGreaterThan(0);
});

// Plan AT-13: the old warranty and FAQ URLs land on their sections here.
test("old warranty and FAQ URLs land on their sections, with AIMS's text", async ({ page }) => {
  await page.goto("/zkteco-warranty-policy");
  await expect(page).toHaveURL(/\/support#warranty$/);
  await expect(page.locator("#warranty .editorial-body")).toHaveAttribute("lang", "en");
  await page.goto("/faq");
  await expect(page).toHaveURL(/\/support#faq$/);
  const questions = page.locator("#faq details");
  expect(await questions.count()).toBeGreaterThan(5);
  // The claims policy replaces the FAQ's partner wording (Design Doc 3.1).
  await expect(page.locator("#faq")).not.toContainText(/strategic partner/i);
  await questions.first().locator("summary").click();
  await expect(questions.first().locator(".editorial-body")).toBeVisible();
});

test("about: company facts from site.ts, no founding year, the showrooms anchor", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator(".co-facts")).toContainText("AIMS Security Systems Trading LLC");
  await expect(page.locator("main")).not.toContainText(/established in|founded in|since 20\d\d/i);
  await expect(page.locator(".home-proof-band")).toContainText("Figures stated by AIMS");
  await page.locator(".page-hero-actions .home-button").click();
  await expect(page).toHaveURL(/\/about#showrooms$/);
  await expect(page.locator("#showrooms")).toBeInViewport();
});

test("services: four cards open live pages; the quote action presets installation", async ({ page, request }) => {
  await page.goto("/ar/services");
  const cards = page.locator(".method-card");
  await expect(cards).toHaveCount(4);
  for (const href of await cards.evaluateAll((a) => a.map((el) => el.getAttribute("href") ?? ""))) {
    expect(href.startsWith("/ar/")).toBe(true);
    expect((await request.get(href)).status(), href).toBe(200);
  }
  await expect(page.locator('main a[href="/ar/quote?need=install"]')).toHaveCount(3);
});

// The dealt moments play once and only when their band is on screen (taste motion.md; CLAUDE.md §3).
for (const [path, part] of [
  ["/services", ".verify-line"],
  ["/about", ".reach-route"],
] as const) {
  test(`${path}: the moment waits for its band, plays once, and ends drawn`, async ({ page }) => {
    await page.goto(path);
    const moment = page.locator("[data-moment]");
    await expect(moment).toHaveCount(1);
    await expect(moment).not.toHaveAttribute("data-played", "true");
    await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
    await moment.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(moment).toHaveAttribute("data-played", "true");
    await settle(page);
    const offsets = await page
      .locator(`${part}`)
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).strokeDashoffset));
    expect(offsets.every((o) => parseFloat(o) === 0)).toBe(true);
    // Scrolling away and back does not replay it.
    await page.evaluate(() => scrollTo(0, 0));
    await moment.evaluate((el) => el.scrollIntoView({ block: "center" }));
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
  });

  test(`${path}: under reduced motion the moment rests on its final frame`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(path);
    await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
    const styles = await page
      .locator(`${part}, .verify-disc`)
      .evaluateAll((els) =>
        els.map((el) => ({ offset: getComputedStyle(el).strokeDashoffset, opacity: getComputedStyle(el).opacity })),
      );
    expect(styles.length).toBeGreaterThan(0);
    for (const s of styles) {
      expect(parseFloat(s.offset || "0")).toBe(0);
      expect(s.opacity).toBe("1");
    }
    await context.close();
  });
}

// Support's dealt moment (CLAUDE.md §3): the support route plays once in view and rests drawn.
test.describe("support route moment", () => {
  test("waits for its section, plays once, then stands", async ({ page }) => {
    await page.goto("/support");
    await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
    const section = page.locator("#process");
    await expect(section).not.toHaveAttribute("data-played");
    await expect(page.locator(".support-route .sr-disc")).toHaveCSS("opacity", "0");
    await section.locator(".support-route").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(section).toHaveAttribute("data-played", "true");
    await expect(page.locator(".support-route .sr-disc")).toHaveCSS("opacity", "1", { timeout: 4000 });
    await expect
      .poll(
        () =>
          section.evaluate(
            (el) =>
              el.getAnimations({ subtree: true }).filter((a) => a instanceof CSSAnimation && a.playState === "running")
                .length,
          ),
        { timeout: 4000 },
      )
      .toBe(0);
  });

  test("reduced motion shows the finished route", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ar/support");
    await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
    for (const part of [".sr-node", ".sr-disc"])
      await expect(page.locator(`.support-route ${part}`)).toHaveCSS("opacity", "1");
    // The route is decorative; the steps carry its meaning for screen readers.
    await expect(page.locator(".support-route")).toHaveAttribute("aria-hidden", "true");
  });
});
