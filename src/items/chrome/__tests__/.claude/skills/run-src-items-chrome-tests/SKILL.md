---
name: run-src-items-chrome-tests
description: Run the bun:test suite for src/items/chrome (chrome-defaults.test.ts, chrome-pwas.test.ts). Use when asked to run, test, or check the tests for chrome.
---

`bun:test` files for `src/items/chrome/` — 2 files, 4 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-items-chrome` (`src/items/chrome/.claude/skills/run-src-items-chrome/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/items/chrome/__tests__          # 4 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/items/chrome/__tests__/chrome-defaults.test.ts   # 2 pass, 0 fail
bun test src/items/chrome/__tests__/chrome-pwas.test.ts   # 2 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
