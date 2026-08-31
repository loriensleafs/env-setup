---
name: run-src-items-finder
description: Run, drive, smoke and test src/items/finder — the Finder sidebar favorites item (LSSharedFileList via an embedded Swift helper). Use when asked to invoke expandedFavorites/sameOrder, inspect FAVORITES, or test finder-favorites without touching the sidebar.
---

`src/items/finder/finder-favorites.ts` sets the Finder sidebar to a decided order through a Swift
helper it compiles at runtime (`SET_FAVORITES_SWIFT`, embedded so it survives
`bun build --compile`). Drive it with `.claude/skills/run-src-items-finder/driver.ts`, which
exercises only the pure helpers. It does **not** call `detect()`: even detect compiles the helper
into `~/.config/envsetup` first (a write); `configure()` rewrites the sidebar and restarts Finder.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

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

`assets/set-favorites.swift` is covered here too: the driver runs `xcrun swiftc -typecheck` on the file AND on the embedded `SET_FAVORITES_SWIFT` constant (what the item actually compiles) and reports drift between them — it never executes either (they rewrite the Finder sidebar).
