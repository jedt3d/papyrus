---
title: "A failed build should not erase a good preview"
description: "CSS drafts now reach all three renderers through reload or restart, while failed and late builds keep their place."
date: 2026-10-11T04:54:11+07:00
status: "Local reload experiment verified; full Studio remains planned"
tags: ["Dioxus", "Blitz", "testing", "Phase 0"]
draft: false
---

## Keep the picture while fixing the draft

Papyrus needs an edit-and-preview loop. A broken build should leave the useful preview on screen and keep the draft available for correction. [Issue #6](https://github.com/jedt3d/papyrus/issues/6) tests that promise before we build an editor or backend.

We started with the existing long Card and appended a yellow background rule to a separate CSS draft. Web and Blitz WASM built new bundles and loaded them automatically. Desktop built a new native executable, opened its window, checked startup and closed the previous window. All three returned to the requested `card/long-content` story.

These are complete builds and page reloads or process restarts. Component values, counters, focus and scroll reset. The caller supplies the selected story on each request; later picker clicks are not saved automatically. Fast in-place CSS hot reload remains a later improvement.

## Give each build its own shelf

The small CLI takes a draft, story ID and environment profile. Each request gets a copied software snapshot, its own CSS and assets, a compiler log and a revision record. The working page reads those immutable assets while the next build runs. A single current pointer changes only after an eligible build succeeds.

The preview shows its build, source, CSS and profile IDs. The full hashes travel with the output. A Git commit identifies ancestry; a source hash identifies the actual copied code. This makes a draft build traceable without pretending every worktree is clean.

The browser checks stayed on one page and watched it navigate automatically. Blitz painted its own revision banner inside the canvas or native window. Browser DOM inspection did not stand in for Blitz content.

## Break it, then fix it

CSS parsers often recover from invalid declarations. For a clear compiler failure, we submitted a draft containing an invalid UTF-8 byte. Rust rejected it on all three targets. The draft stayed intact, the current pointer did not change and the yellow Card remained visible. A corrected draft then turned the Card cyan successfully.

Next we submitted red and green drafts almost together. We delayed the older red result by 30 seconds after its build. Green became current first; red was rejected as stale. The older build still has its shelf. It just does not get the microphone.

The CLI regression test also checks an older success arriving after the newest failure. In that case the last working preview stays current; the old pending job does not become an accidental fallback. A startup test caught another edge case: a process stopped by a signal has no numeric exit code. The guard now checks both forms of exit before promotion.

## What this proves, and what comes next

The local loop works on Web, Blitz WASM/WebGPU and native macOS/Metal. Five fresh Web tests and the focused CLI failure/order check passed. We retained 15 images and records for 18 real submissions, including failed drafts and logs. The [full evidence](https://github.com/jedt3d/papyrus/blob/main/agent-docs/evidence/phase-0-reload.md) and [run guide](https://github.com/jedt3d/papyrus/blob/main/source/reload/README.md) explain how to repeat it.

Native scale changed between restarts, and its capture/input mapping remains unresolved. Startup checks are not paint acknowledgements. We have not established rollback after a later runtime crash, broad CSS validation, hosted builds or state preservation. There is still no Studio or file watcher; submitting a draft triggers the automatic preview switch.

Next is #7 for focus, keyboard and accessibility. Thai and genuine IME remain #8. The permanent runner and backend design will use these findings in #9.
