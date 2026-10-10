# Papyrus software source

This is the source-code area for Papyrus. It contains shared Button, Card and TextInput stories. They are small experiments, not the complete Papyrus workbench.

## Choose the same fixture on each target

Every launcher imports `papyrus_stories::Preview`. Use the buttons at the top to choose a fixture. The visible `Story:` line and `data-story-id` identify the selection; Blitz paints them inside its canvas or native window.

| Picker button | Story identity | Starting fixture |
| --- | --- | --- |
| Button / Primary | `button/primary` | Press me; count 0 |
| Button / Disabled | `button/disabled` | Disabled Press me; count 0 |
| Button / Long content | `button/long-content` | Long wrapping label; count 0 |
| Card / Default | `card/default` | Short title and body, 320px maximum card width |
| Card / Long content | `card/long-content` | Same title with a shared long paragraph |
| TextInput / Default | `text-input/default` | Editable `Papyrus` with visible value feedback |
| TextInput / Disabled | `text-input/disabled` | Disabled `Read only fixture` with matching feedback |
| TextInput / Long content | `text-input/long-content` | Shared long paragraph, editable input and wrapping feedback |

Select another fixture and return to reset its local state. Clicking the already selected picker does not reset it. Reload Web/WASM or restart Desktop to return to Button / Primary. That selection also displays the existing `text-input/thai` experiment below the Button.

Card is a non-interactive text container, so disabled does not apply. There are no target-specific component or fixture overrides. Both Blitz launchers use the existing embedded stylesheet/font delivery adaptation; Web uses served assets. Disabled props omit the HTML boolean attribute when false because the pinned Native adapter would otherwise keep `disabled="false"` present.

For a baseline check, inspect both Cards and their final words. Type and delete a character in the default TextInput and compare its value with the feedback; repeat with long content. Try the disabled fixtures and confirm that their values/counts stay unchanged. Click the long Button and confirm count 1. The generic TextInput is controlled for this simple editing check; the separate Thai observer stays uncontrolled for later composition checks. Neither proves genuine IME support.

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

`src/lib.rs` exports Button, Card, TextInput, their stories, the shared preview and text fixtures, and the stylesheet asset. `Preview` loads styles once so changing the selection keeps the same CSS. `src/main.rs` only selects the Web launcher. Blitz experiments import the library without copying components. Their launch, font, and asset setup needs separate validation.

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

Use [headless browser checks](browser-tests/README.md) to run the Web checks automatically. [Blitz WASM](blitz-wasm/README.md) and [Blitz Desktop](blitz-desktop/README.md) have separate pinned launchers and evidence. The Desktop Button baseline is verified on macOS/Metal. Read the [Phase 0 brief](../agent-docs/phase-0.md) before continuing. CSS reload guarantees, capture comparison, broader input and genuine IME composition remain unverified.

Keep Hugo publishing code in `../site/`; keep agent planning in `../agent-docs/`.
