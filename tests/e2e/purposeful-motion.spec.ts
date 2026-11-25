import { expect, test, type Locator } from "@playwright/test";

/** Scrolls the pinned door (solution/access-control/doorMotion.ts pinnedDoor) to a point of its scrub, 0 to 1: the pin
 * starts with the content centred below the header and lasts 2.4 viewports. */
async function scrollDoor(door: Locator, progress: number) {
  await door.evaluate((el, p) => {
    const spacer = el.querySelector(".pin-spacer");
    const wrap = el.querySelector<HTMLElement>(".wrap");
    if (!spacer || !wrap) throw new Error("the desktop door pins its content");
    const header = document.querySelector("header")?.offsetHeight ?? 0;
    const offset = header + Math.max(0, (innerHeight - header - wrap.offsetHeight) / 2);
    const start = spacer.getBoundingClientRect().top + scrollY - offset;
    scrollTo(0, start + p * Math.round(innerHeight * 2.4));
  }, progress);
}

// The door story left the home page (client decision 6, 24 Nov 2026); access control keeps it in both languages.
for (const path of ["/solutions/access-control", "/ar/solutions/access-control"]) {
  test(`${path}: the door follows scroll in both directions or steps through in normal phone flow`, async ({
    page,
  }) => {
    await page.goto(path);
    const story = page.locator(".t3-door");
    if ((page.viewportSize()?.width ?? 0) < 1024) {
      await expect(story).toHaveAttribute("data-motion", "flow");
      await story.locator(".home-door-drawing").evaluate((el) => el.scrollIntoView({ block: "start" }));
      await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
      await expect(story.locator(".pin-spacer")).toHaveCount(0);
    } else {
      await expect(story).toHaveAttribute("data-motion", "pinned");
      // 0.4 of the scrub is the controller reporting to the software: step 4 is the highlighted part.
      await scrollDoor(story, 0.4);
      await expect(story.locator('[data-door-step="4"]')).toHaveAttribute("aria-current", "step");
      await expect(story.locator("[data-door-step][aria-current]")).toHaveCount(1);
      await scrollDoor(story, 1);
      await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1");
      await expect(story).toHaveAttribute("data-step", "done");
      await scrollDoor(story, 0);
      await expect(story.locator('[data-door-step="1"]')).toHaveAttribute("aria-current", "step");
      await expect(story.locator(".door-granted")).toHaveCSS("opacity", "0");
    }
    // Motion never prevents following a real part to its product page; coming back builds the motion once again.
    await story.locator("a").first().click();
    await expect(page).toHaveURL(/\/product\/id-card-thin$/);
    await page.goBack();
    const restored = page.locator(".t3-door");
    await expect(restored).toHaveAttribute("data-motion", /pinned|flow/);
    await expect(page.locator(".pin-spacer")).toHaveCount((page.viewportSize()?.width ?? 0) < 1024 ? 0 : 1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(restored).not.toHaveAttribute("data-motion");
    await expect(restored.locator(".door-granted")).toHaveCSS("opacity", "1");
  });
}

test("changing the motion preference finishes an in-progress story immediately", async ({ page }) => {
  await page.goto("/solutions/access-control");
  const story = page.locator(".t3-door");
  await expect(story).toHaveAttribute("data-motion", /pinned|flow/);
  await story.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(story).not.toHaveAttribute("data-motion");
  await expect(story).not.toHaveAttribute("data-step");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  for (const part of await story.locator(".door-part, .door-card, .door-granted, .door-log").all())
    await expect(part).toHaveCSS("opacity", "1");
  await expect(story.locator(".door-leaf")).toHaveAttribute("transform", "scale(0.74 1)");
  expect(await story.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the finished door and its product links remain readable", async ({ page }) => {
    await page.goto("/solutions/access-control");
    await expect(page.locator(".door-granted")).toHaveCSS("opacity", "1");
    await expect(page.locator(".door-verified path")).toHaveCSS("opacity", "1");
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
      .evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline).length,
      ),
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

// Every hero built on the T3 layout shares the entrance, not two hand-picked solution slugs. A product-led page shows a
// whole product photo; a page whose subject is not one product shows its drawn scene instead (ui/HeroScene; client
// request, 25 Nov 2026).
test("T3-based heroes share the AIMS entrance, the header edges and a whole product photo or scene", async ({
  page,
}) => {
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
    if (path === "/about") {
      await expect(page.locator(".page-hero-scene svg.hero-scene")).toBeVisible();
      await expect(page.locator(".page-hero-media img")).toHaveCount(0);
    } else {
      await expect(page.locator(".page-hero-media img")).toBeVisible();
    }
    await expect(page.locator(".page-hero.aims-hero h1 .aims-headline")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("a phone door waits for its drawing to rise into view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 650 });
  await page.goto("/solutions/access-control");
  const story = page.locator(".t3-door");
  await expect(story).toHaveAttribute("data-motion", "flow");
  // The drawing's top just inside the foot of the screen: its first beat waits for it to rise further.
  await story.locator(".home-door-drawing").evaluate((el) => {
    scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * 0.95);
  });
  await page.waitForTimeout(2500);
  await expect(story).toHaveAttribute("data-step", "1");
  await expect(story.locator(".door-card")).toHaveCSS("opacity", "0");
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "0");
  await story.locator(".home-door-drawing").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
});

test("a completed phone door stays complete when the browser viewport height changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/solutions/access-control");
  const story = page.locator(".t3-door");
  await story.locator(".home-door-drawing").evaluate((el) => el.scrollIntoView({ block: "start" }));
  // Wait for the whole walk-through, to the verified tick.
  await expect(story).toHaveAttribute("data-step", "done", { timeout: 8000 });
  await page.setViewportSize({ width: 390, height: 800 });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 500 });
  await expect(story).toHaveAttribute("data-step", "done");
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

// On phones the parts list follows the per-step playback: the highlighted step is the part being shown, each in turn,
// and none once the door rests verified.
test("a phone door highlights each part in turn while it plays", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/solutions/access-control");
  const story = page.locator(".t3-door");
  await expect(story).toHaveAttribute("data-motion", "flow");
  await expect(story).toHaveAttribute("data-step", "1");
  await story.evaluate((el) => {
    const seen: string[] = [];
    (window as unknown as { doorSteps: string[] }).doorSteps = seen;
    new MutationObserver(() => {
      const step = el.getAttribute("data-step");
      if (step && seen.at(-1) !== step) seen.push(step);
    }).observe(el, { attributeFilter: ["data-step"] });
  });
  await story.locator(".home-door-drawing").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
  await expect(story).toHaveAttribute("data-step", "done", { timeout: 4000 });
  const seen = await page.evaluate(() => (window as unknown as { doorSteps: string[] }).doorSteps);
  expect(seen).toEqual(["2", "3", "4", "5", "6", "done"]);
  await expect(story.locator('[data-door-step][aria-current="step"]')).toHaveCount(0);
});
