import { expect, test } from "@playwright/test";

test.describe("header and menus", () => {
  test("desktop: Products menu opens, closes on Esc and returns focus", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation only");
    await page.goto("/");
    const button = page.getByRole("button", { name: "Products" });
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Time attendance/ }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("desktop: opening keeps focus on the button; focus leaving the nav closes the panel", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "desktop navigation only");
    await page.goto("/");
    const button = page.getByRole("button", { name: "Products" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(button).toBeFocused();
    // The search field sits after the nav in the header, outside it.
    await page.locator("#header-search").focus();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("desktop: '/' focuses search and submitting goes to the listing", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcut is desktop only");
    await page.goto("/"); // shortcut attaches on hydration; toPass retries until then
    const input = page.locator("#header-search");
    await expect(async () => {
      await page.keyboard.press("/");
      await expect(input).toBeFocused({ timeout: 500 });
    }).toPass();
    await input.fill("F18");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/products\?q=F18$/);
  });

  test("mobile: menu sheet is a modal dialog; Esc closes and returns focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile menu only");
    await page.goto("/");
    const open = page.getByRole("button", { name: "Open menu" });
    await open.click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    await sheet.locator("summary", { hasText: "Products" }).click();
    await expect(sheet.getByRole("link", { name: /Door hardware/ })).toBeVisible();
    await expect(sheet.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", /wa\.me\/971565240495/);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(open).toBeFocused();
  });

  test("language switch points at the same page in the other language", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop header link");
    await page.goto("/");
    await expect(page.getByRole("banner").getByRole("link", { name: "العربية" })).toHaveAttribute("href", "/ar");
    await page.goto("/ar");
    await expect(page.getByRole("banner").getByRole("link", { name: "English" })).toHaveAttribute("href", "/");
  });

  test("footer lists the real AIMS phone lines", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    for (const tel of ["+97142523253", "+97148808445", "+97125466047"]) {
      await expect(footer.locator(`a[href="tel:${tel}"]`)).toHaveCount(1);
    }
  });

  // Audit 23 Nov 2026 (B-I01, CLAUDE.md §7): English runs stay one left-to-right run inside Arabic.
  test("Arabic footer keeps the company line and showroom address left-to-right", async ({ page }) => {
    await page.goto("/ar");
    const footer = page.getByRole("contentinfo");
    await expect(footer.locator('span[dir="ltr"]', { hasText: "AIMS Security Systems Trading LLC" })).toHaveCount(1);
    await expect(footer.locator('span[dir="ltr"]', { hasText: "Naif Bazar Building" })).toHaveCount(1);
    await expect(footer.locator('a[href="/ar/blog"]')).toHaveCount(1);
  });
});

// Audit T10: unknown URLs render the localized 404 inside the shell, with a real 404 status.
test.describe("404 page", () => {
  for (const [path, lang, dir, title] of [
    ["/nope", "en", "ltr", "Page not found"],
    ["/ar/nope", "ar", "rtl", "الصفحة غير موجودة"],
    ["/solutions/nope/deeper", "en", "ltr", "Page not found"],
  ] as const) {
    test(`${path} is a localized 404 inside the shell`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(title);
      expect(await page.title()).toContain(title);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      await expect(page.locator('a[href="#main"]')).toHaveCount(1);
      await expect(page.locator("main#main")).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
      // The door's story is told in words for screen readers.
      await expect(page.locator("svg.door-denied")).toHaveAttribute("role", "img");
      await expect(page.locator("svg.door-denied")).toHaveAttribute("aria-label", /.+/);
    });
  }

  test("the 404 search and popular model chips lead to the listing", async ({ page }) => {
    await page.goto("/nope");
    const search = page.locator("#notfound-search");
    await expect(search).toBeVisible();
    await expect(page.locator('label[for="notfound-search"]:visible')).toHaveCount(1);
    await search.fill("F18");
    await search.press("Enter");
    await expect(page).toHaveURL(/\/products\?q=F18$/);
    await page.goto("/ar/nope");
    const chip = page.locator("main").getByRole("link", { name: "F18", exact: true });
    await expect(chip).toHaveAttribute("href", "/ar/products?q=F18");
    await expect(chip).toHaveClass(/font-mono/);
    await expect(page.locator("main .home-button")).toHaveAttribute("href", "/ar/products");
  });

  test("the denied door rests on its final frame under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/nope");
    for (const part of [".door-denied-card", ".door-denied-led", ".door-denied-badge"])
      await expect(page.locator(part)).toHaveCSS("opacity", "1");
    expect(
      await page
        .locator("svg.door-denied")
        // Keyframe animations only: the global reduced-motion rule also starts 0.01ms colour transitions on load.
        .evaluate(
          (el) =>
            el.getAnimations({ subtree: true }).filter((a) => a instanceof CSSAnimation && a.playState === "running")
              .length,
        ),
    ).toBe(0);
  });

  test("the denied door plays once and stops shut", async ({ page }) => {
    await page.goto("/nope");
    const door = page.locator("svg.door-denied");
    // Every part of the sequence is finite: it plays once and stands.
    const iterations = await door.evaluate((el) =>
      el.getAnimations({ subtree: true }).map((a) => a.effect?.getTiming().iterations),
    );
    expect(iterations.length).toBeGreaterThan(0);
    expect(iterations.every((n) => n === 1)).toBe(true);
    await door.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
    await expect(page.locator(".door-denied-badge")).toHaveCSS("opacity", "1");
    // At rest the leaf is untransformed; after the shudder the browser reports the identity matrix.
    await expect(page.locator(".door-denied-leaf")).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  });

  test("asset paths outside the locale rewrite still answer 404", async ({ request }) => {
    const res = await request.get("/images/nope/missing.png");
    expect(res.status()).toBe(404);
  });
});
