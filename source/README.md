# Papyrus software source

This is the source-code area for Papyrus. It contains shared `button/primary` and `text-input/thai` stories. They are small experiments, not the complete Papyrus workbench.

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

Below the Button, enter `น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไทย` into **Thai / IME input**. Check that the input and echo match. Delete and restore the last character, then move focus with Shift+Tab. The text must remain intact. Inspect the static Thai marks and the long paragraph, which wraps in a 320px area.

To check composition, select an actual OS input method with preedit. Observe start/update/end counts while composing; test commit, Esc cancellation, editing, and focus changes. The input is uncontrolled: its observer does not write the value back during preedit. The echo can include preedit and is not labelled as committed text. Unicode automation and Thai keyboard entry alone do not prove composition support.

To build a static Web bundle:

```sh
dx build --web --bin papyrus-web --locked
```

Dioxus prints the output location. Serve that bundle with an HTTP server; do not open its HTML as a local file. A bundle build is not a GitHub Pages deployment.

## Shared code and assets

`src/lib.rs` exports the Button, both stories, the preview, Thai fixtures, and the stylesheet asset. `src/main.rs` only selects the Web launcher. Blitz experiments import the library without copying the component. Their launch, font, and asset setup needs separate validation.

The CSS is ordinary CSS. Its presence here proves no Blitz compatibility. The Web feature includes Dioxus devtools because the 0.7.10 Web history implementation gets its required `web-sys/Location` feature through devtools.

The bundled DejaVu Sans font is copied unchanged from [Blitz's 7GUIs example at commit 7832c17](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/examples/seven_guis/assets/DejaVuSans.woff2). Its SHA-256 is `a75044e4dab293c1ac7f8eba9f20df03f183f41b9319054f43b955959981632a`. It does not cover the Thai fixture. The Thai story uses unchanged [Noto Sans Thai at Google Fonts commit 8b0a1d0](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notosansthai), saved as `NotoSansThai.ttf`; SHA-256 `5a1c559bb539583c8a1fd99d1c5b9491e5e14478c9cd2bd0970d5c3096cc9ef8`.

Both [DejaVu](public/LICENSE-DejaVu.txt) and [Noto](public/LICENSE-NotoSansThai.txt) licenses travel with the bundle. `Dioxus.toml` explicitly sets `application.public_dir`: in CLI 0.7.10, an absent application table otherwise leaves this directory unset. A stale output can hide missing assets; check font loading and matching served bytes after a fresh build.

## Checks and limits

The Rust tests send serialized click and input events through Dioxus's public event boundary and check the visible count and Thai echo. They catch broken callback/state wiring without a browser. They do not test browser hit targets, fonts, keyboard layouts, or real composition; repeat the browser steps above as well.

Before committing source changes:

```sh
cargo fmt --check
cargo clippy --locked --no-default-features --all-targets -- -D warnings
cargo test --locked --no-default-features
cargo check --locked --target wasm32-unknown-unknown
```

Use [headless browser checks](browser-tests/README.md) to run the Web checks automatically. [Blitz WASM](blitz-wasm/README.md) has its own pinned launcher and asset-delivery path; its results are recorded separately. Read the [Phase 0 brief](../agent-docs/phase-0.md) before continuing. Desktop, CSS reload guarantees, capture comparison, broader input and genuine IME composition remain unverified.

Keep Hugo publishing code in `../site/`; keep agent planning in `../agent-docs/`.
