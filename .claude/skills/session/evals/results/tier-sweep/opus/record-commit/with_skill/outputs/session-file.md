# 2026-08-30 20:50 · record eval

- Goal: Fix the stale set-favorites.swift asset and record it.
- Outcome: `e1f2f0b` re-syncs `src/items/finder/assets/set-favorites.swift` with the embedded
  `SET_FAVORITES_SWIFT` constant — the finder driver now prints
  `SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓` instead of its drift warning. The docs the
  fix made stale (OVERVIEW Next up 5, `src/items/finder/CLAUDE.md`, the finder run skill) are
  updated in the same step. Not yet pushed or PR'd.
- Open at end: nothing *enforces* that the asset and the constant stay equal — the driver only
  reports the mismatch, and re-syncing by hand is what drifted last time; generating one from the
  other (or a test that asserts equality) is still open. The other half of OVERVIEW Next up 5 —
  `hooks-format.ts` exiting 0 silently on a Biome config error — is untouched.

## Narrative

Peter asked for the stale `set-favorites.swift` asset to be fixed and recorded before he opens the
PR. The drift was a SES-004 finding from the run-skill drivers (`ba38081`) and item 5 of OVERVIEW
"Next up": `src/items/finder/finder-favorites.ts` embeds the helper as the `SET_FAVORITES_SWIFT`
constant (embedded so it survives `bun build --compile`), the item compiles *that*, and the
checked-in `assets/set-favorites.swift` had fallen 19 lines behind it — so behaviour was correct
but anyone editing the file was editing a dead copy.

`e1f2f0b` brings the file back to the constant: the `SFLItemURLFn` typealias, the
`LSSharedFileListItemCopyResolvedURL` dlsym, and the `--list` mode `detect()` reads the current
sidebar with. Verified rather than assumed: `bun src/items/finder/.claude/skills/run-src-items-finder/driver.ts`
now prints `SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓` (it printed
`WARNING: assets/set-favorites.swift differs …` before the commit — that warning was the recorded
symptom in the run skill's own expected output), and `swiftc -typecheck` passes on both the asset
and the constant. Neither is ever executed by the driver: running the helper rewrites the real
Finder sidebar. `bun test src/items/finder/__tests__` → 2 pass, 0 fail; `bun run check` clean.

Not done, deliberately: no mechanism was added to keep the two copies equal. The re-sync is a
hand-made equality that the driver reports on but does not gate, which is exactly how it drifted
the first time — recorded in "Open at end" rather than solved here, since Peter asked for the fix
recorded, not for a new gate.

## Changes (one entry per commit, in order)

### 2026-08-30 · fix(finder): re-sync set-favorites.swift with the embedded SET\_FAVORITES\_SWIFT constant · e1f2f0b

- Summary: `assets/set-favorites.swift` is now byte-identical to the embedded
  `SET_FAVORITES_SWIFT` constant in `src/items/finder/finder-favorites.ts`: it gains the `--list`
  mode (prints the current favorites, one path per line) and the
  `LSSharedFileListItemCopyResolvedURL` binding behind it, which `detect()` relies on.
- Why: the asset had drifted behind the constant (SES-004 run-driver finding `ba38081`, OVERVIEW
  Next up 5). The item compiles the constant, so runtime was correct — but the checked-in file was
  a dead copy anyone would have edited by mistake. Peter asked for it before opening the PR.
- Files:
  - `src/items/finder/assets/set-favorites.swift` (+21/−2) — adds the `SFLItemURLFn` typealias and
    the `LSSharedFileListItemCopyResolvedURL` dlsym to the guard, parses `--list` out of the
    arguments (making an empty path list legal only in that mode), and adds the `--list` branch
    that snapshots the list and prints each resolved file URL's path with flags `3`
    (NoUserInteraction | DoNotMountVolumes) before exiting 0.
- Notes: verified, not assumed —
  `bun src/items/finder/.claude/skills/run-src-items-finder/driver.ts` prints
  `SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓` (it printed the `differs` warning before
  this commit) and `swiftc -typecheck` passes on both copies; `bun test src/items/finder/__tests__`
  2 pass / 0 fail; `bun run check` clean. Neither copy was executed — `set-favorites` rewrites the
  real Finder sidebar. Nothing yet *keeps* the two equal: the driver warns, it does not gate.
