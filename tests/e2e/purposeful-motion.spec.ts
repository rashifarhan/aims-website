import { expect, test, type Locator } from "@playwright/test";

async function scrollStory(story: Locator, progress: number) {
  await story.evaluate((el, p) => {
    const box = el.getBoundingClientRect();
    scrollTo(0, scrollY + box.top + p * (box.height - innerHeight));
  }, progress);
}

for (const path of ["/", "/solutions/access-control", "/ar/solutions/access-control"]) {
  test(`${path}: the door follows scroll in both directions or completes in normal phone flow`, async ({ page }) => {
    await page.goto(path);
    const story = page.locator(".door-story");
    if ((page.viewportSize()?.width ?? 0) < 1024) {
      await expect(story).toHaveAttribute("data-mode", "once");
      await story.locator(".home-door-drawing").scrollIntoViewIfNeeded();
      await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
      await expect(story.locator(".door-story-layout")).toHaveCSS("position", "static");
    } else {
      await expect(story).toHaveAttribute("data-mode", "scroll");
      await scrollStory(story, 0.4);
      await expect(story.locator('[data-door-step="3"]')).toHaveAttribute("aria-current", "step");
      await scrollStory(story, 1);
      await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1");
      await scrollStory(story, 0);
      await expect(story.locator('[data-door-step="1"]')).toHaveAttribute("aria-current", "step");
      await expect(story.locator(".door-granted")).toHaveCSS("opacity", "0");
    }
    // Motion never prevents following a real part to its product page.
    const animationCount = await story.evaluate(
      (el) =>
        el.getAnimations({ subtree: true }).filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
          .length,
    );
    await story.locator("a").first().click();
    await expect(page).toHaveURL(/\/product\/kr602$/);
    await page.goBack();
    const restored = page.locator(".door-story");
    await expect(restored).not.toHaveAttribute("data-mode", "still");
    await expect
      .poll(() =>
        restored.evaluate(
          (el) =>
            el
              .getAnimations({ subtree: true })
              .filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition)).length,
        ),
      )
      .toBe(animationCount);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(restored.locator(".door-granted")).toHaveCSS("opacity", "1");
  });
}

test("changing the motion preference finishes an in-progress story immediately", async ({ page }) => {
  await page.goto("/solutions/access-control");
  const story = page.locator(".door-story");
  await story.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(story).toHaveAttribute("data-mode", "still");
  for (const part of await story.locator(".door-part, .door-card, .door-granted, .door-log").all())
    await expect(part).toHaveCSS("opacity", "1");
  expect(await story.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the finished door and its product links remain readable", async ({ page }) => {
    await page.goto("/solutions/access-control");
    await expect(page.locator(".door-granted")).toHaveCSS("opacity", "1");
    await expect(page.locator(".t3-door-parts a")).toHaveCount(6);
  });
});

test("attendance transport finishes while the visitor reads the active stage", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/solutions/time-attendance");
  // Scroll only once the story is live: switching it on makes its steps taller, which would move step 2.
  await expect(page.locator(".story")).toHaveAttribute("data-motion", "on");
  const stage = page.locator('[data-story-step="2"]');
  await stage.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(page.locator(".story")).toHaveAttribute("data-step", "2");
  await page.waitForTimeout(3500);
  expect(
    await page
      .locator(".ta-dots")
      .evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
  ).toBe(0);
});

test("phone attendance drawing completes in normal flow with every step readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ar/solutions/time-attendance");
  const drawing = page.locator(".story-stage");
  await drawing.scrollIntoViewIfNeeded();
  await expect(drawing).toHaveCSS("position", "static");
  await expect(page.locator(".story")).toHaveAttribute("data-step", "4", { timeout: 5000 });
  for (const step of await page.locator("[data-story-step]").all()) await expect(step).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".story")).toHaveAttribute("data-motion", "off");
});

for (const path of ["/product/f18", "/software/biotime-9-5"]) {
  test(`${path}: changing reduced motion before the diagram enters shows its finished paths`, async ({ page }) => {
    await page.goto(path);
    const lines = page.locator(".connects-line, .sw-signal-line");
    expect(await lines.count()).toBeGreaterThan(0);
    await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
    for (const line of await lines.all()) await expect(line).toHaveCSS("stroke-dashoffset", "0px");
  });
}

for (const path of ["/product/f18", "/ar/product/f18"]) {
  test(`${path}: the product can be added while its entrance is settling`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).toContainText("F18");
    await main
      .getByRole("button", { name: /^(Add to quote|أضف إلى عرض السعر)$/ })
      .first()
      .click();
    await expect(main.getByRole("status").first()).toContainText("F18");
  });
}

// Every hero built on the T3 layout shares the entrance, not two hand-picked solution slugs.
test("T3-based heroes share the AIMS entrance, the header edges and a whole product photo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/solutions/access-control",
    "/ar/solutions/time-attendance",
    "/solutions/entrance-parking",
    "/solutions/door-locks",
    "/ar/solutions/pos",
    "/zkteco-distributor-in-oman",
    "/about",
  ]) {
    await page.goto(path);
    const shell = await page.locator("header .wrap").first().boundingBox();
    const hero = await page.locator(".page-hero > .wrap").boundingBox();
    if (!shell || !hero) throw new Error("The shared header and solution hero must render");
    expect(hero.x).toBeCloseTo(shell.x, 0);
    expect(hero.width).toBeCloseTo(shell.width, 0);
    await expect(page.locator(".page-hero-media img")).toBeVisible();
    await expect(page.locator(".page-hero.aims-hero h1 .aims-headline")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("a phone door waits for its drawing instead of playing behind the parts list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 650 });
  await page.goto("/solutions/access-control");
  const story = page.locator(".door-story");
  await expect(story).toHaveAttribute("data-mode", "once");
  await story.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect(story.locator(".home-door-drawing")).not.toBeInViewport();
  await page.waitForTimeout(4300);
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "0");
  await story.locator(".home-door-drawing").scrollIntoViewIfNeeded();
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
});

test("a completed phone door stays complete when the browser viewport height changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/solutions/access-control");
  const story = page.locator(".door-story");
  await story.locator(".home-door-drawing").scrollIntoViewIfNeeded();
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
  // Wait for the entire four-second timeline, including the software event, to finish.
  await expect
    .poll(() =>
      story.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
    )
    .toBe(0);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 500 });
});

test("the phone attendance explanation waits while its drawing is offscreen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/solutions/time-attendance");
  const story = page.locator(".story");
  const stage = page.locator(".story-stage");
  await stage.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-step", "2");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(stage).not.toBeInViewport();
  await page.waitForTimeout(2500);
  await expect(story).toHaveAttribute("data-step", "2", { timeout: 500 });
  await stage.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-step", "4", { timeout: 4000 });
});

test("lazy recommendation photos render as their cards are brought into the phone viewport", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const images: { path: string; src: string; naturalWidth: number }[] = [];
  for (const path of [
    "/solutions/access-control",
    "/ar/solutions/access-control",
    "/solutions/time-attendance",
    "/ar/solutions/time-attendance",
  ]) {
    await page.goto(path);
    const cards = page.locator(".pick-card");
    for (const card of await cards.all()) {
      await card.evaluate((el) => el.scrollIntoView({ block: "center", inline: "center" }));
      const image = card.locator("img");
      await expect
        .poll(
          () => image.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0),
          { timeout: 10_000 },
        )
        .toBe(true);
      images.push({
        path,
        ...(await image.evaluate((el) => ({
          src: (el as HTMLImageElement).currentSrc,
          naturalWidth: (el as HTMLImageElement).naturalWidth,
        }))),
      });
    }
  }
  await testInfo.attach("recommendation-image-readiness", {
    body: JSON.stringify(images),
    contentType: "application/json",
  });
});

test("the changed buying screens fit every configured viewport", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const bounds: { path: string; viewport: number; content: number }[] = [];
  for (const width of [320, 390, 768, 1024, 1152, 1440]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    for (const route of [
      "/",
      "/solutions/access-control",
      "/solutions/time-attendance",
      "/product/f18",
      "/software/biotime-9-5",
    ]) {
      for (const prefix of ["", "/ar"]) {
        const path = route === "/" ? prefix || "/" : prefix + route;
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        const content = await page.evaluate(() => document.documentElement.scrollWidth);
        bounds.push({ path, viewport: width, content });
        // Mobile browsers can enlarge innerWidth to accommodate overflow; use the configured width.
        expect(content, `${path} at ${width}`).toBeLessThanOrEqual(width);
      }
    }
  }
  await testInfo.attach("responsive-bounds", { body: JSON.stringify(bounds), contentType: "application/json" });
});

// On phones the parts list follows the one-shot playback: the highlighted step is the part being drawn.
test("a phone door highlights each part in turn while it plays", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/solutions/access-control");
  const story = page.locator(".door-story");
  await expect(story).toHaveAttribute("data-mode", "once");
  await story.evaluate((el) => {
    const seen: string[] = [];
    (window as unknown as { doorSteps: string[] }).doorSteps = seen;
    new MutationObserver(() => {
      const step = el.getAttribute("data-step");
      if (step && seen.at(-1) !== step) seen.push(step);
    }).observe(el, { attributeFilter: ["data-step"] });
  });
  await story.locator(".home-door-drawing").scrollIntoViewIfNeeded();
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
  await expect(story).toHaveAttribute("data-step", "6", { timeout: 2000 });
  const seen = await page.evaluate(() => (window as unknown as { doorSteps: string[] }).doorSteps);
  expect(seen).toEqual(["2", "3", "4", "5", "6"]);
  await expect(story.locator('[data-door-step][aria-current="step"]')).toHaveCount(1);
});
