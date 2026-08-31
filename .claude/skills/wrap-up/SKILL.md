---
name: wrap-up
description: Close out an envsetup conversation — check the session log, OVERVIEW status and the tree so the next /rehydrate finds everything it needs.
disable-model-invocation: true
---

Run at the end of a conversation (or before a long pause). Recording is continuous by rule; this is
the final check that nothing was deferred. Paths are relative to the repo root; shells need
`export PATH="$HOME/.bun/bin:$PATH"`.

## Steps

1. **Session log complete**

   ```bash
   bun run session                # → session: up to date   (else fill what it appended)
   bun run session -- --check     # → session: complete
   ```

   In the current `SES-NNN`: `Outcome` and `Open at end` describe the conversation as it actually
   ended; the Narrative carries the requests, decisions, dead ends and verifications; every entry's
   `Notes` names what was verified and how, and anything unverified.
2. **OVERVIEW is current** — `docs/OVERVIEW.md` Status (released / unreleased on `main` / parked
   with branch names) and Next up match reality, and cite the session entries' shas. A plan that
   finished has its `Status: done — …` line; a decision made has its ADR; a changed requirement or
   default is in PRD-001; a new or sharpened term is in `CONTEXT.md`.
3. **Tree matches the log**

   ```bash
   git status --short             # nothing uncommitted (WIP goes on a named branch, cited in Status)
   git branch --show-current      # main, after the last PR merged
   gh pr list --state open        # none left dangling, or each named in Open at end
   ```

4. **Say what is next** — the top of Next up is the first thing the next conversation should do;
   if it changed, change it.

## Done when

`session: complete`, a clean tree on `main` (or every exception named in `Open at end` and Status),
and a two-line closing note to the user: what shipped in this conversation, and the first thing to
do next time.
