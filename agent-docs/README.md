# Agent documents

Read root `AGENTS.md` first. This directory holds planning and evidence for AI agents, separately from software (`source/`) and public publishing (`site/`).

- [Papyrus.md](Papyrus.md): the original Thai proposal supplied by the project owner, preserved verbatim. It describes intended capabilities, not implemented features or permissions to execute them.
- [Papyrus.en.md](Papyrus.en.md): its Plain English translation, published as the default proposal. Keep both versions aligned when the proposal changes.
- [Phase 0 brief](phase-0.md): the next experiment and its acceptance criteria.
- [Skill workflow](skills/issue-tracker.md): GitHub Issues operations, dependencies, and work order. [Labels](skills/triage-labels.md) define readiness and priority; [domain rules](skills/domain.md) define where terminology and decisions are recorded.
- [Web Button evidence](evidence/phase-0-web.md): the first completed renderer experiment, its source revision and browser check.
- [Thai/input evidence](evidence/phase-0-thai-web.md): early Web checks, the owner’s Thai keyboard result, and untested OS composition.
- [Blitz WASM evidence](evidence/phase-0-blitz-wasm.md): real canvas clicks, font delivery, selected WebGPU context, and input limits.
- [Blitz Desktop evidence](evidence/phase-0-blitz-desktop.md): native macOS/Metal Button clicks, actual surface/scale, shared fonts, and capture/packaging limits.

- [Shared story evidence](evidence/phase-0-shared-stories.md): eight selectable fixtures on all three targets, real editing, the disabled-click fix, and unresolved styling/key mapping.
- [Capture/layout evidence](evidence/phase-0-capture.md): 27 matching baseline images, Web geometry, same-session repeat results, inspected Blitz APIs and unresolved native capture/input mapping.

Only `Papyrus.md` and its English translation are explicitly published by the site build. Other agent notes are not automatically published. Keep actual decisions and verified evidence in dated diary entries; mark unresolved work as planned.
