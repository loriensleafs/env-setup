---
name: run-src-ui-tests
description: Run the bun:test suite for src/ui (config-screens.test.ts, group-multi-select.test.ts, radio-group.test.ts). Use when asked to run, test, or check the tests for ui.
---

`bun:test` files for `src/ui/` — 3 files, 11 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-ui` (`src/ui/.claude/skills/run-src-ui/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/ui/__tests__          # 11 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/ui/__tests__/config-screens.test.ts   # 1 pass, 0 fail
bun test src/ui/__tests__/group-multi-select.test.ts   # 9 pass, 0 fail
bun test src/ui/__tests__/radio-group.test.ts   # 1 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
