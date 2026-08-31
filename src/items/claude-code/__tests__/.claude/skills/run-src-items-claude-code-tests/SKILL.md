---
name: run-src-items-claude-code-tests
description: Run the bun:test suite for src/items/claude-code (claude-settings.test.ts). Use when asked to run, test, or check the tests for claude-code.
---

`bun:test` files for `src/items/claude-code/` — 1 file, 4 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-items-claude-code` (`src/items/claude-code/.claude/skills/run-src-items-claude-code/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/items/claude-code/__tests__          # 4 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/items/claude-code/__tests__/claude-settings.test.ts   # 4 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
