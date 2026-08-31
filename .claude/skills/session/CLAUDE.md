# .claude/skills/session — the ritual and its tool

`SKILL.md` is the procedure (`start · entry · end · close`); `scripts/session.ts` is the tool behind
`bun run session` (`package.json` points here), driven and tested by `/run-session-tool`; its pure
half — header parsing, session selection, the status edit — is `scripts/session-lib.ts`, tested in
`scripts/__tests__/session-lib.test.ts`. Tool invariants: it skips `docs(session)` and
`docs(ledger)` commits and commits whose message carries `Session-entry: none`, and reads a parent entry's `- Also: <sha>` lines as accounting for fix-ups (ADR-021); uses `--no-renames` (a rename is a delete + an add); orders sessions by
`SES-NNN`; requires the H1 timestamp line; reads `Status: open | closed` (absent = open) and
`Plan:`; the target of an append, `check` or `close` is the session named with `--session`,
else the single open one — none or several open is an error, never a guess; `close` runs the
gate first; `current` lists the target's placeholders by line; `check` counts placeholders on
entry lines, the Goal and the Narrative, and `close` alone also counts `Outcome` and `Open at
end` (an open session has no Outcome yet). A change to the header or entry format is also a change to the template in
`docs/sessions/README.md`, to CLAUDE.md "Recording" and to `SKILL.md`. `evals/` is the
skill-creator evidence (ADR-019); results are committed, fixture clones are not.
