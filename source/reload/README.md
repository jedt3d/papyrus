# Phase 0 reload experiment

This local experiment builds a submitted CSS draft with a selected shared story. Web and Blitz WASM reload the whole page after a successful build. Blitz Desktop opens the new build automatically, then closes the previous window owned by this session. Component state, input values, focus and scroll reset. The story ID in the submitted request is restored. The picker still works, but its later clicks are not saved: submit that new story ID on the next request.

There is no Studio, hosted build service or file watcher. Submit after editing; the preview switches automatically. This deliberately uses the existing pinned launchers and complete builds. It does not claim in-place CSS hot reload.

## Run

Use Node 22+ and the [pinned Rust/Dioxus tools](../README.md). WASM also needs [Trunk](../blitz-wasm/README.md). Desktop currently uses the tested macOS wrapper and Metal; other platforms are unverified.

Create a draft outside the tracked stylesheet and a profile file. Keep all three sessions on matching software and draft bytes. A profile must have `target` (`web`, `wasm`, or `desktop`) and `environment`; add the actual OS, tools, backend, fonts, window/viewport and scale. Its exact bytes get a SHA-256. Window scale can change, so record the native runtime log alongside the submitted profile.

From the repository root, with `/tmp/papyrus-profile.json` describing the chosen target:

```sh
cp source/assets/story.css /tmp/papyrus-draft.css
node source/reload/experiment.mjs /tmp/papyrus-web-session -- node "$PWD/source/reload/build.mjs" web
```

Use a **new** session directory; existing directories are rejected to preserve their results. Run only one coordinator per target, and wait for it to finish building before using that target's cache through another command. The cache is shared; cross-process locking for several sessions is not implemented. Paste one JSON record per line into that process, including after each edit:

```json
{"draft":"/tmp/papyrus-draft.css","story":"card/long-content","profile":"/tmp/papyrus-profile.json"}
```

Use `wasm` or `desktop` in both the build command and profile for those sessions. On macOS start the Desktop coordinator with `WGPU_BACKEND=metal`.

For Web/WASM, serve only that session on loopback in another terminal:

```sh
python3 -m http.server 8090 --bind 127.0.0.1 --directory /tmp/papyrus-web-session
```

Open `http://127.0.0.1:8090/`. The waiting page and published pages poll `current.json` every 500 ms. A successful result sends the browser to its own immutable asset path. `dx --base-path` and Trunk's `--public-url` keep all assets under that path. Old pages retain their original assets while the build runs. Desktop needs no HTTP server.

To see a change, append `.card { background: #ffd166; }` to the draft and submit again. The Card should turn yellow while still showing `Story: card/long-content`. Every experiment preview displays short build/source/CSS/profile IDs; the full values and snapshot file hashes are in its `revision.json`. The Git commit is ancestry; `sourceHash` identifies the actual copied software, including uncommitted edits. CSS has its own hash.

## Failure and late-result checks

Each accepted request keeps its CSS bytes, profile, copied software and `build.log` in `jobs/<id>/`. A nonzero build exit leaves `current.json` and the last working output untouched. Correct the draft and submit again. CSS parsers often recover from syntax errors, so invalid CSS alone is not a reliable build-failure test. For a reproducible compiler failure, submit a temporary draft containing an invalid UTF-8 byte; Rust rejects the shared `include_str!`. Keep that failed draft, then submit a separate corrected file.

Build commands are serialized to safely reuse each target's existing Cargo cache. Completion delays can overlap the next build. For the required late-result experiment, add `"delayMs":30000` to an older request, then submit a newer draft. The older completed build stays in its job directory and emits `stale`; only the newest accepted request can become current. A newer failed request also disqualifies an older pending success. There is no fallback to that older job. The delay is fault injection, not a performance measurement.

```sh
node --test source/reload/experiment.test.mjs
```

This runs the public JSON-lines CLI with a real child builder at the external-process boundary. It checks retained draft/output, correction, a delayed older success, an older success arriving after the latest failure, and rejection of a native candidate terminated by signal during startup. It does not mock the coordinator or prove renderer behavior. GitHub Actions runs this check beside the existing Web tests; real renderer observations belong in the evidence record.

Native activation keeps its previous owned process until the candidate reports a window and survives one second. This is a startup smoke check, not a paint acknowledgement or recovery from a later crash. The local runner trusts its developer-supplied build command; never expose it as a remote build API. Snapshots retain source and build outputs and may be large. Clean up only after preserving evidence. End the coordinator with Ctrl+C to close the native window it owns.
