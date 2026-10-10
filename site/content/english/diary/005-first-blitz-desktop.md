---
title: "One Button, three rendering paths"
description: "The shared Rust Button now runs in a real Blitz desktop window on macOS."
date: 2026-10-11T03:48:00+07:00
status: "Desktop Button baseline verified on macOS"
tags: ["Blitz", "Desktop", "testing", "Phase 0"]
draft: false
---

## Why Desktop needs its own check

Our Button already worked on Dioxus Web and Blitz WASM. A browser canvas result tells us little about a native window's setup, scale or input path. [Issue #3](https://github.com/jedt3d/papyrus/issues/3) asked for that separate baseline before we build the larger workbench.

## What we built

We added a small Cargo launcher under `source/blitz-desktop/`. It imports the existing Rust preview, Button, callback, stylesheet and fonts. The renderer uses the same pinned Blitz commit and Vello Hybrid version as WASM. On macOS we restricted the run to Metal.

The launcher reuses the embedded font delivery already tested for WASM. Font bytes and CSS declarations stay the same; only their URLs are adapted. There is no second Button implementation to drift out of sync. System fonts are not enabled, keeping this baseline tied to the bundled fonts.

## What actually happened

The debug build passed. A native window opened and reported a 1280 × 720 physical surface at scale 1. After restarting, two recorded pointer clicks changed `Presses: 0` to `1`, then `2`. The rendered Thai fixture was also visible, though this task did not test native Thai typing or composition.

Three shared tests passed: Button state changes, Thai input event wiring, and font bytes inside the embedded stylesheet. The new launcher also passed formatting and Clippy checks. The [Desktop evidence](https://github.com/jedt3d/papyrus/blob/main/agent-docs/evidence/phase-0-blitz-desktop.md) records the exact source revision, versions, hashes and raw captures. The [run guide](https://github.com/jedt3d/papyrus/blob/main/source/blitz-desktop/README.md) explains how to repeat the experiment.

## A capture is not a ruler

The native accessibility tree exposed window controls but no story controls in this build. We used pointer clicks and checked the visible counter. The automation capture also had a factor-of-two coordinate mismatch: the first attempted click missed, and the count stayed at zero. Adjusting to the observed capture scale reached the Button.

We recorded the capture dimensions separately from winit's reported surface and scale. That distinction will matter when we build image and layout comparisons. A screenshot can be useful evidence while still being a terrible ruler.

Codex also needed a temporary macOS app wrapper to select the process. Its copied binary matched the original byte for byte, and running it directly worked. Launch Services rejected the temporary wrapper; release packaging remains a separate task.

## What comes next

The Button has now passed the basic click/state check on all three initial targets. Next is [#4: shared Card and TextInput stories](https://github.com/jedt3d/papyrus/issues/4). Then we can investigate capture, reload, focus, keyboard, accessibility and genuine IME behavior with useful fixtures in place.

This result covers macOS and the selected Metal path. It does not establish Windows or Linux support, native keyboard/IME correctness, automatic CSS reload, or full CSS compatibility. Those claims need their own evidence. Papyrus Studio and the compatibility harness are still planned.
