# Automatic Web browser checks

The owner requested headless Playwright and GitHub Actions. These tests exercise the real Dioxus Web bundle in Chromium. They check the shared story picker, Card text/wrapping, TextInput editing/feedback and fixture reset, disabled controls, and long Button labels. The existing Button clicks/Enter, Thai input/echo, deletion, focus, fonts/bytes/license and wrapping checks remain. `check-web.mjs` also runs through Codex's documented browser API.

## Run

Set up Rust and Dioxus CLI from the [source guide](../README.md). Use Node 22+ and pnpm 10.11.0. From this directory:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test
```

The runner first completes `dx build`, then starts `dx serve` on `127.0.0.1:8080` and stops that child server when done. Locally it can reuse a server already there; make sure that server runs the revision you intend to test. To require a fresh server, stop the existing one and run `CI=true pnpm test`. The build runs before the server because Dioxus can return HTTP 200 for its build-waiting page; that response alone does not mean the stories are ready.

The viewport is 1280 × 720 with scale factor 1. Playwright 1.64.0 and its package graph are pinned. Each successful run saves `web-preview.png` and `environment.json` under `test-results/`, including Chromium version, source revision, dirty-worktree flag and stylesheet hash. Failure screenshots and traces help diagnose broken runs; the HTML report is in `playwright-report/`. Generated output is ignored by Git.

`capture.spec.mjs` also saves all eight initial fixtures and a restored long Card: nine viewport PNGs plus `captures.json`. `measure-preview.mjs` reads real DOM border boxes in CSS pixels, scroll/overflow, font readiness, values and focus. The test waits for fonts and two animation frames; screenshots disable animations and hide the caret. It checks the repeated geometry and records PNG equality without requiring pixel identity. Source/CSS/font hashes and capture timestamps travel with the results. See the [capture evidence](../../agent-docs/evidence/phase-0-capture.md) before cross-renderer comparison; these DOM measurements cannot measure Blitz content.

## CI and limits

[Web tests workflow](../../.github/workflows/web-tests.yml) runs for pushes to `main` and pull requests that change `source/` or the workflow. It uses Ubuntu 24.04 / Node 22, pinned Rust and checksum-verified Dioxus CLI 0.7.10. It installs Chromium with its Linux dependencies, starts a fresh server, and uploads `web-browser-tests` artifacts for 14 days. It tests code; it does not publish the application or process Issues automatically.

Unicode `fill` and browser key events verify visible behavior, not a genuine OS IME session. Composition remains a separate manual/platform check. These DOM assertions do not inspect text inside the Blitz canvas or prove Desktop behavior. See [Thai evidence](../../agent-docs/evidence/phase-0-thai-web.md) and the [official Playwright web-server](https://playwright.dev/docs/test-webserver) and [CI guides](https://playwright.dev/docs/ci).

The Web Actions workflow also runs the [public reload CLI failure/order check](../reload/README.md). Its child-builder test checks publication rules, including native startup signal rejection; actual Blitz reload observations are separate [local evidence](../../agent-docs/evidence/phase-0-reload.md).
