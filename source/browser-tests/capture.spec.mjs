import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { measurePreview } from "./measure-preview.mjs";

test("capture all baseline fixtures with geometry and repeat a reset Card", async ({ page, browser }, info) => {
  await page.goto("/");
  const fixtures = [
    ["button/primary", "Button / Primary"],
    ["button/disabled", "Button / Disabled"],
    ["button/long-content", "Button / Long content"],
    ["card/default", "Card / Default"],
    ["card/long-content", "Card / Long content"],
    ["text-input/default", "TextInput / Default"],
    ["text-input/disabled", "TextInput / Disabled"],
    ["text-input/long-content", "TextInput / Long content"],
    ["card/long-content", "Card / Long content"],
  ];
  const captures = [];
  for (const [index, [id, label]] of fixtures.entries()) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator("main[data-story-id]")).toHaveAttribute("data-story-id", id);
    await page.mouse.move(0, 0);
    const geometry = await measurePreview(page);
    expect(geometry.viewport).toEqual([1280, 720]);
    expect(geometry.scaleFactor).toBe(1);
    expect(geometry.fontsReady).toBe(true);
    expect(geometry.rects.main.width).toBe(720);
    if (id.startsWith("card/")) expect(geometry.rects.component.width).toBe(320);
    const image = `${index + 1}-${id.replaceAll("/", "-")}.png`;
    const pixels = await page.screenshot({ path: info.outputPath(image), animations: "disabled", caret: "hide", scale: "device" });
    captures.push({ image, capturedAt: new Date().toISOString(), sha256: createHash("sha256").update(pixels).digest("hex"), ...geometry });
  }
  const first = captures[4];
  const repeat = captures[8];
  expect(repeat.rects).toEqual(first.rects);
  const hash = async path => createHash("sha256").update(await readFile(new URL(path, import.meta.url))).digest("hex");
  await writeFile(info.outputPath("captures.json"), JSON.stringify({
    sourceRevision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    trackedSoftwareDirty: execFileSync("git", ["status", "--porcelain", "--untracked-files=no", "--", "../src", "../assets", "../public", "../Cargo.toml", "../Cargo.lock", "../index.html", "../Dioxus.toml", "../rust-toolchain.toml", "../blitz-wasm", "../blitz-desktop"], { encoding: "utf8" }).trim().length > 0,
    assetsSHA256: {
      rust: await hash("../src/lib.rs"), css: await hash("../assets/story.css"),
      sans: await hash("../public/assets/DejaVuSans.woff2"), thai: await hash("../public/assets/NotoSansThai.ttf"),
    },
    browser: "Chromium", browserVersion: browser.version(), os: process.platform, architecture: process.arch,
    units: "CSS px; viewport-relative border boxes; x right, y down; scroll recorded separately",
    capture: "PNG; device pixels; viewport only; animations disabled; caret hidden; pointer at (0,0); picker keeps focus",
    repeat: { first: first.image, second: repeat.image, identicalGeometry: true, identicalPNG: repeat.sha256 === first.sha256 },
    captures,
  }, null, 2) + "\n");
});
