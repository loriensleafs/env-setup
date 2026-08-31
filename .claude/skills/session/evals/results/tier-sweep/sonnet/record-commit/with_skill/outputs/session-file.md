# 2026-08-30 20:50 · record eval

- Goal: Fix the stale set-favorites.swift asset and record it.
- Outcome: `set-favorites.swift` re-synced with the embedded `SET_FAVORITES_SWIFT` constant
  (5e9b261) and verified byte-identical; OVERVIEW Next-up 5, `src/items/finder/CLAUDE.md` and the
  `run-src-items-finder` skill's stale-asset notes updated to match.
- Open at end: none — the finding from SES-004/`ba38081` is closed. `hooks-format.ts`'s silent
  no-op on a Biome config error (the other half of OVERVIEW Next-up 5) is still open.

## Narrative

Peter committed 5e9b261, closing the `set-favorites.swift` staleness finding from SES-004
(`ba38081`, carried in OVERVIEW Next-up 5): the asset file was missing the `--list` mode and the
`LSSharedFileListItemCopyResolvedURL` binding that the embedded `SET_FAVORITES_SWIFT` constant in
`finder-favorites.ts` already had. This entry records that commit before the PR opens.

Verified two ways: (1) evaluated `SET_FAVORITES_SWIFT` via `bun -e` (importing the module rather
than regex-scraping the source, which mis-reports JS string-escape differences as real diffs) and
diffed it byte-for-byte against `src/items/finder/assets/set-favorites.swift` — identical; (2) ran
the `run-src-items-finder` driver, which now prints `SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓`
and typechecks both files clean, in place of the prior `WARNING: … differs …`.

Updated every doc that stated the file was stale, since the fix commit itself only touched the
asset: OVERVIEW.md (Next-up 5, narrowed to the still-open `hooks-format.ts` item; Status cites this
entry), `src/items/finder/CLAUDE.md` (dropped the stale-asset bullet), and the
`run-src-items-finder` SKILL.md (dropped the Gotchas stale-asset note and refreshed the driver's
sample output block to the current ✓ line). `docs/sessions/SES-004-docs-rehydration.md` and
`docs/archive/ARC-001-living-plan.md` are left as-is — they are the historical record of when the
staleness was *found*, not current-state docs.

## Changes (one entry per commit, in order)

### 2026-08-30 · fix(finder): re-sync set-favorites.swift with the embedded SET\_FAVORITES\_SWIFT constant · 5e9b261

- Summary: Re-syncs `src/items/finder/assets/set-favorites.swift` with the embedded
  `SET_FAVORITES_SWIFT` constant in `finder-favorites.ts`, closing the drift the run-skill driver
  flagged in SES-004.
- Why: The asset and the embedded constant had drifted apart; the item ships the constant at
  runtime (compiled into `~/.config/envsetup`), so the on-disk asset was a stale reference copy
  that could mislead anyone editing it directly. Fixes OVERVIEW Next-up 5 (first half).
- Files:
  - `src/items/finder/assets/set-favorites.swift` (+21/−2) — adds the `--list` mode (prints each
    current favorite's resolved path via the new `LSSharedFileListItemCopyResolvedURL` binding,
    flags `3` = NoUserInteraction | DoNotMountVolumes) and the `SFLItemURLFn` typealias/`dlsym`
    lookup it needs, matching the embedded constant exactly (verified byte-identical via `bun -e`
    and `diff`, and via the `run-src-items-finder` driver's ✓ typecheck-and-compare).
