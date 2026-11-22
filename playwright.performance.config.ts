import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/** Budget measurements run in isolation: competing browser workers distort CPU throttling. */
export default defineConfig({
  ...base,
  testDir: "tests/performance",
  outputDir: "performance-results",
  workers: 1,
  repeatEach: 3, // Plan AT-11: three isolated measurements per locale.
  fullyParallel: false,
  projects: [{ name: "mobile-budget", use: { viewport: { width: 390, height: 844 } } }],
});
