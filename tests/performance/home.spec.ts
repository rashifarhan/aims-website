import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    homeMetrics: { lcp: number; cls: number };
  }
}

// Master Plan AT-11: retain the homepage measurements and cover all four T7 entry points.
for (const path of [
  "/",
  "/ar",
  "/zkteco-distributor-in-dubai",
  "/zkteco-distributor-in-oman",
  "/zkteco-distributors-in-kenya",
  "/ar/zkteco-dubai",
]) {
  test(`${path} mobile page meets transfer, LCP and CLS budgets`, async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 1_600_000 / 8,
      uploadThroughput: 750_000 / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    let transfer = 0;
    cdp.on("Network.loadingFinished", (event) => {
      transfer += event.encodedDataLength;
    });
    const errors: string[] = [];
    const externalRequests: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (new URL(request.url()).hostname !== "localhost") externalRequests.push(request.url());
    });
    await page.addInitScript(() => {
      window.homeMetrics = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.homeMetrics.lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) window.homeMetrics.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    const metrics = { ...(await page.evaluate(() => window.homeMetrics)), transfer };
    await testInfo.attach("mobile-performance", { body: JSON.stringify(metrics), contentType: "application/json" });
    expect(errors).toEqual([]);
    expect(externalRequests).toEqual([]);
    expect(metrics.lcp).toBeGreaterThan(0);
    expect(metrics.lcp).toBeLessThanOrEqual(2500);
    expect(metrics.cls).toBeLessThanOrEqual(0.05);
    expect(metrics.transfer).toBeLessThanOrEqual(1_000_000);
  });
}
