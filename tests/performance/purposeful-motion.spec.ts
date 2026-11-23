import { expect, test } from "@playwright/test";

// The same isolated mobile conditions as the home AT-11 test, applied to the changed templates.
for (const path of [
  "/solutions/access-control",
  "/solutions/time-attendance",
  "/product/f18",
  "/software/biotime-9-5",
]) {
  for (const prefix of ["", "/ar"]) {
    test(`${prefix}${path} keeps the mobile LCP and CLS budgets`, async ({ page, context }, testInfo) => {
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
      page.on("pageerror", (error) => errors.push(error.message));
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
      await page.goto(`${prefix}${path}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState("networkidle");
      const metrics = { ...(await page.evaluate(() => window.homeMetrics)), transfer };
      await testInfo.attach("mobile-performance", { body: JSON.stringify(metrics), contentType: "application/json" });
      expect(errors).toEqual([]);
      expect(metrics.lcp).toBeGreaterThan(0);
      expect(metrics.lcp).toBeLessThanOrEqual(2500);
      expect(metrics.cls).toBeLessThanOrEqual(0.05);
    });
  }
}
