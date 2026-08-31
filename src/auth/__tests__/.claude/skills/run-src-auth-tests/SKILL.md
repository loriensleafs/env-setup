---
name: run-src-auth-tests
description: Run the bun:test suite for src/auth (github-device-flow.test.ts). Use when asked to run, test, or check the tests for auth.
---

`bun:test` files for `src/auth/` — 1 file, 4 tests, all passing on 2026-08-30. The module
under test is driven by `/run-src-auth` (`src/auth/.claude/skills/run-src-auth/`).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run

```bash
bun test src/auth/__tests__          # 4 pass, 0 fail
```

Single files (`bun test <path>` filters by path substring):

```bash
bun test src/auth/__tests__/github-device-flow.test.ts   # 4 pass, 0 fail
```

## Gotchas

- `bun test <dir>` is a **substring filter** on the path, not a directory walk — `bun test src/items` also
  runs every `src/items/*/__tests__` file (56 tests), and `bun test src/items/__tests__` runs just these.
- New tests go in this directory as `<original-filename>.test.ts` (sibling `__tests__/`, ADR-004).
