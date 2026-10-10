# Domain documents

Papyrus has one domain context. Keep its documents in the agent area, separate from Rust source and the Hugo site.

Before domain work, read `agent-docs/GLOSSARY.md` if it exists and relevant records in `agent-docs/adr/`. If they do not exist, continue; create them only when a term or decision is resolved. Use the existing Phase 0 brief and root instructions for current terminology.

- **Glossary:** `agent-docs/GLOSSARY.md` contains agreed terms, not implementation plans.
- **Architecture decisions:** `agent-docs/adr/` contains numbered decision records, created when an architectural choice is made.
- **Skill configuration:** `agent-docs/skills/` contains tracker, label, and domain rules.

Use these paths when a vendored skill mentions a root glossary, `docs/agents/`, or `docs/adr/`. Keep the vendored skill files unchanged. Use agreed vocabulary in ticket titles, tests, and reports. Explain a conflict with an existing decision before proposing to change it.

Web CSS means browser-rendered CSS. Blitz CSS means CSS rendered by Blitz. Neither is a new CSS language. Dioxus Web, Blitz WASM, and Blitz Desktop are separate test targets; a result on one does not prove behavior on another.

Write these documents in Plain English under the root documentation rules. Agent documents are not automatically published to the website.
