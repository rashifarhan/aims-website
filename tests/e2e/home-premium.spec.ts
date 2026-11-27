import { expect, test } from "@playwright/test";

/*
 * Homepage motion in direction 3 (CLAUDE.md → Design rules → Motion): the family slider is the one pinned sequence
 * (home.spec.ts); section titles rise once through GSAP SplitText; the model strip runs as a ticker the visitor can
 * pause; under reduced motion everything rests whole.
 */

test("reduced motion: no title is split, the closing pieces stand still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  // No title is split or hidden: the GSAP heading reveal never loads under reduced motion.
  await page.locator("#closing-title").scrollIntoViewIfNeeded();
  await expect(page.locator(".heading-line")).toHaveCount(0);
  await expect(page.locator("#families-title")).not.toHaveAttribute("aria-label");
  const running = await page.evaluate(
    () =>
      document.getAnimations().filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline)
        .length,
  );
  expect(running).toBe(0);
});

test("section titles rise out of masked lines once", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("#families-title");
  // Below the fold the title waits split into masked lines, its words hidden, its text kept as its accessible name.
  await expect(title.locator(".heading-line-mask").first()).toBeAttached();
  const text = (await title.getAttribute("aria-label")) ?? "";
  expect(text.length).toBeGreaterThan(0);
  await expect(title).toHaveAccessibleName(text);
  await expect(title.locator(".heading-line div").first()).toHaveCSS("opacity", "0");
  // No h1 and nothing on the first screen is ever split (LCP and first paint untouched).
  await expect(page.locator("h1 .heading-line, .fam .heading-line")).toHaveCount(0);
  await title.evaluate((el) => el.scrollIntoView({ block: "center" }));
  // Played once, the split reverts: the resting title is the server's plain text again.
  await expect(title.locator(".heading-line")).toHaveCount(0, { timeout: 4000 });
  await expect(title).toHaveText(text);
  await expect(title).not.toHaveAttribute("aria-label");
});

test("Arabic titles rise as whole lines, so no word is broken apart", async ({ page }) => {
  await page.goto("/ar");
  const title = page.locator("#families-title");
  await expect(title.locator(".heading-line").first()).toBeAttached();
  // Lines only: each line keeps its words as one text run (letters join, Latin names keep their bidi order).
  await expect(title.locator(".heading-line div")).toHaveCount(0);
  await expect(title.locator(".heading-line").first()).toHaveCSS("opacity", "0");
  await title.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(title.locator(".heading-line")).toHaveCount(0, { timeout: 4000 });
});

test("titles below the family slider's pin rise when they reach the viewport, not screens early", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("#closing-title");
  await expect(title.locator(".heading-line-mask").first()).toBeAttached();
  // Two screens above the title it still waits: its trigger counts the stage's pin spacer.
  await title.evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 2));
  await page.waitForTimeout(600);
  await expect(title.locator(".heading-line div").first()).toHaveCSS("opacity", "0");
  await title.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(title.locator(".heading-line")).toHaveCount(0, { timeout: 4000 });
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

// Client decision, 25 Nov 2026: the model-code strip runs on its own as a ticker, not with the scroll. It loops past
// 5 s, so it must pause by keyboard (WCAG 2.2.2), hold still while a code has focus, and rest under reduced motion.
test("the model strip runs on its own and pauses by keyboard", async ({ page }) => {
  await page.goto("/");
  const strip = page.locator(".model-strip");
  await strip.scrollIntoViewIfNeeded();
  const track = strip.locator(".model-strip-track");
  const offset = () => track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  const first = await offset();
  await expect.poll(offset, { timeout: 3000 }).not.toBe(first);
  const toggle = strip.getByRole("button", { name: /pause/i });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await page.locator("h1").focus();
  const held = await offset();
  await page.waitForTimeout(600);
  expect(await offset()).toBe(held);
});

test("the model strip rests as one list under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const strip = page.locator(".model-strip");
  await expect(strip.locator(".model-strip-list[aria-hidden='true']")).toBeHidden();
  await expect(strip.getByRole("button", { name: /pause/i })).toBeHidden();
  await expect(strip.locator(".model-strip-track")).toHaveCSS("animation-name", "none");
});
