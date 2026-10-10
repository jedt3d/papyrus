import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { measurePreview } from "./measure-preview.mjs";

async function saveEvidence(page, browser, info, name) {
  const geometry = await measurePreview(page);
  const focus = await page.evaluate(() => {
    const node = document.activeElement;
    const style = getComputedStyle(node);
    return { tag: node.tagName, id: node.id, text: node.textContent,
      focusVisible: node.matches(":focus-visible"), outline: style.outline,
      outlineOffset: style.outlineOffset, selection: [node.selectionStart, node.selectionEnd] };
  });
  const session = await page.context().newCDPSession(page);
  const accessibility = await session.send("Accessibility.getFullAXTree");
  await session.detach();
  const files = ["../src/lib.rs", "../assets/story.css", "../Cargo.lock",
    "../public/assets/DejaVuSans.woff2", "../public/assets/NotoSansThai.ttf", "./input.spec.mjs"];
  const hashes = {};
  for (const file of files) hashes[file] = createHash("sha256").update(await readFile(new URL(file, import.meta.url))).digest("hex");
  await writeFile(info.outputPath(`${name}.json`), JSON.stringify({
    capturedAt: new Date().toISOString(), sourceRevision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    hashes, browser: browser.version(), os: process.platform, architecture: process.arch,
    input: "Playwright browser keys and pointer; no injected focus or component state; OS IME untested",
    geometry, focus, accessibility,
  }, null, 2) + "\n");
  await page.screenshot({ path: info.outputPath(`${name}.png`), animations: "disabled" });
}

test("Tab reaches the Button, reverse Tab returns, and Enter/Space activate it", async ({ page, browser }, info) => {
  await page.goto("/");
  const pickerLabels = ["Button / Primary", "Button / Disabled", "Button / Long content",
    "Card / Default", "Card / Long content", "TextInput / Default", "TextInput / Disabled", "TextInput / Long content"];
  await page.getByRole("button", { name: "Press me", exact: true }).waitFor();
  for (const name of pickerLabels) {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name, exact: true })).toBeFocused();
  }
  const button = page.getByRole("button", { name: "Press me", exact: true });
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline", "rgb(138, 89, 29) solid 3px");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "TextInput / Long content", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("#press-count")).toHaveText("Presses: 1");
  await page.keyboard.press("Space");
  await expect(page.locator("#press-count")).toHaveText("Presses: 2");
  await expect(page.getByRole("status").filter({ hasText: "Presses: 2" })).toBeVisible();
  await saveEvidence(page, browser, info, "keyboard-button");
});

test("keyboard editing keeps TextInput feedback and disabled controls are skipped", async ({ page, browser }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "TextInput / Default", exact: true }).click();
  const last = page.getByRole("button", { name: "TextInput / Long content", exact: true });
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  const input = page.getByRole("textbox", { name: "Component name", exact: true });
  await expect(input).toBeFocused();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+ArrowRight" : "End");
  await page.keyboard.type("xy");
  await expect(input).toHaveValue("Papyrusxy");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Backspace");
  await expect(input).toHaveValue("Papyrusy");
  await expect(page.locator("#text-value")).toHaveText("Value: Papyrusy");
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("New name");
  await expect(input).toHaveValue("New name");
  await expect(page.locator("#text-value")).toHaveText("Value: New name");
  await saveEvidence(page, browser, info, "keyboard-input");
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();

  await page.getByRole("button", { name: "TextInput / Disabled", exact: true }).click();
  await expect(input).toBeDisabled();
  for (let i = 0; i < 2; i++) await page.keyboard.press("Tab");
  await expect(input).not.toBeFocused();
  await input.click({ force: true });
  await page.keyboard.type("x");
  await expect(input).toHaveValue("Read only fixture");
  await expect(page.locator("#text-value")).toHaveText("Value: Read only fixture");
  await saveEvidence(page, browser, info, "disabled-input");

  await page.getByRole("button", { name: "Button / Disabled", exact: true }).click();
  const disabled = page.getByRole("button", { name: "Press me", exact: true });
  await expect(disabled).toBeDisabled();
  for (let i = 0; i < 7; i++) await page.keyboard.press("Tab");
  await expect(disabled).not.toBeFocused();
  await disabled.click({ force: true });
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(page.locator("#press-count")).toHaveText("Presses: 0");
  await saveEvidence(page, browser, info, "disabled-button");
});

test("long fixtures wrap and their controls remain reachable in a narrow Web preview", async ({ page, browser }, info) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/");
  for (const [name, id] of [["Card / Long content", "card/long-content"],
    ["Button / Long content", "button/long-content"], ["TextInput / Long content", "text-input/long-content"]]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator("main")).toHaveAttribute("data-story-id", id);
    const geometry = await measurePreview(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (id.startsWith("card/")) {
      expect(geometry.rects.cardBody.scrollWidth).toBeLessThanOrEqual(geometry.rects.cardBody.clientWidth);
      await expect(page.locator(".card-body")).toContainText("The final words must remain visible.");
      await page.mouse.wheel(0, 600);
      await expect(page.locator(".card-body")).toBeInViewport({ ratio: 1 });
    } else if (id.startsWith("button/")) {
      // From the third picker, six Tabs reach the component after the five remaining pickers.
      for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
      await expect(page.locator(".primary-button")).toBeFocused();
      await page.keyboard.press("Space");
      await expect(page.locator("#press-count")).toHaveText("Presses: 1");
    } else {
      await page.keyboard.press("Tab");
      await expect(page.getByRole("textbox", { name: "Component name" })).toBeFocused();
      await expect(page.locator("input")).toHaveValue(/The final words must remain visible\.$/);
      await page.keyboard.press(process.platform === "darwin" ? "Meta+ArrowRight" : "End");
      await page.keyboard.type("x");
      await expect(page.locator("#text-value")).toContainText("The final words must remain visible.x");
      expect(await page.locator("input").evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
    }
    await saveEvidence(page, browser, info, `narrow-${id.replaceAll("/", "-")}`);
  }
});
