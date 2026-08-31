---
name: run-src-manifest-tests
description: Run the bun:test suite for src/manifest (migrations.test.ts, schema.test.ts, store.test.ts). Use when asked to run, test, or check the tests for manifest.
---

`bun:test` files for `src/manifest/` — 3 files, 10 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-manifest` (`src/manifest/.claude/skills/run-src-manifest/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/manifest/__tests__          # 10 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/manifest/__tests__/migrations.test.ts   # 4 pass, 0 fail
bun test src/manifest/__tests__/schema.test.ts   # 4 pass, 0 fail
bun test src/manifest/__tests__/store.test.ts   # 2 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
