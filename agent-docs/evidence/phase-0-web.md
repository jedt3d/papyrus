# Phase 0: the first Web Button story

Checked on 11 October 2026. Status: verified for the Web baseline only. [Issue #1](https://github.com/jedt3d/papyrus/issues/1) asks for a working Button story and enough evidence to start the Blitz experiments.

## What ran

Source revision: [`78d6005c851f5b6114c3fb1b06621b12ef3b570c`](https://github.com/jedt3d/papyrus/commit/78d6005c851f5b6114c3fb1b06621b12ef3b570c). The `button/primary` story uses one Rust Button component, the label `Press me`, and a local count starting at zero. The Web executable only launches that shared story.

The stylesheet source SHA-256 is `34ee29058887afa538f7f5735e06566bd77106ac223877b67abb54742f13ab19`. Dioxus served its processed CSS as `/assets/story-dxh6ab5eee27060dea3.css`. This identifies the stylesheet used in the captured run; it is not a compatibility profile.

| Item | Observed value |
| --- | --- |
| Rust / Cargo | 1.98.1; Rust compiler commit `48a229cea`, 1 September 2026 |
| Dioxus / CLI | 0.7.10; CLI source `57d6794ad60b949e5bd8aa282f6f8c3dc97a365e` |
| Build target | `wasm32-unknown-unknown`, development/debug Web build |
| Web glue tools | wasm-bindgen-cli 0.2.129; esbuild 0.27.3, selected by Dioxus CLI |
| Renderer | Dioxus Web, browser DOM/CSS |
| Test machine | macOS 26.7, arm64 |
| Browser | Codex In-app Browser; its exact version is not exposed by the available automation surface |
| Viewport | 1280 × 720 CSS pixels; device scale factor 2 |
| Font | Bundled DejaVu Sans WOFF2, CSS family `Papyrus Sans`, weight 400 |

The [browser evidence](phase-0-web-browser.json) records the rendered story, count, loaded stylesheet, viewport, and font status. The font set contained one face, reported `loaded`, and passed the requested-family check. The font and license were also served over HTTP with bytes matching their source files. The font SHA-256 is `a75044e4dab293c1ac7f8eba9f20df03f183f41b9319054f43b955959981632a`; its [license](../../source/public/LICENSE-DejaVu.txt) travels with the static bundle.

## Checks and result

The public behavior under test is Button activation updating the count that a user sees.

1. The Rust integration test first ran with an empty story callback. Initial rendering passed, but the assertion for `Presses: 1` failed. This confirmed that the test detects missing state wiring.
2. Connecting the callback to the signal made the test pass for `Presses: 1` and `Presses: 2`. The test uses Dioxus's public mutation/event APIs and render-to-string output. Its input is a serialized fixture, not a real browser click.
3. In the browser, reload showed `Presses: 0`. Two real button clicks showed 1 and 2; Enter on the focused button showed 3. The [screenshot](phase-0-web-button.png) records that final state.

These commands passed from the source directory:

```sh
cargo fmt --check
cargo test --locked --no-default-features
cargo clippy --locked --no-default-features --all-targets -- -D warnings
cargo check --locked --target wasm32-unknown-unknown
dx build --web --bin papyrus-web --frozen
dx serve --web --bin papyrus-web --frozen --addr 127.0.0.1 --port 8080 --open false --interactive false --hot-reload false
```

The full Rust suite has one focused integration test; it passed. `--frozen` verified that the final Web build and serve used the existing lockfile and cache. First-time setup still needs network access. The [source guide](../../source/README.md) explains installation and ordinary run commands.

## Problems found and their cause

- The installed `/opt/homebrew/bin/dx` belongs to Deno. The experiment used a separately downloaded, checksum-verified Dioxus CLI. Rust was installed through workspace-local rustup with the WASM target; existing Homebrew Rust and shell settings were kept intact.
- Disabling Dioxus defaults exposed a 0.7.10 feature dependency: Web history calls `Window.location()`, while `web-sys/Location` is enabled by the Web devtools feature. Enabling `dioxus/devtools` in the Web feature fixed the compile error. See the pinned [Web manifest](https://github.com/DioxusLabs/dioxus/blob/57d6794ad60b949e5bd8aa282f6f8c3dc97a365e/packages/web/Cargo.toml) and [history code](https://github.com/DioxusLabs/dioxus/blob/57d6794ad60b949e5bd8aa282f6f8c3dc97a365e/packages/web/src/history.rs).
- A relative CSS font URL alone did not copy the font into the bundle. Keeping the font under the public assets directory gave the stylesheet a stable relative URL and included the license. A small custom index also avoids the default development page's unrelated remote font. This is Web asset handling; Blitz asset loading still needs its own test.

## Official integration paths for the next experiments

The [Dioxus 0.7 app guide](https://dioxuslabs.com/learn/0.7/tutorial/new_app/) documents Web launch and CLI builds. The [asset guide](https://dioxuslabs.com/learn/0.7/tutorial/assets/) documents `asset!` and `document::Stylesheet`, used by the shared story.

Two Native candidates were inspected, not built:

| Candidate | Source evidence | What remains to test |
| --- | --- | --- |
| Released `dioxus-native` 0.7.10 | Its [published manifest](https://docs.rs/crate/dioxus-native/0.7.10/source/Cargo.toml) declares `blitz-dom` 0.2.4, other Blitz 0.2 dependencies, `anyrender_vello` 0.6, and `anyrender_vello_cpu` 0.8. | Desktop launch, fonts, assets, and events; whether this older dependency line is useful for the WASM experiment. |
| Official Blitz repository at `7832c177ff272128154bac58afe56c2b9164b417` | Its [workspace manifest](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/Cargo.toml) declares Blitz `0.3.0-beta.2`, a `dioxus-native` package versioned 0.7.0, Dioxus `0.7.3` version requirements, and `anyrender_vello_hybrid` 0.11.0. | Resolve the exact dependency graph with our pinned Dioxus 0.7.10, build the target, and verify the story rather than assuming semver compatibility is enough. |

The pinned [Blitz WASM guide](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/HOWTO_WASM.md) describes Trunk and the hybrid renderer with WebGL. The actual [7GUIs WASM entry](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/examples/seven_guis/src/lib.rs) bundles a font, calls `build_single_font_ctx`, and passes it to `dioxus_native::launch_cfg`. Its [Desktop entry](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/examples/seven_guis/src/main.rs) calls `dioxus_native::launch`. These are proposed integration paths for #2 and #3, not APIs we exercised here.

There is a documentation mismatch to check: the WASM guide refers to a native Vello default, but the inspected [7GUIs manifest](https://github.com/DioxusLabs/blitz/blob/7832c177ff272128154bac58afe56c2b9164b417/examples/seven_guis/Cargo.toml) defaults to `hybrid`. Record the actual selected feature graph and backend in the next experiments.

## Conclusion and remaining questions

The shared Button story works on Dioxus Web and has a focused regression check. The next priority is [#2, Blitz WASM](https://github.com/jedt3d/papyrus/issues/2); [#3, Blitz Desktop](https://github.com/jedt3d/papyrus/issues/3) can also start from this baseline.

The inspected Blitz Git revision is a useful first WASM candidate because it contains a concrete Dioxus/font example. Before adopting it, verify dependency resolution, stylesheet/asset loading, and real input delivery. Keep Desktop on a clearly recorded revision too; mixing the released 0.2 dependency line with the 0.3 beta line would need an explicit explanation.

Still unknown: Blitz build/runtime behavior, font setup for this shared story, CSS reload guarantees, capture repeatability, wider keyboard/accessibility behavior, Thai coverage, and IME. The exact test-browser version is also missing from this first record; capture it through a version-reporting runner before using results as a formal compatibility profile. No release build, cross-browser matrix, performance benchmark, or permanent architecture has been established.
