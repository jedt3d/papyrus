---
title: "What shared CSS must prove"
description: "Browser support, Blitz WASM, and Blitz Desktop are separate results. The first experiments will establish their common ground."
date: 2026-10-11T00:01:00+07:00
status: "Planned experiment"
tags: ["Dioxus", "Blitz", "compatibility"]
draft: false
---

## Working definition

**Web CSS** is CSS rendered by a browser. **Blitz CSS** is CSS rendered by Blitz. Papyrus will work with ordinary CSS, not invent a new stylesheet language.

A support claim needs a renderer version, backend, fonts, viewport, platform, and source revision. A property name alone cannot establish compatibility for every value or interaction.

## The first three stories

Start with Button, Card, and TextInput. Use the same Rust story identities, props, CSS, and assets on Dioxus Web, Blitz WASM, and Blitz Desktop.

Record build/run behavior, stylesheet reload or restart, image capture, input/focus, long content, Thai text, and IME behavior. These are experiments to perform, not completed tests.

## Evidence before a workbench

The harness will eventually check source, rendered layout, and interaction. Unknown behavior remains unknown. A successful Blitz WASM run does not establish Desktop compatibility.

The [original proposal]({{< relref "pages/proposal.md" >}}) describes the intended workbench and the [roadmap]({{< relref "pages/roadmap.md" >}}) sets the order of work.
