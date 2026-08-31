# scripts — repo tooling (pure Bun)

`session.ts` (`bun run session`, driven by `/run-scripts`) owns `docs/sessions/`. Its invariants:
it skips `docs(session)` and `docs(ledger)` commits; uses `--no-renames` (a rename is a delete + an
add); orders sessions by `SES-NNN`; requires the H1 timestamp line; `--session SES-NNN` selects the
conversation's own file for appends and the gate (default: the newest); `--check` counts placeholders
on entry lines only. A change to the entry format is also a change to the template in
`docs/sessions/README.md` and to CLAUDE.md "Recording".
