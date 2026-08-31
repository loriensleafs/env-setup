---
name: session
argument-hint: "start | record | end"
arguments: [mode]
allowed-tools: Bash(git status:*) Bash(git branch:*) Bash(git log:*) Bash(bun run session:*)
description: "Runs the envsetup session ritual and produces its artifacts: `/session start` reads the docs system in full (OVERVIEW, the newest SES, CONTEXT.md, the area's ADRs/analyses/plan), checks the tree against the session log, creates this conversation's docs/sessions/SES-NNN file and posts a brief; `/session record` after every commit appends and fills the commit's entry, updates OVERVIEW/ADR/PRD/CONTEXT.md where the change made them stale, and commits it as docs(session); `/session end` verifies the log is complete, Status is current and the tree is clean. Use at the start of a conversation in this repo, right after each commit, and before finishing. Not for authoring the docs themselves (an ADR, the PRD, an analysis, the glossary — those have their own skills), not for driving the CLI (the run skills), and not for running, changing or testing the session tool itself (`scripts/session.ts`: the run-scripts skill; questions about it: docs/sessions/README.md)."
---

# Session — start, record, end

Every conversation here starts from nothing but the repo; the docs system (ADR-017) is the
continuity, and only if each conversation reads it at the start and writes to it as it goes.
Mode: **$mode** (`start`, `record` or `end`; when empty, infer: no session file created in this
conversation → `start`; a commit just landed → `record`; the user is wrapping up → `end`).

Live state at invocation (injected; do not re-run these to "confirm"):

- Branch: `!`git branch --show-current``
- Tree: `!`git status --short | head -20 || true``
- Log gate: `!`bun run session -- --check 2>&1 | tail -4 || true``

Paths are relative to the repo root; a shell you open needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Gotchas

- **No sampling.** Every file a step names is read to its last line; when the Read tool truncates,
  continue with `offset`. A file you did not finish is a file you did not read.
- **Your session file is the one you created, not the newest.** Another conversation may share
  this checkout (a stray `SES-005` once got swept into a commit). `bun run session -- --new`
  prints your file's name; from then on every `bun run session` and `--check` in this conversation
  takes `--session SES-NNN` with that name. Placeholders in any other session are that
  conversation's: the gate reports them as warnings, and you leave that file untouched.
- **The gate's exit status is the gate.** Run `bun run session -- --check --session SES-NNN`
  bare and read its exit; pipe it through nothing (a `| tail` once hid a failure and a PR merged
  with an unfilled entry). Stage by named file; `git add -A` is how the stray file got swept in.
- **`docs(session): …` commits are skipped by the tool** — the entry-writing commit never needs an
  entry of its own.
- **`--new` runs once per conversation**; after a release tag, one more `bun run session` lands the
  `> **Released vX.Y.Z**` marker.

## start

```text
Start progress:
- [ ] 1 OVERVIEW read to the end
- [ ] 2 sessions index + newest SES read to the end (+ earlier ones back to the last release marker)
- [ ] 3 CONTEXT.md read to the end
- [ ] 4 injected state above read as findings (branch, tree, gate)
- [ ] 5 the area's PLAN / ADRs / ANAs read
- [ ] 6 session file created and Goal set
- [ ] 7 brief posted in the template
```

1. `docs/OVERVIEW.md` — all of it; hold **Status**, **Next up**, **Key empirical facts**.
2. `docs/sessions/README.md` (the index), then the newest `SES-NNN` in full (Goal / Outcome / Open
   at end, Narrative, every entry), then earlier sessions back to the last `> **Released vX.Y.Z**`
   marker. Collect: unreleased on `main`, parked branches (Status names them), what was tried and
   abandoned, what was verified and how.
3. `CONTEXT.md` — its words from here on, in code labels, prompts, commits, docs.
4. The injected branch / tree / gate lines are findings for the brief (a branch you did not
   expect, a dirty tree, `NOT ready`, warnings about another session's file). Report them; do not
   tidy anyone's work.
5. For the item you take (or the user's request): its `PLAN-NNN` in `docs/plan/` if one exists;
   every `ADR-NNN` in `docs/decisions/` for the areas involved (settled — a change needs a
   superseding ADR); the `ANA-NNN` in `docs/analysis/` for facts you would otherwise re-research;
   `grep -rn <file-or-keyword> docs/sessions/`. A directory's own `CLAUDE.md` loads when you read
   files there.
6. Once: `bun run session -- --new <slug>` (slug = the work ahead, kebab-case); set the title and
   `Goal` in the file it names.
7. Post the brief — this template, every line present, under ~1,500 characters:

   ```text
   Released: vX.Y.Z (date, sha)
   Unreleased on main: …
   Parked: <branch> — <what, verified or not>
   Findings: <branch/tree/gate observations, or "clean">
   Open / unverified: …
   Next: <item> — first step: …
   Session file: docs/sessions/SES-NNN-<slug>.md
   read in full: <every file from steps 1–3 and 5>
   ```

**Done when** the brief is posted in that shape and the session file exists with its Goal set. If
the user asked a question rather than for work, answer it from what you read, and still create the
session file before any change.

## record

Right after every commit — the entry is cheapest while the change is in front of you, and the next
conversation's `start` depends on it.

```text
Record progress:
- [ ] 1 bun run session (--session yours) appended the skeleton(s)
- [ ] 2 every placeholder filled; Notes say what was verified and how
- [ ] 3 everything the change made stale updated, citing the sha
- [ ] 4 Narrative updated
- [ ] 5 gate green (bare command, exit read), then named-file stage + docs(session) commit
```

1. `bun run session -- --session SES-NNN` appends one skeleton per commit not yet in the log
   (`Summary` / `Why` placeholders, one line per touched file with its +/− counts);
   `bun run session -- --current --session SES-NNN` lists every placeholder with its line number. A skeleton for
   a commit you did not make is a finding: fill what `git show <sha>` supports, say in its Notes
   that it was not verified, or ask.
2. Fill every placeholder. `Summary` = what the change does as a whole; `Why` = the problem or
   request (name who asked when it was Peter); per file, a phrase that says what changed *in that
   file*; `Notes` = what was verified and how, what is unverified, a follow-up, a decision made on
   the spot. A per-file line, Input → Output:

   ```text
   Input:  - `src/items/finder/assets/set-favorites.swift` (+19/−0) — _(fill in)_
   Output: - `src/items/finder/assets/set-favorites.swift` (+19/−0) — re-synced with the embedded
             SET_FAVORITES_SWIFT constant: gains the `--list` mode and the
             LSSharedFileListItemCopyResolvedURL binding (verified byte-identical by the driver)
   ```

   "updated" or "changes" is not a phrase. Verify the change's claim yourself (its driver, a test,
   a byte comparison) before writing it down.
3. In this same step, citing the entry's sha: OVERVIEW **Status** / **Next up**; a decision → a
   new ADR (`documentation-and-adrs` if installed, else the template in `docs/decisions/README.md`);
   a changed requirement or default → `docs/plan/PRD-001-envsetup.md`; a plan's status line; a
   finding → an analysis; a new or sharpened term → `CONTEXT.md` (`domain-modeling` if installed);
   a directory convention → that directory's `CLAUDE.md`; any doc that now states something the
   commit made false (grep for the old claim); the README index for any new doc.
4. Add to the current session's Narrative what the entry cannot hold: the request, a dead end, a
   false lead, a verification.
5. Gate and commit — three commands, in this order, each on its own:

   ```bash
   bun run session -- --check --session SES-NNN          # must print: session: complete
   git add docs/sessions/SES-NNN-<slug>.md docs/sessions/README.md <other docs you touched>
   git commit -m "docs(session): <what the entry records>"
   ```

   `NOT ready` names what is missing or unfilled (`bun run session -- --current --session SES-NNN`
   lists each placeholder with its line number): fill it, run the gate again, and only then stage.

**Done when** the gate printed `session: complete` for your session, the `docs(session)` commit
exists, no placeholder is left in your file, and every stale doc is updated or named in `Open at
end`.

## end

At the end of a conversation or before a long pause: the check that nothing slipped.

```text
End progress:
- [ ] 1 log complete for your session (append → up to date; check → complete)
- [ ] 2 Outcome, Open at end, Narrative written as things actually ended
- [ ] 3 OVERVIEW Status / Next up match reality; top of Next up = first thing next time
- [ ] 4 tree clean on main, or every exception named
- [ ] 5 closing note posted
```

1. `bun run session -- --session SES-NNN` (expect `up to date`), then the gate (expect
   `complete`).
2. In your session file: `Outcome` and `Open at end` describe how the conversation actually
   ended; the Narrative is whole; every entry's `Notes` names what was verified and what was not.
3. OVERVIEW Status (released / unreleased on `main` / parked with branch names) and Next up match
   reality and cite the shas; the top of Next up is the first thing the next conversation should
   do.
4. The tree:

   ```bash
   git status --short             # nothing uncommitted; WIP lives on a named branch cited in Status
   git branch --show-current      # main, after the last PR merged
   gh pr list --state open        # none dangling, or each named in Open at end (skip if origin is not GitHub; say so)
   ```

5. Post the closing note — this template, at most ~60 words:

   ```text
   Shipped: <what landed this conversation — PRs/commits, one line>
   Next time: <the first thing to do, one line>
   ```

**Done when** the gate is green for your session, the tree is clean on `main` (or every exception
is named in `Open at end` and in Status), and the closing note is posted in that shape.
