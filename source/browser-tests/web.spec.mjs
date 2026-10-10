import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { checkWebPreview } from "./check-web.mjs";

test("Web Button and Thai input preserve visible behavior and load bundled assets", async ({ page, browser, request }, info) => {
  await page.goto("/");
  await page.getByLabel("Thai / IME input", { exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  const evidence = await checkWebPreview(page);
  const font = await request.get("/assets/NotoSansThai.ttf");
  expect(font.ok()).toBe(true);
  expect(createHash("sha256").update(await font.body()).digest("hex"))
    .toBe("5a1c559bb539583c8a1fd99d1c5b9491e5e14478c9cd2bd0970d5c3096cc9ef8");
  const license = await request.get("/LICENSE-NotoSansThai.txt");
  expect(license.ok()).toBe(true);
  expect(await license.text()).toContain("SIL OPEN FONT LICENSE");
  await page.screenshot({ path: info.outputPath("web-preview.png"), fullPage: true });
  await writeFile(info.outputPath("environment.json"), JSON.stringify({
    sourceRevision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    workingTreeDirty: execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim().length > 0,
    styleSHA256: createHash("sha256").update(await readFile(new URL("../assets/story.css", import.meta.url))).digest("hex"),
    browser: "Chromium", browserVersion: browser.version(),
    os: process.platform, architecture: process.arch,
    renderer: "Dioxus Web / browser DOM CSS",
    inputMethod: "Playwright Unicode fill and browser keys; OS IME untested",
    ...evidence,
  }, null, 2) + "\n");
});
