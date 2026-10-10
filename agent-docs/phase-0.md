# Phase 0 technical validation

Status: in progress. The shared Button story is verified on [Dioxus Web](evidence/phase-0-web.md), [Blitz WASM](evidence/phase-0-blitz-wasm.md), and [Blitz Desktop on macOS/Metal](evidence/phase-0-blitz-desktop.md). [Shared Card and TextInput fixtures](evidence/phase-0-shared-stories.md) also pass the scoped baseline on all three targets. Full cross-renderer compatibility remains unverified.

## GitHub tickets and work order

The owner requested ticket creation on 11 October 2026. The experiments are tracked in GitHub Issues; creating tickets does not mean the experiments have run. Check each issue's current state and native dependencies before starting.

| Order | Priority | Ticket | Blocked by |
| --- | --- | --- | --- |
| 1 | 0 | [#1: Button on Dioxus Web](https://github.com/jedt3d/papyrus/issues/1) | None |
| 2 | 0 | [#2: Button on Blitz WASM](https://github.com/jedt3d/papyrus/issues/2) | #1 |
| 3 | 0 | [#3: Button on Blitz Desktop](https://github.com/jedt3d/papyrus/issues/3) | #1 |
| 4 | 0 | [#4: Card and TextInput on all targets](https://github.com/jedt3d/papyrus/issues/4) | #2, #3 |
| 5 | 1 | [#5: Repeatable capture and layout evidence](https://github.com/jedt3d/papyrus/issues/5) | #4 |
| 6 | 1 | [#6: CSS reload and last working preview](https://github.com/jedt3d/papyrus/issues/6) | #4 |
| 7 | 1 | [#7: Focus, keyboard, disabled states, and long content](https://github.com/jedt3d/papyrus/issues/7) | #4 |
| 8 | 1 | [#8: Thai text, fonts, and IME](https://github.com/jedt3d/papyrus/issues/8) | #4 |
| 9 | 1 | [#9: Findings and architecture recommendation](https://github.com/jedt3d/papyrus/issues/9) | #5, #6, #7, #8 |

The Button baselines (#1–#3) are implemented and checked. Shared Card and TextInput stories (#4) have baseline evidence on every target. Continue with #5, repeatable capture/layout; #6–#8 are also unblocked and can proceed independently. Work the unblocked tickets, not every ticket with a readiness label. All nine are required; priority 1 means later, not optional. Native GitHub links are the source of truth if the plan changes.

The owner moved the Web part of #8 ahead of Blitz on 11 October 2026. [Thai rendering/input evidence](evidence/phase-0-thai-web.md) records that early check and its composition limits. #8 still retains its all-target dependency and remains open. The owner also requested headless Playwright and GitHub Actions; [Web test commands](../source/browser-tests/README.md) cover that added scope.

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
