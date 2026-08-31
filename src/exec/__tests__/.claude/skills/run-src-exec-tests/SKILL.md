---
name: run-src-exec-tests
description: Run the bun:test suite for src/exec (run.test.ts). Use when asked to run, test, or check the tests for exec.
---

`bun:test` files for `src/exec/` — 1 file, 3 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-exec` (`src/exec/.claude/skills/run-src-exec/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/exec/__tests__          # 3 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/exec/__tests__/run.test.ts   # 3 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
