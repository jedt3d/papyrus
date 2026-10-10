---
title: "Roadmap and current priorities"
description: "Build the publishing foundation, prove renderer behavior, then implement the workbench."
status: "Phase 0 in progress"
draft: false
---

## Current state

The developer diary is published and the [first Button story works on Dioxus Web]({{< relref "diary/003-first-web-button.md" >}}). The full workbench, importer, and compatibility harness are not implemented. The [proposal]({{< relref "pages/proposal.md" >}}) describes future capabilities.

## Phase 0 — Prove the rendering paths

Run shared Button, Card, and TextInput stories on Dioxus Web, Blitz WASM, and Blitz Desktop. Pin tool and renderer versions. Establish reload/restart, image capture, layout measurement, real input, focus, Thai text, and IME limitations.

The Web and Blitz WASM Button baselines are verified. [Thai/input checks and automatic Web tests]({{< relref "diary/004-thai-input-and-blitz-wasm.md" >}}) record their limits. [Desktop (#3)](https://github.com/jedt3d/papyrus/issues/3) is next; genuine composition and WebGL-only behavior remain unverified.

**Gate:** traceable results for every target, including failures and unknowns. See the [agent experiment brief](https://github.com/jedt3d/papyrus/blob/main/agent-docs/phase-0.md).

## Phase 1 — Compatibility harness

Parse CSS and validate properties, values, selectors, at-rules, and generated styles against an evidence-backed profile. Add repeatable rendering and interaction tests. Unknown is not supported.

## Phase 2 — Papyrus MVP

Component browser, explicit controls, CSS editor, local backend, revision-aware preview reload, comparison, and static gallery export. Preserve drafts and the last working preview after build failures.

## Phase 3 — Import and adaptation

Import HTML, CSS and assets while preserving originals. Suggest reviewed transformations and explicit target overrides. JavaScript behavior is not automatically converted to Rust.

## Phase 4 — Team workflow

CI reports, baseline review, galleries per source revision, and hosted build services after the local loop is reliable.

## Phase 5 — Additional targets

Add renderer adapters in response to concrete project needs. Other Rust GUI frameworks may share tokens or story intent without sharing CSS.

## Documentation grows with implementation

The [software reference]({{< relref "pages/reference.md" >}}) will cover actual APIs, schemas and CLI behavior. The [user guide]({{< relref "pages/user-guide.md" >}}) will explain real workflows. Both distinguish the verified experiment from planned workbench features.
