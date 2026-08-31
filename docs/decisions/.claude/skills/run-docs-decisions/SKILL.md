---
name: run-docs-decisions
description: Lint, link-check, and verify docs/decisions (DECISIONS documents). Use when asked to check, lint, validate, or run the docs decisions directory.
---

`docs/decisions/` holds ADR-NNN Architecture Decision Records — the current truth of every decision. "Running" it means linting every file and proving every relative link
resolves — via the docs driver `docs/.claude/skills/run-docs/link-check.ts` (see `/run-docs`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun docs/.claude/skills/run-docs/link-check.ts docs/decisions   # → 18 files, 25 relative links, 0 broken
bunx markdownlint-cli2 "docs/decisions/*.md"                   # → Summary: 0 issues in 0 files
```

Rules and the template for new files: `docs/decisions/README.md`. Naming: `<TYPE>-<NNN>-<kebab-title>.md`.
