# scripts — repo tooling (pure Bun)

`session.ts` (`bun run session`) owns `docs/sessions/`: it skips `docs(session)` and `docs(ledger)`
commits, uses `--no-renames` (a rename is a delete + an add), orders by `SES-NNN`, requires the H1
timestamp line, and `--check` counts placeholders on entry lines only. A change to its entry format
is also a change to the template in `docs/sessions/README.md` and to CLAUDE.md "Recording".
