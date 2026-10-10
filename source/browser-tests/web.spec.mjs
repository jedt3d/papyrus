import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { checkWebPreview } from "./check-web.mjs";

test("shared Card fixtures can be selected and long content wraps", async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Card / Default", exact: true }).click();
  const card = page.locator('[data-story-id="card/default"]');
  await expect(card.getByRole("heading", { name: "One component, three renderers", exact: true })).toBeVisible();
  await expect(card).toContainText("Shared Rust props, CSS, and bundled fonts.");
  await page.getByRole("button", { name: "Card / Long content", exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  const long = page.locator('[data-story-id="card/long-content"] .card-body');
  await expect(long).toContainText("A narrow card still needs to keep every word readable.");
  const bounds = await long.evaluate(node => ({
    height: node.getBoundingClientRect().height,
    lineHeight: parseFloat(getComputedStyle(node).lineHeight),
    overflow: node.scrollWidth > node.clientWidth,
  }));
  expect(bounds.height / bounds.lineHeight).toBeGreaterThan(1);
  expect(bounds.overflow).toBe(false);
  await page.screenshot({ path: info.outputPath("card-long.png") });
});

test("TextInput fixtures show edits, disabled values, and reset when reselected", async ({ page }, info) => {
  await page.goto("/");
  const choose = name => page.getByRole("button", { name, exact: true }).click({ timeout: 5000 });
  await choose("TextInput / Default");
  const input = page.getByLabel("Component name", { exact: true });
  await expect(page.locator('[data-story-id="text-input/default"]')).toBeVisible();
  await expect(input).toHaveValue("Papyrus");
  await input.fill("New name");
  await input.press("Backspace");
  await expect(input).toHaveValue("New nam");
  await expect(page.locator("#text-value")).toHaveText("Value: New nam");
  await page.screenshot({ path: info.outputPath("text-input-edited.png") });
  await choose("TextInput / Disabled");
  await expect(input).toBeDisabled();
  await expect(input).toHaveValue("Read only fixture");
  await expect(page.locator("#text-value")).toHaveText("Value: Read only fixture");
  await choose("TextInput / Long content");
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue(/The final words must remain visible\.$/);
  await expect(page.locator("#text-value")).toContainText("The final words must remain visible.");
  await input.fill("Short");
  await expect(page.locator("#text-value")).toHaveText("Value: Short");
  await choose("TextInput / Default");
  await expect(input).toHaveValue("Papyrus");
  await expect(page.locator("#text-value")).toHaveText("Value: Papyrus");
});

test("Button fixtures keep disabled actions inactive and long labels usable", async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Button / Disabled", exact: true }).click({ timeout: 5000 });
  const disabled = page.locator('[data-story-id="button/disabled"] button');
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true });
  await expect(page.locator("#press-count")).toHaveText("Presses: 0");
  await page.getByRole("button", { name: "Button / Long content", exact: true }).click();
  const long = page.locator('[data-story-id="button/long-content"] button');
  await expect(long).toBeEnabled();
  await expect(long).toContainText("check how the text wraps");
  await long.click();
  await expect(page.locator("#press-count")).toHaveText("Presses: 1");
  await page.screenshot({ path: info.outputPath("button-long.png") });
  await page.getByRole("button", { name: "Button / Primary", exact: true }).click();
  await expect(page.locator("#press-count")).toHaveText("Presses: 0");
});

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
