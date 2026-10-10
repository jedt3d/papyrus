# Blitz WASM: shared Button and Thai fixtures

Checked on 11 October 2026 for [#2](https://github.com/jedt3d/papyrus/issues/2), after the [Web Thai check](phase-0-thai-web.md). The shared Button runs and receives real clicks on Blitz WASM. Desktop and genuine IME composition are unverified.

## Revisions and environment

Source: [`96732a6`](https://github.com/jedt3d/papyrus/commit/96732a6). The Rust library, `button/primary` identity, Button props and Thai fixtures are shared with Web. CSS source SHA-256: `fc32371c9a9fa034d920d0e09b27293e805cdd07410b02300b3d6ff7370203f1`. Font hashes are in the [Thai record](phase-0-thai-web.md).

| Item | Observed / resolved value |
| --- | --- |
| Rust / Trunk | 1.98.1 / 0.21.14 |
| Dioxus core | 0.7.10 |
| Blitz Git revision | `7832c177ff272128154bac58afe56c2b9164b417` |
| Blitz / Native wrapper | 0.3.0-beta.2 / 0.7.0 (Git packages) |
| Taffy Git revision | `7d33901cc383489d9945ae796a1ceed0a935ef66`, package 0.14.0 |
| AnyRender hybrid / Parley / Fontique | 0.11.0 / 0.12.0 / 0.12.0 |
| Winit / wasm-bindgen | 0.31.0-beta.3 / 0.2.129 |
| Renderer / active browser API | Vello Hybrid window renderer / **WebGPU** |
| OS / browser | macOS 26.7 arm64 / Codex In-app Browser; exact version unavailable |
| Final capture | 1280 × 720 CSS pixels, scale factor 1; canvas 1280 × 720 |
| Build | Debug WASM; 124,176,964 bytes, about 118 MiB; no release size optimization |

The graph contains wgpu 29.0.4 (the hybrid renderer dependency) and 30.0.1; retain the [lockfile](../../source/blitz-wasm/Cargo.lock). The [browser record](phase-0-blitz-wasm-browser.json) records the actual canvas context and interactions. The Trunk macOS archive was checksum-verified: `764e299dd50d89442a4e96a236349f57961984b701e74d3dbdb39cd1c9f5101e`.

## What passed

WASM `cargo check`, Clippy and `trunk build --public-url ./ --frozen` passed. The [run guide](../../source/blitz-wasm/README.md) includes commands and the `NO_COLOR` workaround.

Reload showed zero. Two real clicks on the visible Button changed the count to one and two. The [screenshot](phase-0-blitz-wasm-button.png) shows `Presses: 2`. The count was read from the rendered canvas, not assigned in code or extracted from DOM text. The browser has one canvas and no Button/input elements for these stories. This, the Native launcher and its pinned renderer graph establish Blitz rendering.

The Thai fixtures visibly render and wrap in the same 320px style area. The same DejaVu and Noto bytes are bundled; system-font discovery is disabled in the supplied context. This verifies the captured fixtures, not every Thai font/layout case.

## Asset failure and fix

The first bundle built but panicked before drawing: native asset resolution called `current_exe()` on WASM, where it is unsupported. The [failed run](phase-0-blitz-wasm-failure.json) is tied to `bfa836d`. The [Native provider](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native/src/assets.rs) routes `dioxus:` URLs through Dioxus's [filesystem resolver](https://docs.rs/crate/dioxus-asset-resolver/0.7.10/source/src/native.rs).

The shared `embedded-style` path now embeds CSS and converts its two font URLs to data URIs. Other declarations and font bytes are unchanged. Blitz's [data-URI provider](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/blitz-shell/src/net.rs) delivers those bytes. A regression test decodes and compares both fonts; the full embedded-style Rust suite has three passing tests. This is an explicit asset adaptation, not proof that Web asset URLs work unchanged on Native. Both licenses travel with the bundle.

## Backend and input differences

The [WASM guide](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/HOWTO_WASM.md) describes WebGL, and that feature is enabled. The actual [Dioxus renderer](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native/src/dioxus_renderer.rs) chooses `VelloHybridWindowRenderer`. A host-page observer records the context successfully opened: `webgpu` in this run. WebGL-only operation is **unverified**; a feature name does not prove it ran.

Enter immediately after clicking did not increment the count. This is one observed interaction, not a complete keyboard verdict; #7 still needs its full cases.

Codex's Unicode `typeText` request for the Thai fixture produced `u`, shown in the [input capture](phase-0-blitz-wasm-input.png). Backspace removed it, and an ASCII `a` key produced `a` in input and echo. The failure has not been isolated to automation, winit or Blitz; do not equate it with an actual Thai keyboard failure.

No genuine composing session was exercised. The [Native converter](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native-dom/src/events.rs) also leaves `convert_composition_data` unimplemented. That is a source limitation, not a composition panic observed here. Keep preedit/commit/cancel cases open.

## Conclusion

Shared stories run through Blitz WASM after explicit asset delivery, and clicks update real Rust state. This run uses WebGPU. Before an online gallery, check release size, WebGL-only viability or a clear WebGPU requirement, and browser coverage. Desktop remains #3. Thai keyboard/composition, capture, reload and wider input remain open Phase 0 checks.
