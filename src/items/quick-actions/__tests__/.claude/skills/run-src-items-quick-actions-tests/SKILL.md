---
name: run-src-items-quick-actions-tests
description: Run the bun:test suite for src/items/quick-actions (quick-actions.test.ts). Use when asked to run, test, or check the tests for quick-actions.
---

`bun:test` files for `src/items/quick-actions/` — 1 file, 2 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-items-quick-actions` (`src/items/quick-actions/.claude/skills/run-src-items-quick-actions/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/items/quick-actions/__tests__          # 2 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/items/quick-actions/__tests__/quick-actions.test.ts   # 2 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
