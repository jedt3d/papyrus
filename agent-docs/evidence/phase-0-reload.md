# CSS reload with a last working preview

Checked on 11 October 2026 for [#6](https://github.com/jedt3d/papyrus/issues/6). A submitted CSS draft changes the long Card on Dioxus Web, Blitz WASM and Blitz Desktop. Failed compiler updates keep the draft and previous output. An older delayed success cannot replace the newest accepted request. This is a small local experiment, not Papyrus Studio or in-place CSS hot reload.

## Source and environment

The 18 real build submissions and 15 images use [`1b7ecff`](https://github.com/jedt3d/papyrus/commit/1b7ecff849bf4afd12ed5bf074e70ea4951faca9). Their copied software has SHA-256 `7700ada6ec4f9cea3497a919d79cfb82f5ea28078ecf2b9490fc2e169327f32c`; the running coordinator has hash `57dbe2fa764f1bb8b4f725fec3252514f867d49e5cd7d71d59027438281ea52b`. Each stage uses matching software, CSS and story across the targets. Target-specific environment profiles have separate hashes. The [manifest](phase-0-reload/manifest.json) includes every snapshot's file hashes, CSS/profile/build IDs, binary hashes, observations and original image format/dimensions. Successful output and failed draft bytes were retained in local job directories; hashes were checked against those actual files before publishing evidence.

The machine is macOS 26.7 (25G229), arm64. Rust 1.98.1, Dioxus 0.7.10 and Node 26.9.0 are unchanged. Blitz remains at `7832c177ff272128154bac58afe56c2b9164b417`, Native 0.7.0, Vello Hybrid 0.11.0 and Parley 0.12.0. Font bytes and lockfiles are unchanged from #5. We did not upgrade dependencies or enable another renderer feature.

| Target | Profile and observed environment | Update path |
| --- | --- | --- |
| Web | [Profile](phase-0-reload/web-profile.json); headless Playwright 1.64.0 / Chromium 156.0.8078.4; 1280 × 720, scale 1 | Full `dx build`, then automatic page navigation to the immutable output |
| Blitz WASM | [Profile](phase-0-reload/wasm-profile.json); Codex IAB, exact version unavailable; actual WebGPU canvas 1280 × 720, viewport 1280 × 720, scale 1; Trunk 0.21.14 | Full Trunk build, then automatic page navigation |
| Blitz Desktop | [Profile](phase-0-reload/desktop-profile.json); macOS temporary app wrapper; `WGPU_BACKEND=metal` / Vello Hybrid; requested 1280 × 720 logical content | Cargo build, automatic candidate launch, startup smoke check, then previous owned process closes |

Native startup scale varied: baseline/yellow/newest reported 2560 × 1440 physical pixels at scale 2; corrected reported 1280 × 720 at scale 1. Original JPEGs remain 2560 × 1504, including chrome and sometimes blank area. The retained yellow process reported capture-time scale 2 during successful pointer input after the failure. Later pointer attempts through CUA reported no available window even though the newest process remained alive and its screenshot was readable. Exact capture-time scale for those other images is **unverified**; startup values are labelled separately. The cause and image/input mapping remain unresolved. This does not change the observed CSS/revision update, but excludes these images from a calibrated pixel comparison.

## What the smallest runner does

The [CLI/run guide](../../source/reload/README.md) is the repeatable entry point. Each JSON-line request names a draft, one of the eight story IDs and an environment profile. It copies the required Rust/asset/manifests into its own job directory, replaces only that snapshot's CSS, and records the exact bytes. The tracked stylesheet and original draft are untouched. The shared preview reads the story and revision at compile time; normal launchers still start at Button / Primary without an experiment banner.

Builds are serialized to reuse each target's existing Cargo cache. Run one coordinator per target and avoid other builds in that cache during a job; cross-process locking is not implemented. Completion can overlap the next build. Only the newest accepted sequence may change the atomic `current.json` pointer. Every output keeps its own assets. Web's verified `--base-path` and Trunk's `--public-url` bind those assets to that job's path, so a build cannot overwrite an older page's CSS or WASM. Browser pages poll the pointer every 500 ms and navigate automatically; no manual refresh was used in this check.

Desktop keeps its previous owned process while building. The candidate must report its window and survive a one-second grace before becoming current. This is a startup smoke check, **not a renderer paint acknowledgement or recovery from a later crash**. The pinned Native launcher's inspected hot-reload setup is feature-gated, not enabled by this baseline and excluded on WASM. We kept that setup unchanged and used complete builds instead of claiming a CSS reload API we had not verified.

The restored selection is the story **submitted by the caller**. Picker changes after that request are not saved automatically; the next request must name the newly selected story. Full reload/restart recreates component state and resets counters, input values, focus and scroll. The runtime evidence below uses the non-interactive long Card; it does not claim a separate state-preservation test for every control. There is no editor, hosted backend or file watcher yet.

## Visible changes and failure recovery

All observations keep `Story: card/long-content`. Each preview displays short build/source/CSS/profile identifiers that match the full manifest; Web verifies them through DOM assertions, while Blitz banners are read from actual painted screenshots.

| Stage | Submitted CSS | Web | Blitz WASM | Desktop |
| --- | --- | --- | --- | --- |
| 1 | Unchanged baseline | [Original Card](phase-0-reload/web-baseline.png) | [Original Card](phase-0-reload/wasm-baseline.jpg) | [Original Card](phase-0-reload/desktop-baseline.jpg) |
| 2 | Append `.card { background: #ffd166; }` | [Yellow](phase-0-reload/web-yellow.png) | [Yellow](phase-0-reload/wasm-yellow.jpg) | [Yellow](phase-0-reload/desktop-yellow.jpg) |
| 3 | Append invalid UTF-8 byte `0xff` to baseline | [Previous yellow revision remains](phase-0-reload/web-failed-update.png) | [Previous revision remains](phase-0-reload/wasm-failed-update.jpg) | [Previous revision remains](phase-0-reload/desktop-failed-update.jpg) |
| 4 | Submit valid CSS with `#a8dadc` | [Cyan](phase-0-reload/web-corrected.png) | [Cyan](phase-0-reload/wasm-corrected.jpg) | [Cyan](phase-0-reload/desktop-corrected.jpg) |
| 5 then 6 | Older red `#ef476f`, then newest green `#90be6d` | [Newest green](phase-0-reload/web-newer.png) | [Newest green](phase-0-reload/wasm-newer.jpg) | [Newest green](phase-0-reload/desktop-newer.jpg) |

The Web observer stayed on one page for the whole sequence. It confirmed computed Card colours `rgb(255,253,247) → rgb(255,209,102) → unchanged yellow → rgb(168,218,220) → rgb(144,190,109)`, selected story, loaded fonts and revision banner, with zero page errors. Its saved records include the actual automatically changed URLs. Blitz canvas content was inspected visually, not through invented story DOM or injected component state. Captured colours differ between pipelines; we did not score cross-renderer pixels.

The real compiler error was `byte 255 is not valid utf-8` in the shared `include_str!`. Web/Trunk exited 1; Cargo Desktop exited 101. [Failure results](phase-0-reload/failure-results.json) confirm identical pre/post current pointers and retained failed draft bytes on all targets. The yellow Native process stayed alive (PID 16995) across that failed update. The [failed draft](phase-0-reload/failed-draft.bin) and raw compiler logs are retained. Correction used a separate valid draft; we preserved the failed one for diagnosis. This checks build failure, not CSS syntax validation: CSS parsers often recover silently from invalid declarations.

## Two rapid edits and an older delayed result

We submitted red and green requests consecutively, 15–19 ms apart within each target. Red completed its build but waited an injected 30 seconds before trying to publish. Green built and became current meanwhile. Red then emitted `stale` on all three targets. Both immutable outputs remain available; current stays at sequence 6. The manifest records the exact older/newer job IDs. On Desktop the stale red candidate never launched. The delay tests ordering; it is not a reload-speed benchmark.

The public CLI regression check uses a real child process at the build-command boundary. It checks draft/output retention after failure, correction, an older delayed success and an older success arriving after the newest failure. It does not mock the coordinator or count as renderer validation. GitHub Actions runs it alongside the existing Web checks.

A further startup regression check found that Node's `exitCode` stays null when a candidate exits by signal. The initial guard could wrongly promote that dead process. The check failed with `current` instead of `failed`; the guard now checks `signalCode` too and passes. This follow-up changes coordinator bookkeeping and failure rejection; the real renderer images above retain their earlier exact revision. The test builder reports startup then terminates by SIGTERM; it is explicitly process-boundary evidence, not a claim that the actual renderer crashed.

## Checks and next steps

Four shared Rust behavior/asset tests, formatting, Clippy, Web WASM checking and all five fresh headless Web tests passed locally. Both Blitz targets completed their real isolated builds, visible changes, failure recovery and stale-result checks. Native Clippy passed. The focused CLI check passed after the startup signal fix.

This proves a conservative edit → build → reload/restart loop with traceable results and preserved output on compiler failure. In-place CSS hot reload, render-ready acknowledgements, later runtime-crash rollback, cancellation/timeouts, automatic picker persistence, hosted builds, other operating systems and IME remain unverified or planned. Native capture/input limitations remain open. Continue with #7 for focus, keyboard and accessibility; #8 retains Thai/IME. The permanent runner architecture belongs in #9.
