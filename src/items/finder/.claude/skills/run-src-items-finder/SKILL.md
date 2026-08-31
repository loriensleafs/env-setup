---
name: run-src-items-finder
description: Run, drive, smoke and test src/items/finder — the Finder sidebar favorites item (LSSharedFileList via an embedded Swift helper). Use when asked to invoke expandedFavorites/sameOrder, inspect FAVORITES, or test finder-favorites without touching the sidebar.
---

`src/items/finder/finder-favorites.ts` sets the Finder sidebar to a decided order through a Swift
helper it compiles at runtime (`SET_FAVORITES_SWIFT`, embedded so it survives
`bun build --compile`). Drive it with `src/items/finder/.claude/skills/run-src-items-finder/driver.ts`, which
exercises the pure helpers and typechecks both `assets/set-favorites.swift` and the embedded
constant (`xcrun swiftc -typecheck`; neither is executed — they rewrite the sidebar). It does **not** call `detect()`: even detect compiles the helper
into `~/.config/envsetup` first (a write); `configure()` rewrites the sidebar and restarts Finder.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun src/items/finder/.claude/skills/run-src-items-finder/driver.ts
```

```text
FAVORITES: /Applications · ~ · ~/Desktop · ~/Documents · ~/Downloads · ~/Dev · ~/.claude
expandedFavorites → /Users/peterkloss … (7)
sameOrder(same)=true sameOrder(reversed)=false
WARNING: assets/set-favorites.swift differs from the embedded SET_FAVORITES_SWIFT (the item compiles the constant)
item finder-favorites: kind=system deps=xcode-clt
swiftc -typecheck assets/set-favorites.swift ✓
swiftc -typecheck embedded SET_FAVORITES_SWIFT ✓
OK
```

## Direct invocation

```bash
bun -e 'import {expandedFavorites} from "./src/items/finder/finder-favorites.ts"; console.log(expandedFavorites())'
```

## Test

```bash
bun test src/items/finder/__tests__    # 2 pass, 0 fail
```

## Gotchas

- **`assets/set-favorites.swift` is stale** (found by this driver): the embedded constant has the
  `--list` mode and `LSSharedFileListItemCopyResolvedURL` binding the item relies on for
  `detect()`; the asset file (64 lines vs 83) predates it. The item ships the constant, so
  behaviour is correct — but edit the constant, not the file, until they are re-synced.
- The helper must be **compiled** (`swiftc`); the `swift <file>` interpreter segfaults on it
  (docs/analysis/ANA-006).
