---
name: run-src-items-finder-assets
description: Typecheck and verify src/items/finder/assets — the Swift helper that rewrites the Finder sidebar favorites. Use when asked to build, typecheck, smoke or test set-favorites.swift. Never runs it.
---

`src/items/finder/assets/set-favorites.swift` **rewrites the Finder sidebar** when executed. The
safe surface is typechecking. `.claude/skills/run-src-items-finder-assets/driver.ts` typechecks
both this file and the constant the item actually ships (`SET_FAVORITES_SWIFT` in
`finder-favorites.ts`, written to scratch), and reports whether the two are identical.

All paths are relative to the repo root.

## Run (agent path)

```bash
export PATH="$HOME/.bun/bin:$PATH"
SCRATCH=/tmp/envsetup-finder-assets bun src/items/finder/assets/.claude/skills/run-src-items-finder-assets/driver.ts
```

```text
swiftc -typecheck set-favorites.swift ✓
swiftc -typecheck of the embedded SET_FAVORITES_SWIFT constant ✓
WARNING: assets/set-favorites.swift differs from the embedded SET_FAVORITES_SWIFT (the item ships the constant)
```

By hand:

```bash
xcrun swiftc -typecheck src/items/finder/assets/set-favorites.swift; echo "exit=$?"   # exit=0
```

## Run (human path) — mutates Finder

Only `finder-favorites.configure()` runs the compiled binary (`swiftc … -o ~/.config/envsetup/…`,
then `killall Finder`). Do not run it to test.

## Test

No tests in this directory; the item's tests: `bun test src/items/finder/__tests__` (2 pass).

## Gotchas

- The asset file is **stale relative to the embedded constant** (no `--list` mode, no
  `LSSharedFileListItemCopyResolvedURL` binding). The runtime uses the constant. Sync the file
  from the constant when touching this directory.
- `swift <file>` (interpreter) segfaults even on correct code; only `swiftc` works here.
