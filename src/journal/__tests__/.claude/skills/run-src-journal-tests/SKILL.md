---
name: run-src-journal-tests
description: Run the bun:test suite for src/journal (journal.test.ts). Use when asked to run, test, or check the tests for journal.
---

`bun:test` files for `src/journal/` — 1 file, 5 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-journal` (`src/journal/.claude/skills/run-src-journal/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/journal/__tests__          # 5 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/journal/__tests__/journal.test.ts   # 5 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
