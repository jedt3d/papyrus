// Measure the real browser DOM; a Blitz canvas does not expose its story boxes here.
export async function measurePreview(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  return page.evaluate(() => {
    const main = document.querySelector("main[data-story-id]");
    if (!main) throw new Error("A rendered story is required for layout capture");
    const rects = {};
    for (const [name, selector] of Object.entries({
      picker: ".story-picker", main: "main[data-story-id]", heading: "main h1",
      fixture: "main .fixture", component: "main .primary-button, main .card, main input",
      cardHeading: "main .card h2", cardBody: "main .card-body", feedback: "#press-count, #text-value",
      identity: "main .story-id",
    })) {
      const node = document.querySelector(selector);
      if (!node) continue;
      const { x, y, width, height } = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      rects[name] = { x, y, width, height, font: style.font, lineHeight: style.lineHeight,
        clientWidth: node.clientWidth, scrollWidth: node.scrollWidth };
    }
    const input = main.querySelector("input");
    const button = main.querySelector(".primary-button");
    return {
      fixture: main.getAttribute("data-story-id"),
      viewport: [innerWidth, innerHeight], scaleFactor: devicePixelRatio, scroll: [scrollX, scrollY],
      theme: { background: getComputedStyle(document.body).backgroundColor, color: getComputedStyle(document.body).color },
      fontsReady: document.fonts.status === "loaded" && document.fonts.check('16px "Papyrus Sans"'),
      state: { value: input?.value ?? null, disabled: (input ?? button)?.disabled ?? null,
        feedback: document.querySelector("#press-count, #text-value")?.textContent ?? null,
        focus: document.activeElement?.textContent ?? null },
      rects,
    };
  });
}
