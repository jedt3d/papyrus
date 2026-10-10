# Thai text and input: Web check

Checked on 11 October 2026, before the Blitz experiment at the owner's request. This is partial evidence for [#8](https://github.com/jedt3d/papyrus/issues/8); that ticket still needs all three targets and genuine composition cases.

## What ran

Source: [`a87b2b1`](https://github.com/jedt3d/papyrus/commit/a87b2b1). CSS SHA-256: `fc32371c9a9fa034d920d0e09b27293e805cdd07410b02300b3d6ff7370203f1`. The shared `text-input/thai` story contains Thai marks, a long paragraph in a 320px area, an uncontrolled text input, an echo, and composition event counters. [Commands and manual steps](../../source/README.md) are repeatable.

The toolchain remains Rust 1.98.1 / Dioxus CLI and library 0.7.10, debug WASM with browser DOM/CSS on macOS 26.7 arm64. The Codex In-app Browser does not expose its exact version through this automation surface. [Manual-sequence browser data](phase-0-thai-web-browser.json) and [automated assertions](phase-0-thai-web-automated.json) record their own viewport and scale; the app panel was resized between runs. Do not treat these captures as a fixed-size renderer comparison.

## Font and rendering

DejaVu's character map lacks the Thai characters used here. The unchanged Noto Sans Thai variable TTF is from [Google Fonts commit 8b0a1d0](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notosansthai). It is saved as `source/public/assets/NotoSansThai.ttf`, with its SIL Open Font License in the bundle.

- Font SHA-256: `5a1c559bb539583c8a1fd99d1c5b9491e5e14478c9cd2bd0970d5c3096cc9ef8`.
- License SHA-256: `2e98fd23a52d253db8612cd5942c8f2ff4111b21d2367050fdca91d8ccc374a0`.
- FontTools 4.66.1 / Brotli 1.2.0 inspected the character maps in a workspace-only environment. Noto has 87 Thai code points and covers every character in the short fixture; DejaVu does not.
- Both font files and the Noto license returned HTTP 200 with bytes matching the source. The browser's font set reported loaded, and the `Papyrus Thai` family check passed.
- The long paragraph used a 320px block, 28.8px line height and about 115.19px height. The [capture](phase-0-thai-web.png) shows wrapping and Thai marks without obvious missing-glyph boxes or clipped marks. This is visual evidence for these fixtures, not a typography certification.

The first attempted capture used fallback: the Noto URL returned the SPA index rather than font bytes. The cause was an absent `[application]` table: CLI 0.7.10's deserialized application default leaves `public_dir` unset, while its full config default sets it. Old output files hid this in the original Button run. Explicit `application.public_dir = "public"` fixed copying. See the pinned [application config](https://github.com/DioxusLabs/dioxus/blob/57d6794ad60b949e5bd8aa282f6f8c3dc97a365e/packages/cli/src/config/app.rs) and [config default/tests](https://github.com/DioxusLabs/dioxus/blob/57d6794ad60b949e5bd8aa282f6f8c3dc97a365e/packages/cli/src/config/dioxus_config.rs). The saved final capture uses the corrected bundle.

## Input checks

The focused Rust test first failed with an empty input callback, then passed after wiring the public input event to the visible echo. It checks the full Thai fixture, an edited value and clearing. The full suite (two tests), Clippy and WASM type-check passed for this source revision.

Browser automation entered `น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไทย`, verified input/echo equality, deleted the last character, restored it, moved focus to Button, and activated it with Enter. The text survived the focus change. The repeatable [browser assertions](../../source/browser-tests/check-web.mjs) additionally test two real browser button clicks, deletion, focus, keyboard activation, bundled-font availability, and wrapping. Its Unicode `fill` is explicitly a value-entry check, not an OS input-method test.

The owner separately reported that typing and editing worked normally with the **Thai keyboard**. This is human-reported keyboard-layout evidence; the owner's browser/version and exact tested revision were not separately captured. No preedit/commit/Esc composition result was reported.

## Headless browser run

Playwright 1.64.0 passed against clean revision `51a8ae52b8a6bfe508cee546452e95e7b786e355`, starting and stopping its own Dioxus server with `CI=true`. The [environment record](phase-0-web-playwright.json) reports Chromium 156.0.8078.4 on macOS arm64, 1280 × 720 at scale 1, the bundled Thai font loaded, and matching input/echo after deletion. Composition counters remained zero. The suite also verified the Thai font against its source hash and the served license. This is a Web DOM run; it does not inspect the Blitz canvas.

The [first Linux CI run](https://github.com/jedt3d/papyrus/actions/runs/38080270662) failed at navigation before any story assertion. Its saved snapshot showed Dioxus’s build-waiting page at 74% while the HTTP readiness check had already returned 200. The runner now completes `dx build` before starting `dx serve`, keeping compilation inside startup time rather than the 30-second behavior test.

## Composition limits

Automation's composition counters stayed at zero. The active macOS keyboard was ABC; Thai and Vietnamese Telex were listed as enabled. The native input-source control timed out, and Ctrl+Space did not change the selected source. Unicode entry through automation did not establish an OS IME session.

Genuine preedit, commit, cancellation, and focus changes during composition remain **untested**. To complete them, select a composing OS input method, record its name, observe start/update/end events, and compare the committed value after each case. Synthetic composition events may check observers, but cannot replace that test. The [compositionstart documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event) explains the session boundary.

## Conclusion

The Web story loads its bundled Thai font, renders the fixtures, preserves Unicode input/editing/focus, and has repeatable browser assertions. Thai keyboard entry/editing also passed in the owner's manual check. OS composition remains unknown. Continue with Blitz WASM, using these same fixtures and font files; keep #8 open until its remaining cases and targets are verified.
