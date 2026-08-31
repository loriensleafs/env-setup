# 2026-08-30 22:17 · record eval

- Goal: Fix the stale set-favorites.swift asset and record it.
- Status: open
- Plan: —
- Outcome: _(fill in)_
- Open at end: _(fill in)_

## Narrative

Peter fixed the stale `src/items/finder/assets/set-favorites.swift` asset (OVERVIEW Next-up 5, found
by the finder driver in SES-004 `ba38081`) and asked for it to be recorded before opening the PR
(`c65249b`). Verified in this conversation: the finder driver now prints
`SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓` where it printed `WARNING: … differs` before;
`cmp` of the file against the constant written out by `bun -e` is byte-identical (83 lines each,
same sha256); `xcrun swiftc -typecheck` passes on the file; `bun test src/items/finder/__tests__`
2 pass. Neither copy was run — the helper rewrites the sidebar. Three docs that stated the asset
was stale were updated in the same step, citing `c65249b`: OVERVIEW Status / Next-up 5,
`src/items/finder/CLAUDE.md`, and the finder run skill's expected driver output and gotcha.
Nothing generates one copy from the other; the driver's `===` check stays the only guard.

## Changes (one entry per commit, in order)

### 2026-08-30 · fix(finder): re-sync set-favorites.swift with the embedded SET\_FAVORITES\_SWIFT constant · c65249b

- Summary: Re-syncs the shipped asset file with the embedded `SET_FAVORITES_SWIFT` constant the
  item actually compiles, so the two copies are byte-identical again: the file gains the `--list`
  mode (prints the current favorites' file paths, one per line, via
  `LSSharedFileListItemCopyResolvedURL`) that `detect()` relies on.
- Why: The finder driver flagged the asset as stale in SES-004 (`ba38081`, OVERVIEW Next-up 5);
  Peter fixed it and asked for it to be recorded before opening the PR.
- Files:
  - `src/items/finder/assets/set-favorites.swift` (+21/−2) — adds the `SFLItemURLFn` typealias and
    the `LSSharedFileListItemCopyResolvedURL` dlsym binding, parses `--list` from the arguments, and
    adds the `--list` branch that prints each favorite's resolved file-URL path and exits 0 before
    the clear-and-insert; now matches the constant byte for byte
- Notes: Verified by the finder driver (`SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓`,
  `swiftc -typecheck` ✓ on both copies), an independent `cmp` + sha256 of the file against the
  constant written out by `bun -e`, and `bun test src/items/finder/__tests__` (2 pass). Not run —
  the helper rewrites the Finder sidebar. Runtime behaviour is unchanged (the item always compiled
  the constant). The two copies are still maintained by hand; the driver's `===` line is the only
  guard.
