---
title: "Thai first, then a real Blitz canvas"
description: "Bundled Thai fonts, automatic Web checks, and the same Rust stories running through Blitz WASM."
date: 2026-10-11T02:28:39+07:00
status: "Web and Blitz WASM baselines verified"
tags: ["Thai", "Blitz", "testing", "Phase 0"]
draft: false
---

## Why change the order?

The owner asked to test Thai and IME before Blitz. That matters: a component can look fine in English and still lose marks, text or input in another language. We moved the Web part of [#8](https://github.com/jedt3d/papyrus/issues/8) forward, then ran [#2, Blitz WASM](https://github.com/jedt3d/papyrus/issues/2).

## Thai on the Web

The original DejaVu font did not cover our Thai fixture. We bundled licensed Noto Sans Thai and checked its character map. It covers the fixture's vowels and tone marks. The page also has a narrow long-text area and a small TextInput with an echo and composition counters.

Our first font check caught a useful trap: Thai looked readable, but the bundled font had not loaded. System fallback was doing the work. We fixed Dioxus's public-directory config and checked that served font bytes matched the source. The final capture uses the bundled font.

Unicode input, deletion, restoring a character, and moving focus preserved the text. The owner also tried normal typing and editing with the Thai keyboard and reported that it worked. That is keyboard-layout evidence. Genuine preedit, commit and Esc cancellation through an OS composing input method still need a separate check.

## Automatic browser checks

The owner requested Playwright headless tests and GitHub Actions. We added repeatable checks for Button clicks and Enter, Thai input/echo, deletion, focus, font loading and bytes, the font license, and wrapping. Local Chromium runs passed, including a run where the tests started and stopped their own dev server.

The first Linux CI run caught a startup mistake: Dioxus returned HTTP 200 for its build-waiting page, so the test began before compilation finished. The runner now completes the build before starting the server. The [next CI run passed](https://github.com/jedt3d/papyrus/actions/runs/38080487726), including Rust checks and the headless browser test on a fresh Linux runner.

The workflow runs on source changes in pushes and pull requests. It keeps screenshots, environment records, reports and failure traces. A passing Unicode `fill` test is not an OS IME result. Automation should save time, not manufacture evidence.

See the [browser test guide](https://github.com/jedt3d/papyrus/blob/main/source/browser-tests/README.md) and [Thai evidence](https://github.com/jedt3d/papyrus/blob/main/agent-docs/evidence/phase-0-thai-web.md).

## The same stories on Blitz

Blitz compiled, but its first run stopped before drawing. Font URLs reached Dioxus's native filesystem resolver, which cannot run on WASM. We kept the CSS declarations and font bytes, embedded the stylesheet, and changed the two font URLs to data URIs. A small regression test verifies the decoded bytes.

The next run drew the same Rust Button and Thai fixtures into a canvas. Two real clicks changed the count from zero to one to two. The component was imported from the shared library; no HTML lookalike or forced state was used.

Another finding: the build enabled a WebGL feature, but the canvas actually opened **WebGPU**. We recorded the runtime API instead of assuming the feature name described it. WebGL-only operation remains unverified.

## What remains open?

Blitz's canvas has no browser Button or input elements for our DOM tests to inspect. Enter after a click did not increment the count. ASCII input and Backspace worked through automation, but its Unicode-string route did not deliver the requested Thai text. We have not isolated that limit to the automation bridge, winit or Blitz. Actual Thai keyboard input and composition on Blitz still need evidence.

The local debug WASM file is about 118 MiB. Before an online gallery, we need a release size check and browser coverage. Desktop is the next renderer experiment. Repeatable capture, reload and the full input matrix remain Phase 0 work.

The result is useful but bounded: Web has automatic behavior checks, and the shared Button runs through Blitz WASM on WebGPU. The full Papyrus workbench and CSS compatibility profile are still planned. Read the [Blitz evidence](https://github.com/jedt3d/papyrus/blob/main/agent-docs/evidence/phase-0-blitz-wasm.md) and [run guide](https://github.com/jedt3d/papyrus/blob/main/source/blitz-wasm/README.md) for revisions, commands, captures and limits.
