---
name: run-src-paths-tests
description: Run the bun:test suite for src/paths (paths.test.ts). Use when asked to run, test, or check the tests for paths.
---

`bun:test` files for `src/paths/` — 1 file, 3 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-paths` (`src/paths/.claude/skills/run-src-paths/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/paths/__tests__          # 3 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/paths/__tests__/paths.test.ts   # 3 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
