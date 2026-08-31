---
name: run-docs-sessions
description: Lint, link-check, and verify docs/sessions (SESSIONS documents). Use when asked to check, lint, validate, or run the docs sessions directory.
---

`docs/sessions/` holds SES-NNN session logs (what was done, session by session) maintained by `bun run session`. "Running" it means linting every file and proving every relative link
resolves — via the docs driver `docs/.claude/skills/run-docs/link-check.ts` (see `/run-docs`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun docs/.claude/skills/run-docs/link-check.ts docs/sessions   # → 5 files, 6 relative links, 0 broken
bunx markdownlint-cli2 "docs/sessions/*.md"                   # → Summary: 0 issues in 0 files
```

## Session tooling (the thing that actually runs here)

```bash
bun run session -- --check   # → session: complete   (exit 1 + list if entries are missing/unfilled)
bun run session              # → session: up to date  (else appends entry skeletons to the newest SES-NNN)
```

`bun run session -- --new <slug>` creates `SES-<next>-<slug>.md` — only at a real session start; it was not run
here so as not to create a stray session file. See `docs/sessions/README.md` for the rules and template.

Rules and the template for new files: `docs/sessions/README.md`. Naming: `<TYPE>-<NNN>-<kebab-title>.md`.
