Recorded. `0db569f` now has its entry in `docs/sessions/SES-006-record-eval.md`, committed as `c48eacd` — tree clean, `bun run session -- --check` prints `session: complete`, `bun run check` is green.

**What went into the entry**

- Summary / Why / file line: the `--list` mode plus the `SFLItemURLFn` / `LSSharedFileListItemCopyResolvedURL` binding added to the asset; item behaviour unchanged, since runtime always compiled the constant — only the readable copy was behind. Motive cited as OVERVIEW Next-up 5 (SES-004 `ba38081`).
- Notes: verified two ways, not from the diff — a byte-for-byte compare of the file against the exported constant (`===` true, 84 lines each) and the finder run-skill driver, which now prints `SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓` and typechecks both. Not executed (it rewrites the sidebar). No test asserts the equality; the driver is the only oracle, which I noted so the next edit to the constant re-syncs the file.
- Narrative, Outcome and Open at end are filled.

**Stale docs updated in the same commit** — three places still said the asset was stale:

- `docs/OVERVIEW.md` — Status "Unreleased on main" gains the fix; Next-up 5 keeps only the `hooks-format.ts` half, with the set-favorites part marked done citing `0db569f`.
- `src/items/finder/CLAUDE.md` — the "currently stale" bullet becomes the convention: edit the constant, re-sync the file in the same commit, the driver warns on drift.
- `src/items/finder/.claude/skills/run-src-items-finder/SKILL.md` — sample output and Gotchas no longer show the WARNING line.

**Two things to know before the PR**

- `--check` warns that `SES-005-rehydration.md` has 2 unfilled placeholders. That is another conversation's file, so I left it alone as the skill directs — but it will sit in the same PR, so worth a look.
- I did not push; the PR is yours. The other half of Next-up 5 (`hooks-format.ts` exiting 0 silently on a Biome config error) is still open.
