# Papyrus software source

This is the source-code area for Papyrus. It contains the first Dioxus Web experiment: the `button/primary` story. It is a small baseline, not the complete Papyrus workbench.

## Run the Button story

Use Rust through [rustup](https://rustup.rs/). `rust-toolchain.toml` pins Rust 1.98.1 and the `wasm32-unknown-unknown` target. Install **Dioxus CLI 0.7.10** from the [official release](https://github.com/DioxusLabs/dioxus/releases/tag/v0.7.10), or build it with:

```sh
cargo install dioxus-cli --version 0.7.10 --locked
```

Check that `dx --version` reports `dioxus 0.7.10`. Some machines use the name `dx` for Deno; put the Dioxus binary first in your current shell's PATH or use its full path. There is no need to replace the other tool.

From this directory:

```sh
cargo test --locked --no-default-features
cargo check --locked --target wasm32-unknown-unknown
dx serve --web --bin papyrus-web --locked --addr 127.0.0.1 --port 8080 --open false
```

Open the address printed by Dioxus. The page starts with `Presses: 0`. Click **Press me** twice: the count must become 1, then 2. Reload the page to reset it. The count is local to the story and is not saved.

To build a static Web bundle:

```sh
dx build --web --bin papyrus-web --locked
```

Dioxus prints the output location. Serve that bundle with an HTTP server; do not open its HTML as a local file. A bundle build is not a GitHub Pages deployment.

## Shared code and assets

`src/lib.rs` exports the Button component, its explicit `button/primary` story, and the stylesheet asset. `src/main.rs` only selects the Web launcher. Future Blitz experiments can import the library and launch the same story without copying it. Their launch, font, and asset setup still needs validation.

The CSS is ordinary CSS. Its presence here proves no Blitz compatibility. The Web feature includes Dioxus devtools because the 0.7.10 Web history implementation gets its required `web-sys/Location` feature through devtools.

The bundled DejaVu Sans font is copied unchanged from [Blitz's 7GUIs example at commit 7832c17](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/examples/seven_guis/assets/DejaVuSans.woff2). Its SHA-256 is `a75044e4dab293c1ac7f8eba9f20df03f183f41b9319054f43b955959981632a`. The [font license](public/LICENSE-DejaVu.txt) is included in the static bundle. Thai font coverage and IME are separate experiments.

## Checks and limits

The Rust test sends a serialized click event through Dioxus's public event boundary and checks the story's rendered count. It catches broken callback/state wiring without a browser. It does not test browser hit targets, fonts, or real keyboard delivery; repeat the browser steps above as well.

Before committing source changes:

```sh
cargo fmt --check
cargo clippy --locked --no-default-features --all-targets -- -D warnings
cargo test --locked --no-default-features
cargo check --locked --target wasm32-unknown-unknown
```

Read the [Phase 0 brief](../agent-docs/phase-0.md) before continuing. Blitz WASM and Desktop are the next independent experiments. CSS reload guarantees, capture comparison, broader input, Thai text, and IME remain unverified.

Keep Hugo publishing code in `../site/`; keep agent planning in `../agent-docs/`.
