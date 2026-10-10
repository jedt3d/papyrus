# Blitz Desktop experiment

This launcher opens a native Blitz window. It imports `papyrus-stories::Preview`, including Button, Card, TextInput and the [shared fixture picker](../README.md#choose-the-same-fixture-on-each-target), from the shared library. Props, callbacks, CSS declarations, text fixtures and font bytes are the same as the Web and WASM experiments.

## Build and run

Use the parent [Rust setup](../README.md). On macOS, the tested build uses Xcode's command-line tools and the `aarch64-apple-darwin` target. From this directory:

```sh
cargo build --locked
WGPU_BACKEND=metal cargo run --locked
```

`WGPU_BACKEND=metal` restricts this macOS run to Metal. Other platforms need their own backend and runtime checks. First-time dependency setup needs network access; later builds can add `--offline` when the cache is complete.

The window requests a 1280 × 720 logical content area. Startup reports the actual physical surface size and scale factor. Each pointer button event also prints `Papyrus capture:` with the current surface, scale and theme. Use those capture-time values alongside the raw screenshot; startup output alone cannot calibrate a capture. Click **Press me** twice and observe `Presses: 0 → 1 → 2`. Close and reopen the window to check that the count starts at zero again.

## Pins and shared assets

The launcher pins [Blitz commit 7832c17](https://github.com/DioxusLabs/blitz/tree/7832c177ff272128154bac58afe56c2b9164b417), the same commit as WASM. Its wrapper is versioned `dioxus-native` 0.7.0; Dioxus resolves to 0.7.10. `Cargo.lock` records the complete graph, including Vello Hybrid 0.11.0 and Parley 0.12.0.

Only Vello Hybrid is selected. Default Native features, including system fonts, accessibility, clipboard, network fetching and hot reload, are not enabled in this baseline. Their behavior needs separate checks before use.

The existing `embedded-style` feature changes the two font URLs to data URIs while preserving the CSS declarations and original font bytes. We reuse the WASM delivery path to avoid a second asset setup. This does not establish support for Web's file URLs on Desktop. The custom font context registers bundled DejaVu Sans and Noto Sans Thai. Keep the [DejaVu](../public/LICENSE-DejaVu.txt) and [Noto](../public/LICENSE-NotoSansThai.txt) licenses with redistributed assets.

From the parent `source/` directory, run the existing public behavior and asset checks:

```sh
cargo test --locked --no-default-features --features embedded-style
```

These tests check shared event wiring and byte-identical font delivery. The actual desktop click sequence is a separate renderer check. Run `cargo fmt --check` and `cargo clippy --locked --all-targets -- -D warnings` in this launcher directory before committing launcher changes.

## Limits

This is a debug renderer experiment, not an installer or the complete Papyrus Studio. It needs no browser, Trunk, HTTP server or WebView. [Capture evidence](../../agent-docs/evidence/phase-0-capture.md) records same-session repeat images and unresolved native image/input mapping. Internal component geometry is not exposed by this launcher. Keyboard activation, accessibility, genuine Thai keyboard/IME input and reload remain later checks. See the [Desktop evidence](../../agent-docs/evidence/phase-0-blitz-desktop.md) for the first Button baseline.
