# Automatic Web browser checks

The owner requested headless Playwright and GitHub Actions. These tests exercise the real Dioxus Web bundle in Chromium. They check Button clicks and Enter, Thai input/echo, deletion, focus, bundled-font loading and bytes, its license, and long-text wrapping. `check-web.mjs` also runs through Codex's documented browser API.

## Run

Set up Rust and Dioxus CLI from the [source guide](../README.md). Use Node 22+ and pnpm 10.11.0. From this directory:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test
```

The runner starts `dx serve` on `127.0.0.1:8080` and stops that child server when done. Locally it can reuse a server already there; make sure that server runs the revision you intend to test. To require a fresh server, stop the existing one and run `CI=true pnpm test`.

The viewport is 1280 × 720 with scale factor 1. Playwright 1.64.0 and its package graph are pinned. Each successful run saves `web-preview.png` and `environment.json` under `test-results/`, including Chromium version, source revision, dirty-worktree flag and stylesheet hash. Failure screenshots and traces help diagnose broken runs; the HTML report is in `playwright-report/`. Generated output is ignored by Git.

## CI and limits

[Web tests workflow](../../.github/workflows/web-tests.yml) runs for pushes to `main` and pull requests that change `source/` or the workflow. It uses Ubuntu 24.04 / Node 22, pinned Rust and checksum-verified Dioxus CLI 0.7.10. It installs Chromium with its Linux dependencies, starts a fresh server, and uploads `web-browser-tests` artifacts for 14 days. It tests code; it does not publish the application or process Issues automatically.

Unicode `fill` and browser key events verify visible behavior, not a genuine OS IME session. Composition remains a separate manual/platform check. These DOM assertions do not inspect text inside the Blitz canvas or prove Desktop behavior. See [Thai evidence](../../agent-docs/evidence/phase-0-thai-web.md) and the [official Playwright web-server](https://playwright.dev/docs/test-webserver) and [CI guides](https://playwright.dev/docs/ci).
