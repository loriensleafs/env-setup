---
name: run-docs-analysis
description: Lint, link-check, and verify docs/analysis (ANALYSIS documents). Use when asked to check, lint, validate, or run the docs analysis directory.
---

`docs/analysis/` holds ANA-NNN research and empirical analyses, cited per claim. "Running" it means linting every file and proving every relative link
resolves — via the docs driver `docs/.claude/skills/run-docs/link-check.ts` (see `/run-docs`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun docs/.claude/skills/run-docs/link-check.ts docs/analysis   # → 9 files, 24 relative links, 0 broken
bunx markdownlint-cli2 "docs/analysis/*.md"                   # → Summary: 0 issues in 0 files
```

Rules and the template for new files: `docs/analysis/README.md`. Naming: `<TYPE>-<NNN>-<kebab-title>.md`.
