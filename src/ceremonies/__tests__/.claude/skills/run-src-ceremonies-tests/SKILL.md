---
name: run-src-ceremonies-tests
description: Run the (currently empty) test directory for src/ceremonies. Use when asked to run, add, or check tests for ceremonies.
---

`src/ceremonies/__tests__/` exists but holds **no test files** (as of 2026-08-30). Running it is a no-op; add
`<name>.test.ts` files here (sibling `__tests__/` convention, `bun:test`) and they run with:

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

```bash
bun test src/ceremonies/__tests__       # currently: no tests to run
```

The module itself is driven by `/run-src-ceremonies` (`src/ceremonies/.claude/skills/run-src-ceremonies/`).
The whole suite: `bun test` → 111 pass, 0 fail.
