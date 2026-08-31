---
name: run-session-tool
description: "Drive or test the session-log tool `.claude/skills/session/scripts/session.ts` (bun run session: list, new, append, check, close) — its commands and their real outputs, and the session-lib.ts tests. Use when asked to run, debug, change or verify the tool itself. Not for performing the session ritual (joining or opening a session, writing its entries, leaving or closing it), which is /session."
---

`.claude/skills/session/scripts/session.ts` (`bun run session`; `package.json` points here) maintains
`docs/sessions/SES-NNN-*.md` (ADR-017, ADR-020): `list` shows every session with its status,
`new <slug> [--plan …]` opens one (`Status: open`), a bare run appends entry skeletons for commits no
session mentions (Summary/Why placeholders + one line per touched file with +/− counts, release markers
after tagged commits), `check` gates, `close` flips `Status: closed` after the gate. The target is the
session named with `--session`, else the single open one. Its pure half is
`.claude/skills/session/scripts/session-lib.ts`. It is a CLI — run it.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun run session list                      # → one line per session: SES-NNN  open|closed  title, then "open: …"
bun run session check --session SES-004   # → session: complete (SES-004, open)   (exit 1 + "missing:"/"unfilled:" otherwise)
bun run session                                # → session: up to date   (else "+ <sha> <subject>" per appended skeleton)
bun run session close --session SES-003   # → session: SES-003 is already closed   (a closed one is idempotent)
bun .claude/skills/session/scripts/session.ts list   # the same without the package script
```

With two sessions open, a bare `check` (no `--session`) exits 1 with
`2 open sessions — say which with --session: …` — by design, never a guess.

`bun run session new <slug>` creates `docs/sessions/SES-<next>-<slug>.md` and regenerates the index —
run it only for real new work (it was not run here, to avoid a stray file). `close` on an open session
rewrites its Status line — only when the Goal is really done.

## Test

```bash
bun test ./.claude/skills/session/scripts/__tests__/session-lib.test.ts   # → 13 pass — header parsing, selection, status edit, template, index row
bun run test                              # the repo gate: `bun test` (src/) then this file by path
```

`bun run check` covers Biome; the tool is not typechecked (`tsconfig.json` includes `src` only).

## Gotchas

- **`bun test` alone never finds these tests** — Bun's discovery skips `.claude/`, and naming the
  directory (`bun test .claude/skills/session/scripts`) finds nothing either: only the explicit file path
  runs them, which is what the package `test` script does.
- **`docs(session): …` commits are skipped** by design (they are the log updates themselves), as are
  historical `docs(ledger)` ones.
- Uses `git log --no-renames`: a rename shows as a delete + an add (plain, greppable paths).
- Sorting is by the `SES-NNN` number; the H1 `# YYYY-MM-DD HH:MM · Title` line is required (the script
  throws on a file without it). A file without a `Status:` line reads as open (another conversation's,
  or pre-ADR-020) — never add the line to someone else's file to make a gate quiet.
- `check` counts placeholders on entry lines (`- …`), the Goal and the Narrative — never inside prose,
  so prose may mention the placeholder by name — and skips `Outcome` / `Open at end`; `close` counts
  those two as well (`session: NOT closed — SES-NNN is not complete.` names the file, exit 1).
- An append into a closed session is refused; reopen by editing its Status line, with a dated Narrative note.
- A commit is accounted for by an entry heading, by a parent entry's `- Also: <sha>` line, or by the
  trailer `Session-entry: none` in its own message (ADR-021); the bare run appends skeletons only for the rest.
- The tool resolves `docs/sessions/` relative to its own file (`../../../../docs/sessions/`); moving it
  again means changing that one line.
