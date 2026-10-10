# Papyrus

Papyrus is a planned Rust component workbench for designing, previewing, and checking styles across **Dioxus Web** and **Dioxus Native / Blitz**. This repository contains a Hugo developer diary and the first working Web Button story. The full workbench and compatibility harness are not implemented yet.

- **Developer diary:** https://jedt3d.github.io/papyrus/
- **Original proposal:** [agent-docs/Papyrus.md](agent-docs/Papyrus.md) (Thai)
- **Next experiment:** [agent-docs/phase-0.md](agent-docs/phase-0.md)
- **Web Button experiment:** [run guide](source/README.md) and [verified evidence](agent-docs/evidence/phase-0-web.md).
- **Phase 0 tickets:** [GitHub Issues](https://github.com/jedt3d/papyrus/issues?q=is%3Aissue%20is%3Aopen%20label%3Aphase%3A0); the Web baseline is implemented, with [#2](https://github.com/jedt3d/papyrus/issues/2) and [#3](https://github.com/jedt3d/papyrus/issues/3) next.
- **Agent instructions:** [AGENTS.md](AGENTS.md)
- **Project skills:** [Matt Pocock's Engineering and Productivity skills](.agents/skills/README.md)

## Repository layout

```text
papyrus/
├── source/       Rust software, experiments, tests and fixtures
├── site/         Hugo/Hugoplate publishing project
├── agent-docs/   AI agent briefs and original proposal
├── AGENTS.md     Root working instructions
├── README.md     Status, commands and priorities
└── .github/      Publishing workflow
```

The three areas are intentionally separate. The site exports only the original proposal from agent documents, rather than exposing every agent note.

## Priorities

1. Keep the developer diary and Pages publishing working.
2. Prove shared Button, Card and TextInput stories on Web, Blitz WASM and Blitz Desktop; measure CSS reload, capture, input, Thai text and IME support.
3. Build compatibility profiles, source checks and renderer testing from verified evidence.
4. Build Studio, the local backend, revision-aware preview reload and gallery export.
5. Add Web CSS import/adaptation, CI and team workflows.
6. Publish software reference and user guides alongside implemented features.

Do not treat unknown renderer behavior as supported. Passing Blitz WASM does not prove Desktop compatibility.

## Run the publishing site

Prerequisites: Hugo Extended **0.158.0**, Node **22+**, Go **1.24+**, pnpm **10.11.0**.

```sh
cd site
pnpm install --frozen-lockfile
pnpm test
pnpm dev
```

Open the URL printed by Hugo. To build for GitHub Pages:

```sh
pnpm build
python3 scripts/check_site.py
```

Python 3 is used by the static link/path check (also run in CI). Output is `site/public/` and is ignored by Git. The build synchronizes the original proposal and regenerates Hugoplate theme tokens before Hugo runs.

## Publish and write

Pushes to `main` build and deploy through `.github/workflows/pages.yml`; pull requests build and check without deployment. GitHub Pages uses Actions with the project subpath `/papyrus/`.

- Diary entries: `site/content/english/diary/`.
- Public roadmap/reference/user guide pages: `site/content/english/pages/`.
- Proposal: edit `agent-docs/Papyrus.md` when a proposal change is intended. Its public page is generated.
- Theme tokens: `site/data/theme.json`.
- Local presentation overrides: `site/layouts/` and `site/assets/css/custom.css`.

Hugoplate is vendored from [zeon-studio/hugoplate](https://github.com/zeon-studio/hugoplate), with its MIT notice preserved. See [theme provenance](site/themes/hugoplate/UPSTREAM.md). No external CMS account is required; content is Markdown in Git.

## License

Project license: [MIT](LICENSE). Vendored dependencies retain their own license notices.
