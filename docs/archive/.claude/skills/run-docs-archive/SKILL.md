---
name: run-docs-archive
description: Lint, link-check, and verify docs/archive (ARCHIVE documents). Use when asked to check, lint, validate, or run the docs archive directory.
---

`docs/archive/` holds ARC-NNN retired documents, read-only. "Running" it means linting every file and proving every relative link
resolves — via the docs driver `docs/.claude/skills/run-docs/link-check.ts` (see `/run-docs`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun docs/.claude/skills/run-docs/link-check.ts docs/archive   # → 2 files, 8 relative links, 0 broken
bunx markdownlint-cli2 "docs/archive/*.md"                   # → Summary: 0 issues in 0 files
```

## Gotchas

- Moving a doc here breaks its relative links — the link checker caught two in `ARC-001` (`OVERVIEW.md`,
  `sessions/README.md`) after the move; they were repointed to `../…`. The archive is otherwise never edited.

Rules and the template for new files: `docs/archive/README.md`. Naming: `<TYPE>-<NNN>-<kebab-title>.md`.
