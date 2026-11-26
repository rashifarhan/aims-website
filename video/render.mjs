// Renders a composition to public/video in the site: node render.mjs <id> [--still frame]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [id = "face-check-in", flag, frameArg] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
const outDir = path.resolve("out");
fs.mkdirSync(outDir, { recursive: true });
if (flag === "--still") {
  for (const fr of (frameArg ?? "0").split(",").map(Number)) {
    await renderStill({ composition, serveUrl, frame: fr, output: path.join(outDir, `${id}-${fr}.png`), browserExecutable });
  }
} else {
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 20,
    outputLocation: path.join(outDir, `${id}.mp4`),
    browserExecutable,
    concurrency: 4,
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 25 === 0) console.log("progress", progress.toFixed(2)); },
  });
}
console.log("done");
