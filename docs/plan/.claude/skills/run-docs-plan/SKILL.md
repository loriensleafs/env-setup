---
name: run-docs-plan
description: Lint, link-check, and verify docs/plan (PLAN documents). Use when asked to check, lint, validate, or run the docs plan directory.
---

`docs/plan/` holds PRD-001 product requirements and PLAN-NNN feature plans. "Running" it means linting every file and proving every relative link
resolves — via the docs driver `docs/.claude/skills/run-docs/link-check.ts` (see `/run-docs`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun docs/.claude/skills/run-docs/link-check.ts docs/plan   # → 3 files, 11 relative links, 0 broken
bunx markdownlint-cli2 "docs/plan/*.md"                   # → Summary: 0 issues in 0 files
```

Rules and the template for new files: `docs/plan/README.md`. Naming: `<TYPE>-<NNN>-<kebab-title>.md`.
