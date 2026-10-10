---
title: "The first button works on the Web"
description: "A small shared Rust story, a real browser click, and the evidence we need before trying Blitz."
date: 2026-10-11T01:42:00+07:00
status: "Web baseline verified"
tags: ["Dioxus", "Phase 0", "testing"]
draft: false
---

## Why start with one button?

Papyrus aims to preview the same Rust component on Web and Blitz. Before building a workbench, we need to prove that the smallest useful story can run, react to input, and carry its styles and assets with it.

[Issue #1](https://github.com/jedt3d/papyrus/issues/1) is that first step. The story is `button/primary`: a **Press me** button beside a count. It is not much of a product yet, but it can count to three without a committee.

## What we built

The Button and its story live in a Rust library. The Web executable only launches the story. Later Blitz experiments can import the same code instead of rebuilding an HTML lookalike.

The experiment uses Dioxus 0.7.10, Rust 1.98.1, ordinary CSS, and a bundled DejaVu Sans font with its license. Versions are pinned and the dependency lockfile is checked in. The [run guide](https://github.com/jedt3d/papyrus/blob/main/source/README.md) explains how to build and open it locally.

## What the check proved

We first ran a focused Rust test with the state update missing. The count stayed at zero, so the test failed where it should. Connecting the callback to the story's state made it pass for counts one and two.

That test sends a serialized event through Dioxus. It checks the component's wiring; it does not pretend to be a browser click. We also opened the actual WASM application in the browser. Two real clicks changed the count from zero to one to two. Enter on the focused button changed it to three.

The CSS and bundled font loaded. The check used macOS 26.7 on arm64, a 1280 × 720 viewport, and scale factor 2. The full Rust suite, formatting, Clippy, WASM type-check, and frozen Web bundle build passed. The [evidence record](https://github.com/jedt3d/papyrus/blob/main/agent-docs/evidence/phase-0-web.md) includes the source revision, stylesheet hash, screenshot, environment, and limits.

## What got in the way

The machine's `dx` command belonged to Deno. We used a separate Dioxus CLI rather than changing that installation. The existing Rust installation also lacked the WASM target, so the experiment used a workspace-local toolchain.

Our small feature set exposed a Dioxus Web dependency: its history code needed a browser API enabled through devtools. We checked the upstream source and enabled that feature. A CSS font URL alone also did not include the font in the build; placing the font in the public assets directory fixed that.

These are build and asset findings for this Web experiment. They say nothing yet about Blitz CSS support.

## What happens next

[Issue #2](https://github.com/jedt3d/papyrus/issues/2) will try the same Button story on Blitz WASM. [Issue #3](https://github.com/jedt3d/papyrus/issues/3) will test Desktop separately. WASM remains the first priority because people should be able to inspect components online.

The inspected Native paths use different Blitz dependency lines: the released Dioxus Native 0.7.10 package uses 0.2.x, while the current pinned Blitz example uses 0.3.0-beta.2. We must record the chosen versions and test them, rather than treating the names as a promise of compatibility.

The Web baseline works. Blitz builds, reload guarantees, repeatable capture, broader input, Thai text, and IME still need evidence. The browser's exact version was not exposed by this automation surface, so this first record is not a formal compatibility profile. The full Papyrus workbench remains planned.
