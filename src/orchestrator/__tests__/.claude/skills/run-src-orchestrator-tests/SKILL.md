---
name: run-src-orchestrator-tests
description: Run the bun:test suite for src/orchestrator (orchestrator.test.ts). Use when asked to run, test, or check the tests for orchestrator.
---

`bun:test` files for `src/orchestrator/` — 1 file, 9 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-orchestrator` (`src/orchestrator/.claude/skills/run-src-orchestrator/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/orchestrator/__tests__          # 9 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/orchestrator/__tests__/orchestrator.test.ts   # 9 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
