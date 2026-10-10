# Phase 0 technical validation

Status: planned. No renderer compatibility claim has been verified in this repository.

## Objective

Prove that one set of Rust component stories can run on Dioxus Web, Blitz WASM, and Blitz Desktop before selecting the permanent application architecture.

## Order of work

1. Inspect the actual installed tools and official renderer documentation. Record pinned Rust, Dioxus, Blitz commit/version, render backend, OS, browser, font, and scale factor.
2. Build explicit Button, Card, and TextInput stories under `source/`. Share props, styles, fixtures, and fonts.
3. Establish a reliable build/run path for each target. Record differences between Blitz WASM and Desktop.
4. Change CSS and demonstrate reload, or an automatic restart that restores the same story. Keep the last working revision visible on failure.
5. Capture repeatable images. Determine what layout measurements and input automation the selected Blitz APIs expose; do not invent APIs.
6. Exercise focus, keyboard activation, disabled state, long content, Thai text, and IME input. Separate genuine input tests from injected visual states.
7. Publish findings in the developer diary, including commands, source revision, known failures, and what remains unknown.

## Acceptance criteria

- The same story identity, props, theme, and assets are traceable across all three targets.
- Every result identifies its exact software/environment revision.
- A failed build retains the draft and the last working preview; old jobs cannot replace newer results.
- Capture and input limitations are documented with evidence. Unknown does not count as supported.
- Unresolved architectural choices have a concrete recommendation and trade-offs before being adopted.

## Deferred work

Full Studio, hosted builds, automatic JavaScript behavior conversion, plugin system, and adapters for other Rust GUI frameworks are later milestones.
