---
name: run-scripts
description: Drive or test scripts/session.ts, the session-log tool (bun run session: new, append, check) — its commands and their real outputs. Use when asked to run, debug, change or verify the tool itself. Not for performing the session ritual (starting, recording or ending a session), which is /session.
---

`scripts/session.ts` maintains `docs/sessions/SES-NNN-*.md` (ADR-017): `--new <slug>` starts a session file,
a bare run appends entry skeletons for commits no session mentions (Summary/Why placeholders + one line per
touched file with +/− counts, release markers after tagged commits), `--check` gates. It is a CLI — run it.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun scripts/session.ts --check      # → session: complete        (exit 1 + "missing:"/"unfilled:" lines otherwise)
bun scripts/session.ts              # → session: up to date      (else "+ <sha> <subject>" per appended skeleton)
bun run session -- --check          # same via the package script (note the `--` before flags)
```

`bun run session -- --new <slug>` creates `docs/sessions/SES-<next>-<slug>.md` and regenerates the index —
run it only at a real session start (it was not run here, to avoid a stray file).

## Test

No `__tests__` for scripts (2026-08-30). Behaviour is exercised by the runs above; `bun run check`
covers Biome + tsc.

## Gotchas

- **`docs(session): …` commits are skipped** by design (they are the log updates themselves), as are
  historical `docs(ledger)` ones.
- Uses `git log --no-renames`: a rename shows as a delete + an add (plain, greppable paths).
- Sorting is by the `SES-NNN` number; the H1 `# YYYY-MM-DD HH:MM · Title` line is required (the script
  throws on a file without it).
- `--check` counts placeholders only on entry lines (`- …`), so prose may mention the placeholder by name.
