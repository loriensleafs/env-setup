---
name: run-src-items-defs-tests
description: Run the bun:test suite for src/items/defs (better-display.test.ts, dock.test.ts, dotfiles.test.ts, macos-defaults.test.ts, superwhisper-config.test.ts, xcode-clt.test.ts). Use when asked to run, test, or check the tests for defs.
---

`bun:test` files for `src/items/defs/` — 6 files, 22 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-items-defs` (`src/items/defs/.claude/skills/run-src-items-defs/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/items/defs/__tests__          # 22 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/items/defs/__tests__/better-display.test.ts   # 5 pass, 0 fail
bun test src/items/defs/__tests__/dock.test.ts   # 2 pass, 0 fail
bun test src/items/defs/__tests__/dotfiles.test.ts   # 6 pass, 0 fail
bun test src/items/defs/__tests__/macos-defaults.test.ts   # 3 pass, 0 fail
bun test src/items/defs/__tests__/superwhisper-config.test.ts   # 2 pass, 0 fail
bun test src/items/defs/__tests__/xcode-clt.test.ts   # 4 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
