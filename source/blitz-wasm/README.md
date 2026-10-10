# Blitz WASM experiment

This launcher imports the same `papyrus-stories::Preview`, Button, Card, TextInput, fixtures, CSS source and licensed fonts as Dioxus Web. It renders through Blitz into a browser canvas. Use the [shared fixture picker and baseline steps](../README.md#choose-the-same-fixture-on-each-target) after building. It is not a Desktop result or the full Papyrus workbench.

## Build and open

Use the parent [Rust setup](../README.md) and **Trunk 0.21.14** from its [official release](https://github.com/trunk-rs/trunk/releases/tag/v0.21.14). Verify the release checksum. From this directory:

```sh
cargo check --locked --target wasm32-unknown-unknown
trunk build --public-url ./ --frozen
python3 -m http.server 8081 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8081/`. Click **Press me** twice; the count must show 1 and 2. Scroll the canvas to inspect the Thai fixtures and TextInput. First-time setup and Trunk's tool downloads need network access. `--frozen` requires Cargo's existing lockfile and cache; the check command prepares dependencies.

If the shell sets `NO_COLOR=1`, Trunk 0.21.14 rejects that boolean value before building. Use `env -u NO_COLOR trunk build --color never --public-url ./ --frozen` for that command; do not change your shell configuration.

## Pins and asset delivery

The launcher pins [Blitz commit 7832c17](https://github.com/DioxusLabs/blitz/tree/7832c177ff272128154bac58afe56c2b9164b417), `anyrender_vello_hybrid` 0.11.0, Parley 0.12.0 and wasm-bindgen 0.2.129. The resolved graph is in this directory's `Cargo.lock`; Dioxus core resolves to 0.7.10. The Git wrapper is versioned `dioxus-native` 0.7.0 and Blitz 0.3.0-beta.2. It is not the released Native 0.7.10 dependency line.

The shared library's `embedded-style` feature embeds the CSS and replaces its two font URL paths with data URIs. Font bytes and every other CSS declaration remain unchanged. This is an explicit asset-delivery adaptation: it does not demonstrate that Dioxus Web's asset URLs work on Blitz WASM. Without it, the native resolver calls filesystem APIs and panics on WASM.

The launcher enables Blitz's data-URI provider and WOFF decoder and supplies a font context for WASM, where system fonts are unavailable. Both font licenses are copied to `dist/`. The asset regression test decodes the generated URLs and compares their bytes with the source fonts:

```sh
cd ..
cargo test --locked --no-default-features --features embedded-style
```

## Limits

The debug WASM file is about 118 MiB. It is a local validation build; size and release optimization must be checked before a public gallery deployment. The context marker on the canvas records the graphics API actually opened, since enabling `webgl` does not by itself prove backend selection. See the [runtime evidence](../../agent-docs/evidence/phase-0-blitz-wasm.md).

Browser DOM tests cannot read the labels inside this canvas. Genuine OS composition, Thai keyboard entry on this renderer, repeatable screenshot comparison and wider input behavior remain separate checks. The [upstream WASM guide](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/HOWTO_WASM.md) and [7GUIs launcher](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/examples/seven_guis/src/lib.rs) supplied the starting integration path.
