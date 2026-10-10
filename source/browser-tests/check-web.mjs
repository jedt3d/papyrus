import assert from "node:assert/strict";

// Works with a Playwright page or Codex's documented tab.playwright surface.
export async function checkWebPreview(page) {
  const button = page.getByRole("button", { name: "Press me", exact: true });
  await button.waitFor({ state: "visible" });
  assert.equal(await page.locator("#press-count").innerText(), "Presses: 0");
  await button.click();
  assert.equal(await page.locator("#press-count").innerText(), "Presses: 1");
  await button.click();
  assert.equal(await page.locator("#press-count").innerText(), "Presses: 2");
  const input = page.getByLabel("Thai / IME input", { exact: true });
  await input.fill("น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไทย");
  assert.equal(await page.locator("#input-echo").innerText(), "Input value: น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไทย");
  await input.press("Backspace");
  assert.equal(await page.locator("#input-echo").innerText(), "Input value: น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไท");
  await input.press("Shift+Tab");
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), "Press me");
  await button.press("Enter");
  assert.equal(await page.locator("#press-count").innerText(), "Presses: 3");
  const evidence = await page.evaluate(() => {
    const block = document.querySelector("#thai-long");
    const bounds = block.getBoundingClientRect();
    return {
      viewport: [window.innerWidth, window.innerHeight],
      scaleFactor: window.devicePixelRatio,
      input: document.querySelector("#thai-input").value,
      echo: document.querySelector("#input-echo").textContent,
      composition: document.querySelector("#composition-status").textContent,
      thaiFontLoaded: document.fonts.check('16px "Papyrus Thai"', "น้ำ กุ้ง ปี่ กี้"),
      fontStatus: document.fonts.status,
      wrapWidth: bounds.width,
      wrapHeight: bounds.height,
      lineHeight: getComputedStyle(block).lineHeight,
    };
  });
  assert.equal(evidence.input, "น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไท");
  assert.equal(evidence.echo, "Input value: น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไท");
  assert.equal(evidence.thaiFontLoaded, true, "the bundled Thai font must load");
  assert.equal(evidence.wrapWidth, 320);
  assert.ok(evidence.wrapHeight / parseFloat(evidence.lineHeight) > 1, "long Thai content wraps");
  assert.equal(evidence.composition, "Composition: idle; starts: 0; updates: 0; ends: 0");
  return evidence;
}
