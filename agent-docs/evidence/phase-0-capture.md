# Repeatable capture and available layout evidence

Checked on 11 October 2026 for [#5](https://github.com/jedt3d/papyrus/issues/5). We saved all eight initial fixtures on Web, Blitz WASM and Blitz Desktop, then restored and captured the long Card again on each target. The 27 baseline images share revision [`78da51d`](https://github.com/jedt3d/papyrus/commit/78da51d776e381cef316b968eda2bb11bc6126ff), Rust components, CSS, fonts and fixture values. Earlier trial/calibration images are marked separately. This is evidence for choosing a harness, not a cross-renderer pixel pass.

## Environment and traceability

[manifest.json](phase-0-capture/manifest.json) records the source revision, capture profile and its hash, asset/lockfile/binary hashes, formats, dimensions, timestamps, repeat results and limits. Software was clean at the final captures. Shared component and CSS bytes are unchanged from #4. Only Web measurement/capture code and native pointer-time window logging were added. Both native binary copies have the same hash. Original image bytes are preserved.

The machine is macOS 26.7 (25G229), arm64. Rust is 1.98.1, Dioxus 0.7.10, Node 26.9.0, Playwright 1.64.0, Chromium 156.0.8078.4 and Trunk 0.21.14. Blitz remains at `7832c177ff272128154bac58afe56c2b9164b417`, with Native 0.7.0, Vello Hybrid 0.11.0 and Parley 0.12.0. Dependencies and font assets were not changed.

| Target | Actual measurement | Capture |
| --- | --- | --- |
| Web | 1280 × 720 CSS px, device scale 1 | Headless Playwright PNG, 1280 × 720 |
| Blitz WASM | 1280 × 720 CSS-pixel host/canvas box; 1280 × 720 canvas buffer; scale 1; actual WebGPU context | Codex In-app Browser JPEG, 1280 × 720; exact browser version unavailable |
| Blitz Desktop | Window API reports 1280 × 720 physical surface, scale 1, Light theme during 40 pointer samples | CUA JPEG, 2560 × 1504; chrome, pointer halo and blank area included; mapping limitation below |

All use the fixed light `story.css` theme, unchanged DejaVu Sans and Noto Sans Thai bytes. Web waits for `document.fonts.ready` and checks the Sans face. Blitz registers bundled fonts and its shell skips painting while critical resources are pending; we still inspect painted text before capture. Browser font readiness cannot measure fonts inside Blitz's canvas. Thai correctness remains #8.

## Available APIs and coordinate conventions

| Measurement | What was saved | Limit |
| --- | --- | --- |
| Web `getBoundingClientRect()` | [Every fixture's geometry](phase-0-capture/web-geometry.json), fonts, line height, scroll/overflow, values and focus | CSS px, viewport-relative border boxes; origin top left, x right, y down. This measures browser DOM only. |
| WASM host DOM/canvas | [Host geometry](phase-0-capture/wasm-host-geometry.json), scale and graphics context | No story DOM elements. A canvas box is not a Card or input box. Internal component geometry is **unavailable through the current launcher**. |
| Native `use_window()` | [Pointer-time surface/scale/theme log](phase-0-capture/desktop-window.log) | Surface is in API physical pixels; requested size is logical. These are window measurements, not component bounds or screenshot calibration. |
| CUA `getScreenshot()` | Raw JPEGs, hashes and actual decoded dimensions | Capture-image pixels, including tool/platform presentation. Native input coordinates do not currently match those image pixels. |

The pinned engine does expose [`BaseDocument::get_client_bounding_rect()`](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/blitz-dom/src/document.rs#L2252), with viewport-relative x/y/width/height. Its source describes physical axes and layout coordinates. [Viewport scaling](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/blitz-traits/src/shell.rs#L110) combines HiDPI scale and zoom. We have **not calibrated the runtime units against CSS and captured pixels at scales 1 and 2**; do not label these unmeasured results as device pixels.

[`DioxusDocument::inner`](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native-dom/src/dioxus_document.rs#L68) is public, but `launch_cfg()` owns that document inside the application. The [Native application](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native/src/dioxus_application.rs#L36) keeps its inner shell private. Its [document provider's `eval()`](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native/src/contexts.rs#L19) delegates to `NoOpDocument`. The inspected Native renderer wrapper has no exposed screenshot/readback method. These are limits of this path, not claims that Blitz can never measure or capture content. Runtime component geometry is `null` in the manifest. Accessibility is still disabled in this baseline.

For a later Blitz harness, use an embedder that retains the document handle, samples after layout/critical resources settle and exposes calibrated geometry plus a known renderer capture surface. This changes launcher ownership and needs the architecture decision in #9. We did not fork Blitz or replace launchers for this investigation.

## Raw baseline captures

Buttons remain at `Presses: 0`. Inputs keep their shared initial value; no input is focused or edited. Card has no disabled variant. Web retains picker focus and puts the pointer at (0,0). Blitz receives a neutral background click after selection; its canvas/native window stays focused. These capture-state differences are explicit.

| Fixture | Web | Blitz WASM | Blitz Desktop |
| --- | --- | --- | --- |
| `button/primary` | [PNG](phase-0-capture/web-1-button-primary.png) | [JPEG](phase-0-capture/wasm-button-primary.jpg) | [JPEG](phase-0-capture/desktop-button-primary.jpg) |
| `button/disabled` | [PNG](phase-0-capture/web-2-button-disabled.png) | [JPEG](phase-0-capture/wasm-button-disabled.jpg) | [JPEG](phase-0-capture/desktop-button-disabled.jpg) |
| `button/long-content` | [PNG](phase-0-capture/web-3-button-long-content.png) | [JPEG](phase-0-capture/wasm-button-long-content.jpg) | [JPEG](phase-0-capture/desktop-button-long-content.jpg) |
| `card/default` | [PNG](phase-0-capture/web-4-card-default.png) | [JPEG](phase-0-capture/wasm-card-default.jpg) | [JPEG](phase-0-capture/desktop-card-default.jpg) |
| `card/long-content` | [PNG](phase-0-capture/web-5-card-long-content.png) | [JPEG](phase-0-capture/wasm-card-long-content.jpg) | [JPEG](phase-0-capture/desktop-card-long-content.jpg) |
| `text-input/default` | [PNG](phase-0-capture/web-6-text-input-default.png) | [JPEG](phase-0-capture/wasm-text-input-default.jpg) | [JPEG](phase-0-capture/desktop-text-input-default.jpg) |
| `text-input/disabled` | [PNG](phase-0-capture/web-7-text-input-disabled.png) | [JPEG](phase-0-capture/wasm-text-input-disabled.jpg) | [JPEG](phase-0-capture/desktop-text-input-disabled.jpg) |
| `text-input/long-content` | [PNG](phase-0-capture/web-8-text-input-long-content.png) | [JPEG](phase-0-capture/wasm-text-input-long-content.jpg) | [JPEG](phase-0-capture/desktop-text-input-long-content.jpg) |
| Long Card restored | [PNG](phase-0-capture/web-9-card-long-content.png) | [JPEG](phase-0-capture/wasm-card-long-content-repeat.jpg) | [JPEG](phase-0-capture/desktop-card-long-content-repeat.jpg) |

## Repeat observations

We selected other fixtures, restored the long Card and repeated the same capture settings. Python 3.14.7 / the already installed Pillow 12.3.0 decoded both images as RGB. A changed pixel has any nonzero channel difference; no threshold, resizing or colour correction was applied.

| Target | Layout | Raw raster repeat |
| --- | --- | --- |
| Web | All measured rectangles are identical | 50 of 921,600 pixels differ (0.00543%); maximum RGB channel difference 1/255. Changed image bounds: x 304–812, y 69–299. PNG hashes differ. |
| Blitz WASM | Component API geometry unavailable; no visible box/wrap change | 0 changed pixels; JPEG bytes identical in this pair |
| Blitz Desktop | Component API geometry unavailable; window samples unchanged; no visible box/wrap change | 0 changed pixels; JPEG bytes identical in this pair |

The Web trial reproduced the same 50-pixel variation. Its [first](phase-0-capture/web-trial-5-card-long-content.png) and [second](phase-0-capture/web-trial-9-card-long-content.png) captures belong to `aab18f6`, before the final harness commit, and are excluded from cross-target comparisons. The exact cause of the one-level raster variation is unisolated. It is not evidence of changed geometry or a font substitution. The test now records image equality and checks geometry separately; it does not require pixel identity.

To repeat this RGB calculation, run from the repository root with Pillow available and substitute either recorded same-target pair:

```python
from PIL import Image, ImageChops
from pathlib import Path
p = Path("agent-docs/evidence/phase-0-capture")
a = Image.open(p / "web-5-card-long-content.png").convert("RGB")
b = Image.open(p / "web-9-card-long-content.png").convert("RGB")
assert a.size == b.size
d = ImageChops.difference(a, b)
print(sum(pixel != (0, 0, 0) for pixel in d.get_flattened_data()))
print(d.getbbox(), max(channel[1] for channel in d.getextrema()))
```

This is two same-session observations for one fixture per target. It does not establish cross-session, machine or backend stability. JPEG can hide small changes. Carets, hover/focus, pending fonts, animation and capture-tool presentation must be recorded before comparison.

## Layout and raster findings are separate

**Layout:** Web's long Card is x 304, y 288, width 320, height 305.0625 CSS px. Its main container is 720 CSS px wide. The repeated API geometry is unchanged. In all three images, the Card heading wraps to two visible lines and its body to seven, ending with “must remain visible.” Long Buttons wrap to three lines. Input feedback retains the initial value. The painted arrangements look close, but numeric cross-renderer component deltas remain **unknown** without Blitz document access and unit calibration.

**Raster/text appearance:** Web paints the selected picker dark green; neither Blitz target does. Colours and text edges differ between capture pipelines. The same font bytes do not guarantee identical shaping, rounding, antialiasing or captured colour. Web uses lossless PNG; these Blitz captures use JPEG. We did not calculate a cross-target pixel score or infer a CSS-property support verdict from those images.

**Native capture calibration:** The [live calibration image](phase-0-capture/desktop-live-calibration.jpg) visibly places a 1280 × 720 painted region at image offset (0,32) inside a 2560 × 1504 JPEG. That is a raster observation, not a window/component API measurement. A Card picker click at its observed image coordinate (540,120) did not change the fixture; CUA (1080,240) did. The earlier [scale-1 calibration](phase-0-capture/desktop-calibration-scale-1.jpg) uses the previous revision. Both observations preserve the mismatch rather than silently cropping or rescaling it. The cause is not isolated to CUA, the OS or winit. Native raw images are unsuitable for an automatic cross-renderer pixel gate until that mapping is resolved. Never reuse the successful coordinate multiplier on another run without checking it.

## Smallest working capture/check path

1. Use the [pinned build commands](../../source/README.md) and record a clean source revision plus source/CSS/font/lockfile hashes. Use the [same eight fixture identities](../../source/README.md#choose-the-same-fixture-on-each-target), initial values, light theme and 1280 × 720 logical viewport. Check actual scale and backend.
2. **Web automation:** run `CI=true pnpm test` in `source/browser-tests/` with a fresh server. `capture.spec.mjs` selects all eight fixtures, waits for fonts and two animation frames, moves the pointer away, saves geometry/PNG per fixture and restores the long Card for a repeat. It records equality without making it a pixel guarantee. The existing Actions workflow uploads these outputs; no new workflow or dependency was needed.
3. **Blitz local/manual steps:** start WASM and Desktop separately. Set/check the actual WASM viewport/canvas. On Native, read the new `Papyrus capture:` pointer-time lines alongside the image, not just startup output. Select each labelled fixture with CUA or a human pointer, inspect its visible `Story:` identity and initial value/count, then click empty background outside controls. Save original JPEG bytes. Switch away and restore the long Card for another capture. Native pointer coordinates need a fresh calibration; fixture selection and font readiness are visual checks, not canvas DOM assertions. The minimum native launcher uses the existing temporary macOS automation wrapper; this is not release packaging.
4. Save actual image format/dimensions, timestamps, profile/source/style/asset hashes, geometry units and unknowns. Compare only matching fixtures and revisions. Keep layout, raster and capture-platform findings separate. Reject a size/mapping mismatch before automatic image comparison; keep the raw evidence.

All five headless Web tests, four shared Rust behavior/asset tests, Web WASM checking, formatting, Clippy, both Blitz builds and native live pointer logging passed locally. Wider keyboard/accessibility, OS IME, other operating systems and WebGL-only rendering remain unverified. Next is #6 for CSS reload and the last working preview; #7/#8 retain input and Thai/IME checks. Final architecture decisions remain #9.
