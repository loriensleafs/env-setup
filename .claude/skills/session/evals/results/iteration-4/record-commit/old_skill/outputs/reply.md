Recorded — `c65249b` has its entry in SES-006 and the docs that called the asset stale are corrected, committed as `2ee45ae` (`docs(session): record c65249b — set-favorites.swift re-synced; finder docs and OVERVIEW no longer call it stale`). Tree is clean on `main`; gate: `session: complete (SES-006, open)`.

**Verified the fix's claim before writing it down** (nothing was run — the helper rewrites the sidebar):

- finder driver: `SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓`, `swiftc -typecheck` ✓ on both copies, `OK` (it printed `WARNING: … differs` before the fix)
- independent `cmp` of the file against the constant written out by `bun -e`: byte-identical, 83 lines each, same sha256 (`22ea5dcd…9a475`)
- `xcrun swiftc -typecheck src/items/finder/assets/set-favorites.swift`: ok
- `bun test src/items/finder/__tests__`: 2 pass, 0 fail

**Entry** (`docs/sessions/SES-006-record-eval.md`): Summary, Why (SES-004 `ba38081` finding, your fix), the per-file line (adds the `SFLItemURLFn` typealias + `LSSharedFileListItemCopyResolvedURL` binding, parses `--list`, adds the `--list` branch that prints each favorite's resolved path and exits before the clear-and-insert), Notes with the verification above; Narrative written. `Outcome` / `Open at end` stay placeholders until `close`.

**Made stale by the fix, updated citing `c65249b`:**

- `docs/OVERVIEW.md` — Status gains an "Unreleased on `main` (SES-006, `c65249b`)" bullet; Next-up 5 now carries only the `hooks-format.ts` finding, with the re-sync noted done (generating one copy from the other remains open)
- `src/items/finder/CLAUDE.md` — "currently **stale**" → the two are the same text, hand-synced, edit both together
- `src/items/finder/.claude/skills/run-src-items-finder/SKILL.md` — expected driver output shows the `===` line instead of the `WARNING`; the "is stale" gotcha became "must stay identical, the driver's `===` line is the guard"

Left alone: SES-004's entries (history), ANA-009 (only quotes a test query), SES-005 (the other conversation's open session — its placeholders are its own).

One thing worth knowing for the PR: nothing generates one copy from the other, so the driver's `===` check is the only thing that will catch the next drift.
