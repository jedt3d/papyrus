---
title: "A good screenshot still needs a keyboard"
description: "Real input checks separate working controls, missing default actions and inspection limits across Web and Blitz."
date: 2026-10-11T05:15:07+07:00
status: "Input investigation complete; Blitz keyboard and accessibility limits remain"
tags: ["Dioxus", "Blitz", "accessibility", "testing", "Phase 0"]
draft: false
---

## Test what a picture cannot show

A component gallery needs more than a nice screenshot. Developers must reach a control, see focus, activate it with a keyboard and edit its value. Disabled controls must stay inactive. Long labels must leave the control usable.

[Issue #7](https://github.com/jedt3d/papyrus/issues/7) checks these basics before Papyrus gets a permanent harness. We kept the shared Rust components, CSS, fonts and renderer pins unchanged. This work adds focused Web checks and records real Blitz input attempts. The full results and exact revisions are in the [evidence report](https://github.com/jedt3d/papyrus/blob/main/agent-docs/evidence/phase-0-input.md).

## Web gives us a useful first gate

Tab walks through the eight picker buttons and reaches the component. Shift+Tab returns. Enter and Space activate the Button, while a brown outline shows focus. TextInput accepts caret movement, deletion and select-all, and its feedback follows the value. Disabled fixtures keep their count or text unchanged.

A separate 390 × 600 preview checks wrapping, scrolling and keyboard access to long controls. The long input scrolls internally to reveal its end. We also save Chromium's actual accessibility tree: names, roles, labels, disabled/focused states and polite status semantics. A tree is useful evidence; it does not tell us what every screen reader announces.

All eight Web tests pass locally. The existing GitHub Actions workflow runs the new checks and keeps their images, focus measurements, accessibility trees and hashes. No new testing dependency was needed.

## Blitz has working pieces and real gaps

Both Blitz targets let us pointer-focus an input, edit and delete text, move away with Shift+Tab and return with Tab. A blue input outline is visible. Disabled controls retain their values. Long Cards and Buttons wrap, and the end of a long input is reachable.

Button keyboard activation did not work in the recorded Return/Space attempts, although pointer activation did. Pinned engine code has text-input keyboard actions but lacks a Button keyboard click default action. The custom CSS `:focus-visible` rule also cannot match at this pin; the blue input outline comes from Blitz's own `:focus` stylesheet. Exact Button focus is not exposed by our current launcher, so we keep that inspection limit beside the result.

Native key requests need more care too. Some x requests produced U or u; a final reset produced the correct x. We preserve all those results and leave the cause unresolved. Declaring victory because the final picture looks right would give the keyboard a very unfair performance review.

## Accessibility is a separate check

These minimal Blitz builds do not enable the optional accessibility feature. The current tools see a canvas or window chrome, rather than named story controls. That is an inspection gap in our builds, not a blanket claim about every Blitz configuration.

The optional tree builder maps roles and text. Its inspected source still leaves important state/label details and action handling for further work. We have not enabled and tested that adapter or run a human screen-reader session.

## What comes next

The later harness should record the actual focused node and received key alongside the image. It should check engine actions, Rust callbacks and accessibility separately. Source, style and environment profiles must travel together, including actual scale: this WASM run's final sample used a 2560 × 1440 canvas behind a 1280 × 720 viewport.

#7's investigation is complete, with its limits visible. [#8](https://github.com/jedt3d/papyrus/issues/8) keeps the genuine Thai/IME work. #9 will use the evidence to recommend the permanent architecture. Screenshots remain useful. They simply do not get the last word.
