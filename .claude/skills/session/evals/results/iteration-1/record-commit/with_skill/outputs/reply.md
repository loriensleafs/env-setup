Recorded — `784b161` `docs(session): …` sits on top of your `91fd2a8`. Tree clean, `bun run session -- --check` → `session: complete`, `bun run check` clean, lefthook passed. I have not pushed; the PR (`91fd2a8` + `784b161`) is yours to open.

Verified before writing, not taken from the commit message: the finder driver prints `SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓` and both `swiftc -typecheck` lines; file and constant are 83 lines each; `bun test` 111 pass, 0 fail.

What the commit holds:

- `SES-006`: the `91fd2a8` entry (Summary, Why, per-file line, Notes with what was verified and how), Narrative, Outcome, Open at end.
- Stale docs, same step: OVERVIEW Status (unreleased on `main` now lists `91fd2a8` and `ea51e09`) and Next-up 5 (asset half marked done, `hooks-format.ts` remains); `src/items/finder/CLAUDE.md` and the `run-src-items-finder` skill no longer call the asset stale (expected driver output updated).

Two things to know before you open the PR:

1. `bun run session` surfaced a second unrecorded commit: `ea51e09`, the `/session` skill itself (direct to `main`, 19:35:01). SES-005 — the conversation that built it — was never closed (Outcome / Open at end blank), and `--check` scans every session file, so the gate was already `NOT ready` before this session started. I moved that entry into SES-005 (as `1187acc` did for `b433789`), filled it from the diff, and closed SES-005 with a dated retroactive note. Nothing older was rewritten. If you'd rather it live in SES-006, say so and I'll move it back.
2. The asset and the constant are still two hand-kept copies; only the driver's WARNING line catches drift. I deferred the guard — a `bun:test` asserting the asset equals `SET_FAVORITES_SWIFT` — rather than bundle code into a docs commit; it is named in the entry's Notes and in Next-up 5. Want it in this PR?
