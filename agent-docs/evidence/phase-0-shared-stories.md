# Shared Button, Card and TextInput baselines

Checked on 11 October 2026 for [#4](https://github.com/jedt3d/papyrus/issues/4). All three launchers open the same eight fixtures. Web passed headless checks; Blitz WASM and Desktop received actual pointer/key input and were checked visually. This establishes a small working story set, not complete CSS or input compatibility.

## Source, environment and repeat steps

Final source: [`31f4892`](https://github.com/jedt3d/papyrus/commit/31f48921f9c79b14e4880ca400bdcb423a46b499). The tracked software source was clean. Untracked evidence files existed during the Web run, so its raw `workingTreeDirty` flag is retained. CSS SHA-256: `35c7898f209a970cd73076d2dcd13bd6c2d9cb92e999d2d0c14e2c25c32f95db`.

The [machine-readable record](phase-0-shared-stories.json) records source/style/font/lockfile hashes, binary hashes, actual sizes, checks and every capture's revision. The failed disabled-click capture belongs to the earlier `24e9d33` revision; it is not a final result.

| Target | Tested environment |
| --- | --- |
| Web | macOS 26.7 arm64; Chromium 156.0.8078.4; Playwright 1.64.0 headless; 1280 × 720 viewport, scale 1 |
| Blitz WASM | Same OS; Codex In-app Browser, exact browser version unavailable; WebGPU canvas 1280 × 720, viewport 1280 × 720, scale 1; Trunk 0.21.14 |
| Blitz Desktop | Same OS; Xcode 27.0; aarch64-apple-darwin; Vello Hybrid with `WGPU_BACKEND=metal`; requested 1280 × 720 logical content; reported 2560 × 1440 physical surface, scale 2 |

Rust is 1.98.1 and Dioxus is 0.7.10. Both Blitz launchers retain commit `7832c177ff272128154bac58afe56c2b9164b417`, Native wrapper 0.7.0, Blitz packages 0.3.0-beta.2, Vello Hybrid 0.11.0, Parley 0.12.0 and winit 0.31.0-beta.3. Dependency lockfiles and font bytes are unchanged.

Use the [shared fixture table and baseline steps](../../source/README.md#choose-the-same-fixture-on-each-target). Build/run commands remain in the [Web](../../source/README.md), [WASM](../../source/blitz-wasm/README.md) and [Desktop](../../source/blitz-desktop/README.md) guides. Click the same labelled picker button on each target and read the visible `Story:` line. Switch away and back to reset state; reload/restart returns to Button / Primary. That selection also preserves the existing Thai experiment.

Card has no disabled fixture because it is a non-interactive text container. There are no target-specific component, fixture or CSS declaration overrides. Blitz retains the explicit data-URI font delivery and custom font context from #2/#3; Web serves the same licensed font bytes.

## Observed baseline results

| Fixture | Web | Blitz WASM | Blitz Desktop |
| --- | --- | --- | --- |
| `button/primary` | Clicks and Enter update count | Two real clicks produce count 2 | Two real clicks produce count 2 |
| `button/disabled` | Disabled; forced pointer attempt leaves count 0 | Real click leaves count 0 after fix | Real click leaves count 0 after fix |
| `button/long-content` | Wrapping label; click produces count 1 | Same visible label; click produces count 1 | Same visible label; click produces count 1 |
| `card/default` | Title/body visible | Title/body visible | Title/body visible |
| `card/long-content` | Wraps without horizontal overflow | Wraps; final words visible | Wraps; final words visible |
| `text-input/default` | Edit/delete and feedback match | `Papyrus → Papyrusx → Papyrus` | `Papyrus → Papyrusx → Papyrus` |
| `text-input/disabled` | Disabled; initial value/feedback match | Click/key attempt leaves initial value unchanged | Click/key attempt leaves initial value unchanged |
| `text-input/long-content` | Full value, matching feedback and editing | End edit appears in input and wrapping feedback | End edit appears in input and wrapping feedback; key anomaly below |

Returning to TextInput / Default restored `Papyrus` on every target. The generic TextInput is controlled for this simple editing experiment. The Thai observer is still uncontrolled; these checks do not validate composition.

Representative Web captures: [Card](phase-0-stories-web-card-long.png), [edited TextInput](phase-0-stories-web-input-edited.png), [long Button](phase-0-stories-web-button-long.png). Its [raw browser record](phase-0-stories-web-browser.json) retains environment and Thai regression observations.

Blitz WASM captures: [default Card](phase-0-stories-wasm-card-default.jpg), [long Card](phase-0-stories-wasm-card-long.jpg), [input edit](phase-0-stories-wasm-input-edited.jpg), [deletion](phase-0-stories-wasm-input-deleted.jpg), [disabled input](phase-0-stories-wasm-input-disabled.jpg), [long input](phase-0-stories-wasm-input-long.jpg), [reset](phase-0-stories-wasm-input-reset.jpg), [primary Button](phase-0-stories-wasm-button-primary.jpg), [disabled Button](phase-0-stories-wasm-button-disabled.jpg), [long Button](phase-0-stories-wasm-button-long.jpg).

Desktop captures: [default Card](phase-0-stories-desktop-card-default.jpg), [long Card](phase-0-stories-desktop-card-long.jpg), [input edit](phase-0-stories-desktop-input-edited.jpg), [deletion](phase-0-stories-desktop-input-deleted.jpg), [disabled input](phase-0-stories-desktop-input-disabled.jpg), [long input](phase-0-stories-desktop-input-long.jpg), [reset](phase-0-stories-desktop-input-reset.jpg), [primary Button](phase-0-stories-desktop-button-primary.jpg), [disabled Button](phase-0-stories-desktop-button-disabled.jpg), [long Button](phase-0-stories-desktop-button-long.jpg).

The WASM host had one WebGPU canvas and zero story Button/input DOM elements. We read rendered text in captures; no counter/value injection or synthetic Dioxus events were used for Blitz runtime checks. Native accessibility remains disabled in this minimal launcher, so its controls were reached through pointer coordinates.

## The disabled Button failure and fix

At `24e9d33`, a real WASM click activated the visibly disabled Button: [count 1 failure](phase-0-stories-wasm-disabled-failure.jpg). The pinned [pointer handler](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/blitz-dom/src/events/pointer.rs#L600) dispatches a click on pointer release; its disabled check belongs to the default action. The [Native adapter](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native-dom/src/dioxus_document.rs#L347) delivers that event to Dioxus. Our callback accepted every delivered click.

The shared Button now rejects activation when its `disabled` prop is true. A public Dioxus event regression test failed before this guard and passed afterwards. Actual clicks on both rebuilt Blitz targets left the count at zero. This fixes Papyrus's Button contract; it does not claim to repair upstream event propagation for arbitrary controls.

False disabled props also omit the boolean HTML attribute. The pinned [attribute writer](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native-dom/src/mutation_writer.rs#L380) would otherwise preserve `disabled="false"`, while HTML boolean semantics treat presence as disabled. This shared representation preserves working enabled fixtures.

## Checks, differences and limits

Four shared Rust behavior/asset tests, formatting and Clippy passed. Web WASM checking, Blitz WASM build/Clippy and Desktop build/Clippy passed. All four headless Web tests passed locally and in [GitHub Actions](https://github.com/jedt3d/papyrus/actions/runs/38086229382). CI still tests Web; the Blitz runtime observations were separate local checks.

The selected picker background appears on Web but not in either Blitz capture. The visible story identity still identifies the selected fixture. The cause of this styling difference is unisolated and must not become an attribute-selector compatibility claim.

For the native long-input check, one `x` key request produced `u`; both input and feedback showed that actual received value. The default-input `x`/Backspace sequence worked. We have not isolated the difference to automation, OS input source, winit or Blitz. Exact keyboard mapping belongs in #7/#8; this record establishes editing/state feedback only.

Desktop raw JPEGs are 2560 × 1504 including chrome; the reported content is 2560 × 1440 at scale 2. This differs from #3's reported scale 1, so every run must record actual scale. The unchanged debug binary was copied into the existing temporary automation wrapper and run directly with Metal; release packaging remains unverified. Pointer coordinates reached the visible controls, but no calibrated cross-renderer image/layout comparison was performed.

While checking media headers, we also corrected #3's image metadata: its original `.png` paths contain JPEG bytes, 2560 × 1504. The historical bytes, hashes and paths are retained; only the incorrect format/dimension metadata was corrected.

Next is #5 for repeatable capture and layout evidence. #6–#8 can now investigate reload, wider input/accessibility, Thai fonts and genuine IME. Windows/Linux, WebGL-only operation, release packaging and broad CSS compatibility remain unverified. Papyrus Studio and its permanent harness are still planned.
