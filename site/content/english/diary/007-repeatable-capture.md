---
title: "Same layout, fifty different pixels"
description: "Repeat captures separate browser layout, raster variation and a native coordinate mismatch."
date: 2026-10-11T04:25:19+07:00
status: "Capture evidence recorded; native mapping unresolved"
tags: ["Dioxus", "Blitz", "testing", "Phase 0"]
draft: false
---

## Why capture comes before comparison

Papyrus needs to show when a shared component changes across Web and Blitz. Before we build a comparison harness, we need to know what its pictures and measurements mean. [Issue #5](https://github.com/jedt3d/papyrus/issues/5) investigates that boundary.

We captured the eight shared fixtures on Web, Blitz WASM and native macOS/Metal. Each target then restored the long Card for one more capture. The 27 baseline images use the same committed source, CSS and font bytes, initial values and 1280 × 720 logical viewport. The evidence keeps raw images, actual sizes, scale, backend, theme, hashes and capture conditions together.

## A small automatic path for Web

The existing headless Playwright suite now captures every fixture and records browser geometry. It waits for fonts, hides the caret, disables animations and moves the pointer away from controls. It also restores the long Card and checks that its measured rectangles are unchanged. GitHub Actions uses the same test and saves its outputs.

All five Web tests passed locally. The repeated Card had identical layout geometry, but 50 of 921,600 image pixels changed. Each channel differed by at most one level out of 255. The cause is still unisolated. A tiny raster difference is not a changed box. Pixels, apparently, also have opinions.

The test records image equality separately. We did not turn this observation into a universal tolerance or a promise of pixel identity.

## Blitz has geometry APIs; the current launcher hides the handle

Blitz's pinned engine exposes a bounding-rectangle API. Our current `launch_cfg()` path owns the document inside the application, so the component cannot read it. Native `document::eval()` is a no-op. Browser DOM inspection sees the WASM canvas, not the Card inside it.

We saved the geometry we could measure: Web component boxes, the WASM host/canvas and native window surface/scale. Internal Blitz component geometry is explicitly unavailable through these launchers. A future embedder can retain the document handle and sample after layout. Its units still need calibration against CSS, scale and captured pixels before comparison.

The repeated WASM and Desktop JPEGs were byte-identical within each pair. That is useful same-session evidence. It does not establish stability on every machine or after a restart, and JPEG can hide small changes.

## The native picture needs its own ruler

The native window API reported a 1280 × 720 physical surface at scale 1 during real pointer input. The capture tool returned a 2560 × 1504 image with chrome and blank area. The painted content occupied a smaller region. Clicking the position seen in that image did not select the Card; a doubled input coordinate did.

We added capture-time window logging, preserved the images and recorded the mismatch. We have not isolated its cause to the capture tool, OS or winit. It would be misleading to silently resize the image and call it calibrated. Native raw captures still need that mapping resolved before an automatic pixel gate can use them.

## What this means for Papyrus

The long Card heading wraps to two visible lines and its body to seven on all three targets. The long Button wraps to three. The arrangements look close. Web supplies exact box measurements; numeric component-layout differences against Blitz remain unknown. The selected picker background and captured colours/text edges differ, so raster appearance stays a separate finding.

The [full evidence and repeat guide](https://github.com/jedt3d/papyrus/blob/main/agent-docs/evidence/phase-0-capture.md) include all images, source/profile hashes, API inspection and limits. The smallest working path is automatic Web capture plus local Blitz capture with recorded calibration and visual fixture checks. We can build on that without pretending the complete harness already exists.

Next is #6: CSS reload and keeping the last working preview after failure. Wider input, Thai/IME and the final harness architecture remain later Phase 0 work.
