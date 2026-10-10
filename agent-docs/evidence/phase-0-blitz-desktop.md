# Blitz Desktop: shared Button baseline

Verified on 11 October 2026 for [#3](https://github.com/jedt3d/papyrus/issues/3). A native macOS Blitz window displayed the shared Button, and two recorded clicks changed its Rust state from zero to one to two. This is independent Desktop evidence.

## Revision and environment

Source: [`3a251335b17a95770bed5fdb2f5cf603d1457c10`](https://github.com/jedt3d/papyrus/commit/3a251335b17a95770bed5fdb2f5cf603d1457c10). The tracked source was clean for the click sequence. The launcher uses the same `papyrus-stories::Preview`, `button/primary` identity, `Press me` label and callback as Web and WASM. No component or style declaration was changed for Desktop.

| Item | Tested value |
| --- | --- |
| OS | macOS 26.7, build 25G229, arm64 |
| Rust / target | 1.98.1 / aarch64-apple-darwin |
| Dioxus | 0.7.10 |
| Blitz Git pin | 7832c177ff272128154bac58afe56c2b9164b417 |
| Native wrapper / Blitz packages | 0.7.0 / 0.3.0-beta.2 |
| Render path | Vello Hybrid 0.11.0, wgpu_context 0.10.0, wgpu 30.0.1; Metal-only run |
| Window request | 1280 × 720 logical content area |
| Actual window surface / scale | 1280 × 720 physical pixels / 1, reported by winit |
| Captures | 2560 × 1504 PNGs from Codex native app capture, including window chrome and extra blank area |
| CSS SHA-256 | fc32371c9a9fa034d920d0e09b27293e805cdd07410b02300b3d6ff7370203f1 |

The run explicitly set `WGPU_BACKEND=metal`. The installed [wgpu_context implementation](https://docs.rs/wgpu_context/0.10.0/src/wgpu_context/lib.rs.html) applies `Backends::from_env()` to the instance; [wgpu's backend parser](https://docs.rs/wgpu-types/30.0.1/src/wgpu_types/backend.rs.html) maps `metal` to Metal alone. A successfully drawn window under that restriction establishes the Metal path. We did not query the GPU adapter name or compare other backends.

The [machine-readable record](phase-0-blitz-desktop.json) includes hashes, startup output, click coordinates and limits. The [run guide](../../source/blitz-desktop/README.md) provides build and check commands.

## Assets and fonts

The launcher reuses `embedded-style`, including the existing byte-comparison test. Only the two font URL values are replaced with data URIs. Other CSS declarations match `source/assets/story.css`; Web file-URL delivery on Desktop was not tested.

- DejaVu Sans WOFF2: `a75044e4dab293c1ac7f8eba9f20df03f183f41b9319054f43b955959981632a`.
- Noto Sans Thai TTF: `5a1c559bb539583c8a1fd99d1c5b9491e5e14478c9cd2bd0970d5c3096cc9ef8`.

The custom context uses those exact bundled bytes, and asserts that Thai registration succeeds. System fonts are not enabled. Font provenance and both licenses are retained in the [shared source guide](../../source/README.md). The capture shows the Button and Thai marks/paragraph without obvious missing-glyph boxes. It is not a full Thai typography or input verdict.

## Actual interaction check

An earlier window already showed a count of 10 when inspected; its interactions were not recorded. We restarted the unchanged binary and captured the controlled sequence:

1. [Zero](phase-0-blitz-desktop-zero.png): `Presses: 0` after restart.
2. [One](phase-0-blitz-desktop-one.png): one actual pointer click on **Press me** produced `Presses: 1`.
3. [Two](phase-0-blitz-desktop-two.png): a second actual pointer click produced `Presses: 2`.

The automation sent pointer events to the native window. It did not set the counter, dispatch a synthetic Dioxus click, or inspect a browser DOM. The native accessibility tree exposed window chrome but no story controls in this build, so we checked the visible count in screenshots.

The first coordinate attempt missed the Button and left the count at zero. Capture coordinates and click coordinates had a factor-of-two mismatch: a request at `[399, 312]` placed the pointer near `[200, 156]` in the captured content. `[798, 624]` reached the Button. Retain the raw captures and runtime scale separately; these images are not calibrated layout measurements for #5.

## Integration and checks

The official pinned [Native launcher](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native/src/lib.rs), [configuration](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/packages/dioxus-native/src/config.rs), and [transparent-window example](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/examples/transparent/src/app.rs) establish the window attributes, font context and `use_window()` path used here.

Desktop builds and runs with Cargo. It needs neither Dioxus's Web server nor Trunk/browser canvas setup. Unlike WASM's WebGPU context, this run renders to a native macOS window through Metal. The dependency versions match the WASM baseline; the Desktop lockfile is separate so platform dependency resolution remains traceable.

The first offline build completed successfully using the existing cache and Xcode tools. The desktop launcher passed `cargo fmt --check` and `cargo clippy --locked --offline --all-targets -- -D warnings`. All three shared tests passed with `embedded-style`: Button activation, Thai input event wiring and decoded font-byte equality. Shared tests do not replace the native click sequence.

Codex could not select the raw executable as an app. For UI automation only, we copied it unchanged into a temporary `work/Papyrus.app`, with an Info.plist identifying the process. Original and copied binary SHA-256: `78bde586ee138aa31c0984bceaa8d6100ddcabba7aaefe24e07ee3dc0502e7d9`. We ran the bundled executable directly with the same Metal environment. Launch Services `open -a` rejected that temporary wrapper with error `-10810`; the cause was not isolated. The working Cargo/direct-executable path was unaffected. This wrapper is not a shipped installer or a packaging recommendation.

## Conclusion and remaining work

The shared Button now has verified click/state baselines on Web, Blitz WASM and Blitz Desktop. #3 has no renderer-run blocker. Continue with #4, shared Card and TextInput stories across all three targets.

Desktop keyboard activation, disabled state, accessibility, Thai keyboard/IME composition, CSS reload, calibrated capture, other operating systems and release packaging remain unchecked. Native default features such as accessibility and hot reload are not enabled in this minimal launcher; that choice limits this baseline, not Blitz's general capabilities. The full Papyrus workbench and compatibility profile remain planned.
