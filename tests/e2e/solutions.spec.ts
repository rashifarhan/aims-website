import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

const SLUGS = ["entrance-parking", "access-control", "time-attendance", "door-locks", "pos"];

/** Bring the site plan to its final frame, then wait until no finite animation of any kind is running. */
async function settle(page: Page) {
  await page.locator(".hs-site").evaluate((el) => el.scrollIntoView({ block: "center" }));
  if ((await page.locator("html").getAttribute("data-effects")) === "on")
    await expect(page.locator(".hs-site")).toHaveAttribute("data-played", "true");
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter((a) => a.playState === "running" && Number.isFinite(a.effect?.getTiming().iterations)).length,
        ),
      { timeout: 8000 },
    )
    .toBe(0);
}

/** The plan's moving parts, read as numbers: line offsets and point opacities. */
const frame = (page: Page) =>
  page.locator(".hs-site").evaluate((el) => ({
    lines: [...el.querySelectorAll(".hs-line")].map((n) => parseFloat(getComputedStyle(n).strokeDashoffset)),
    points: [...el.querySelectorAll(".hs-disc, .hs-led, .hs-hub")].map((n) => Number(getComputedStyle(n).opacity)),
  }));

for (const locale of ["en", "ar"]) {
  const path = locale === "en" ? "/solutions" : "/ar/solutions";
  test(`${locale} solutions hub connects five needs to working destinations`, async ({ page, request, isMobile }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.locator(".solution-card")).toHaveCount(5);
    const cards = page.locator(".solution-card-action");
    await expect(cards).toHaveCount(5);
    // T11: the shared card, a Plex Mono model chip and the family's product count on every card.
    await expect(page.locator(".solution-card.ui-card.ui-card-interactive")).toHaveCount(5);
    await expect(page.locator(".solution-card .ui-card-photo img")).toHaveCount(5);
    await expect(page.locator(".solution-model")).toHaveCount(5);
    await expect(page.locator(".solution-model").first()).toContainText("F18");
    expect(
      await page
        .locator(".solution-model")
        .first()
        .evaluate((el) => getComputedStyle(el).fontFamily),
    ).toMatch(/plex|mono/i);
    await expect(page.locator(".solution-card-meta").first()).toContainText(/\d+/);
    // Every card opens its solution page, so no action line promises "products" any more.
    for (const card of await cards.all()) await expect(card).not.toContainText(locale === "en" ? "products" : "منتجات");
    // Each card is one heading link (stretched over the card): its name is the title only.
    const links = page.locator(".solution-card h2 a");
    await expect(links).toHaveCount(5);
    for (const href of await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))) {
      // All five T3 pages are built, so no card falls back to a catalogue listing (navigationHref).
      expect(href).toMatch(new RegExp(`^${locale === "ar" ? "/ar" : ""}/solutions/`));
      expect((await request.get(href ?? "")).status()).toBe(200);
    }
    const firstFaq = page.locator(".solution-faq summary").first();
    await firstFaq.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".solution-faq details").first()).toHaveAttribute("open", "");
    // Audit the settled page: the hero entrance and the site plan at their finished frames.
    await settle(page);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
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
    // Built solution pages replace the catalogue fallback (navigationHref).
    await expect(page).toHaveURL(/\/solutions\/time-attendance$/);
  });

  test(`${locale} solutions hub keeps the shared grid and reduced-motion layout`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.locator(".solution-card")).toHaveCount(5);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const edges = await page.locator("header > div, main .wrap").evaluateAll((nodes) =>
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

// Every "Explore the components" line must name something its catalogue listing and its solution page contain (CLAUDE.md §1).
test("component lines match the catalogue and the solution pages", async ({ page, isMobile }) => {
  test.skip(isMobile, "content check, one viewport is enough");
  const expectations: [string, RegExp][] = [
    ["/products/time-attendance?type=portable", /./],
    ["/products/access-control?verify=face", /./],
    ["/products/entrance-control?type=pedestrian", /swing|turnstile/i],
    ["/products/pos", /Biometric POS/],
  ];
  for (const [url, pattern] of expectations) {
    await page.goto(url);
    await expect(page.getByRole("article").filter({ hasText: pattern }).first()).toBeVisible();
  }
  // The cards now open the solution pages, so each line must also be shown on the page it opens.
  const pages: [string, RegExp[]][] = [
    ["/solutions/time-attendance", [/Face/, /Fingerprint/, /Card/, /Horus H1/]], // H1: the portable terminal
    ["/solutions/access-control", [/controller/i, /Face/]],
    ["/solutions/entrance-parking", [/turnstile/i, /swing barrier/i, /Parking barrier/]],
    ["/solutions/door-locks", [/Home or office door/, /Hotel room/]],
    ["/solutions/pos", [/Windows POS/, /Android POS/, /Fingerprint verification/]],
  ];
  for (const [url, patterns] of pages) {
    await page.goto(url);
    for (const pattern of patterns) await expect(page.locator("main")).toContainText(pattern);
  }
});

// The dealt moment (CLAUDE.md §3): "One site, five systems" waits for its section, plays once, then stands.
for (const locale of ["en", "ar"]) {
  const path = locale === "en" ? "/solutions" : "/ar/solutions";
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} site plan waits for its section, plays once, then stands`, async ({ page }) => {
    await page.goto(path);
    const site = page.locator(".hs-site");
    await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
    // Below the cards it has not played yet: the lines are undrawn and the points unlit.
    await page.waitForTimeout(300);
    await expect(site).not.toHaveAttribute("data-played");
    const before = await frame(page);
    expect(before.lines).toEqual([1, 1, 1, 1, 1]);
    expect(before.points.every((o) => o === 0)).toBe(true);
    await site.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(site).toHaveAttribute("data-played", "true");
    // It is moving now, then it ends (about 2.2 s) and nothing in it keeps running.
    await expect.poll(() => site.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
    await expect
      .poll(
        () =>
          site.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
        { timeout: 6000 },
      )
      .toBe(0);
    const after = await frame(page);
    expect(after.lines).toEqual([0, 0, 0, 0, 0]);
    expect(after.points.every((o) => o === 1)).toBe(true);
    // Once: scrolling away and back does not restart it.
    await page.evaluate(() => scrollTo(0, 0));
    await site.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(300);
    expect(
      await site.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    ).toBe(0);
    await settle(page);
    const axe = await new AxeBuilder({ page })
      .include(".hs-site")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test(`${locale} site plan: reduced motion shows every point and nothing moves`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
    const still = await frame(page);
    expect(still.lines).toEqual([0, 0, 0, 0, 0]);
    expect(still.points.every((o) => o === 1)).toBe(true);
    await page.locator(".hs-site").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(300);
    expect(
      await page
        .locator(".hs-site")
        .evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    ).toBe(0);
  });

  test(`${locale} site plan: five keyboard links, one per solution page, and the plan is decorative`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const site = page.locator(".hs-site");
    await expect(site.locator("h2")).toHaveCount(1);
    await expect(site.locator(".hs-plan")).toHaveAttribute("aria-hidden", "true");
    await expect(site.locator(".hs-plan")).toHaveAttribute("direction", "ltr");
    const links = site.locator("ol a");
    await expect(links).toHaveCount(5);
    // The order of a visit, gate to counter, matching the plan's numbers.
    expect(await links.evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")))).toEqual(
      SLUGS.map((slug) => `${prefix}/solutions/${slug}`),
    );
    for (const [i, link] of (await links.all()).entries()) {
      expect((await request.get(`${prefix}/solutions/${SLUGS[i]}`)).status()).toBe(200);
      const box = await link.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      // Each plan point carries the same name as its link (labels come from t.solutions[slug].name).
      await expect(site.locator(`.hs-point[data-point="${SLUGS[i]}"] .hs-label`)).toHaveText(
        (await link.locator(".hs-link-name").textContent()) ?? "",
      );
    }
    // Keyboard: the links take focus in order with a visible outline, and Enter opens the page.
    await links.first().focus();
    for (let i = 1; i < 5; i += 1) {
      await page.keyboard.press("Tab");
      await expect(links.nth(i)).toBeFocused();
      expect(await links.nth(i).evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
    }
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${prefix}/solutions/pos$`));
  });

  test(`${locale} site plan fits without horizontal scroll from 320 to 1440`, async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const plan = await page.locator(".hs-plan").boundingBox();
      const container = await page.locator(".hs-site").boundingBox();
      expect((plan?.x ?? 0) + (plan?.width ?? 0)).toBeLessThanOrEqual(
        (container?.x ?? 0) + (container?.width ?? 0) + 1,
      );
      // Phones simplify: the names leave the plan and the list carries them.
      const labelShown = await page.locator(".hs-label").first().isVisible();
      expect(labelShown).toBe(width >= 640);
    }
  });
}
