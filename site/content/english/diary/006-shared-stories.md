---
title: "Eight fixtures, one shared source"
description: "Shared Card and TextInput stories work on Web and both Blitz targets, with a disabled Button lesson."
date: 2026-10-11T04:09:10+07:00
status: "Shared story baselines verified"
tags: ["Dioxus", "Blitz", "testing", "Phase 0"]
draft: false
---

## Why add more than a Button

A Button proves clicks can reach Rust state. It tells us little about paragraphs, narrow layouts or editable values. [Issue #4](https://github.com/jedt3d/papyrus/issues/4) adds those fixtures before we build the permanent Papyrus harness.

## One picker on three targets

The shared Rust preview now has eight choices: primary, disabled and long-label Buttons; default and long-text Cards; default, disabled and long-value TextInputs. Card is a text container, so disabled does not apply.

Each choice displays a stable story identity. Switching away and back resets local state. All targets use the same components, props, CSS and font bytes. Blitz keeps its explicit embedded font-delivery setup. The existing Thai observer remains available under Button / Primary.

## What the checks showed

Four headless Web tests passed locally and in GitHub Actions. They cover selection, Card wrapping, input edits and feedback, fixture reset, disabled controls, long labels and the earlier Thai regression checks. Four shared Rust behavior/asset tests also passed.

Blitz WASM displayed the stories through a WebGPU canvas. Desktop displayed them in a native macOS/Metal window. Real keys changed the default input from `Papyrus` to `Papyrusx`; Backspace restored it, with matching visible feedback. Both Cards displayed their final words. Long Buttons wrapped and activated. Disabled inputs kept their values.

The [evidence record](https://github.com/jedt3d/papyrus/blob/main/agent-docs/evidence/phase-0-shared-stories.md) links raw captures, exact revisions, environment details and repeat steps. These are basic behavior checks, not a full CSS compatibility verdict.

## A grey Button still had ideas

The first Blitz WASM run exposed a real bug: the disabled Button looked disabled but its click still increased the count. Blitz delivered the click before checking the disabled default action, and our callback accepted it.

We added a failing public event test, then made the shared Button reject activation when disabled. Rebuilt WASM and Desktop previews stayed at zero after real clicks. The fix protects this component's contract; arbitrary Native event handlers still need their own checks. Grey paint is not a security guard.

## What remains uncertain

The selected picker background differs from Web in both Blitz captures. A native long-input key request also produced `u` once when automation requested `x`; input and feedback agreed on the received text. The cause is unisolated. Exact key mapping and genuine OS composition remain later checks.

This native run reported scale 2, unlike the previous run's scale 1. We recorded the actual physical surface and capture size separately. We also corrected earlier capture metadata: those files contain JPEG bytes despite their old `.png` names. The original images and hashes remain intact.

Next is [#5: repeatable capture and layout evidence](https://github.com/jedt3d/papyrus/issues/5). Reload, broader keyboard/accessibility behavior, Thai input and IME remain open. Desktop coverage is macOS/Metal; Windows, Linux, release packaging and WebGL-only operation still need evidence. The full workbench remains planned.
