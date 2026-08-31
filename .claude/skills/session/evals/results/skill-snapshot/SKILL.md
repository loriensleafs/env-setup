---
name: session
argument-hint: "start | record | end"
description: "Runs the envsetup session ritual and produces its artifacts: `/session start` reads the docs system in full (OVERVIEW, the newest SES, CONTEXT.md, the area's ADRs/analyses/plan), checks the tree against the session log, creates this conversation's docs/sessions/SES-NNN file and posts a brief; `/session record` after every commit appends and fills the commit's entry, updates OVERVIEW/ADR/PRD/CONTEXT.md where the change made them stale, and commits it as docs(session); `/session end` verifies the log is complete, Status is current and the tree is clean. Use at the start of a conversation in this repo, right after each commit, and before finishing. Not for authoring the docs themselves (an ADR, the PRD, an analysis, the glossary — those have their own skills), not for driving the CLI (the run skills), and not for running, changing or testing the session tool itself (`scripts/session.ts`: the run-scripts skill; questions about it: docs/sessions/README.md)."
---

# Session — start, record, end

Work on envsetup happens across many conversations, each starting from nothing but the repo. The
docs system (ADR-017) carries continuity — OVERVIEW says where the project is, `docs/sessions/`
says what was done and why, `CONTEXT.md` says which words to use — but only if every conversation
reads it at the start and writes to it as it goes. This skill is that ritual as a procedure with
checkable ends. `$ARGUMENTS` names the branch: `start`, `record` or `end`. With no argument, infer
it: no session file created in this conversation yet → `start`; a commit just landed → `record`;
the user is wrapping up → `end`.

All paths are relative to the repo root; shells need `export PATH="$HOME/.bun/bin:$PATH"`.

## Gotchas

Things the tool and the repo will not tell you:

- **No sampling.** A file a step names is read in full, to its last line. The Read tool truncates
  long files; continue with `offset` until the end before drawing a conclusion. "Skim the map"
  never means reading part of it — it means reading all of OVERVIEW and holding three sections in
  mind. A file you did not finish is a file you did not read.
- **The session tool appends to the highest-numbered `SES-NNN` file, whoever created it.** Another
  conversation may share this checkout (it happened: a stray `SES-005` was swept into a commit).
  Before `record`, confirm the newest file's H1 and Goal are this conversation's; if not, move the
  appended entry to yours and stage only your own files — never `git add -A` here.
- **`bun run session -- --check` is the gate; keep its exit status.** Piping it through `tail` or
  `grep` hides a failure and a PR then merges with an unfilled entry (it happened twice). Run it
  bare, read its exit, and only then stage and commit — small separate commands, never one chain.
- **`docs(session): …` commits are skipped by the tool** by design — that commit never needs its
  own entry, which is what stops the ritual from chasing its own tail.
- **`--new` is once per conversation.** A second `--new` creates a second session for the same
  work; if a file already exists for this conversation, keep using it.
- **A release tag adds a marker.** After `git tag vX.Y.Z`, one more `bun run session` lands the
  `> **Released vX.Y.Z**` line under the tagged commit's entry.

## start

The reading order below is deliberate: the map first, then what happened last, then the words, and
only then the area — each step is cheaper to place once the earlier ones are in mind.

1. **Orient** — `docs/OVERVIEW.md`, all of it; hold **Status**, **Next up** and **Key empirical
   facts**.
2. **What happened last** — `docs/sessions/README.md` (the index), then the newest `SES-NNN` in
   full: Goal / Outcome / Open at end, Narrative, every Change entry. Then earlier sessions back to
   the last `> **Released vX.Y.Z**` marker. What you are collecting: what is on `main` but
   unreleased, what is parked (branches named in Status), what was tried and abandoned, what was
   verified and how.
3. **The words** — `CONTEXT.md`. Use its terms from here on, in code labels, prompts, commits, docs.
4. **Trust but verify** — the tree must match the log:

   ```bash
   git pull --ff-only             # main first; a branch you did not expect is a finding
   git status --short            # expect clean
   git log --oneline -5           # the newest entries cite these shas
   bun run session -- --check     # expect: session: complete
   ```

   A dirty tree, a branch you did not expect, or `NOT ready` is a finding for the brief. Report it;
   do not tidy someone else's work.
5. **The area you will touch** — for the Next-up item you take, or the user's request: its
   `PLAN-NNN` in `docs/plan/` if one exists; every `ADR-NNN` in `docs/decisions/` for the areas
   involved (settled — a change needs a superseding ADR); the `ANA-NNN` in `docs/analysis/` for
   facts you would otherwise re-research; `grep -rn <file-or-keyword> docs/sessions/` for prior
   changes. The directory's own `CLAUDE.md` loads when you read files there.
6. **Start this conversation's session file** (once):

   ```bash
   bun run session -- --new <slug>   # slug = the work ahead, kebab-case
   ```

   Set its title and `Goal` immediately, in the file the command names.

**Done when** you have posted a brief of at most ~12 lines: released version; what is on `main` but
unreleased; what is parked and where; open questions or unverified items from the newest session;
the item you propose to take (or the user's request restated in CONTEXT.md's words) and its first
step; the line `read in full: …` naming every file from steps 1–3 and 5 — **and** the session file
exists with its Goal set. If the user asked a question rather than for work, answer it from what
you read, and still create the session file before any change.

## record

Run right after every commit — not at the end of the PR, never "later". The entry is cheapest to
write while the change is in front of you, and the next conversation's `start` depends on it.

1. **Append and fill**:

   ```bash
   bun run session                   # appends a skeleton per commit not yet in the log
   ```

   In the skeleton: `Summary` (what the change does as a whole), `Why` (the problem or request;
   name who asked when it was Peter), and for **every** listed file — whatever kind — a short
   phrase of what changed in it. Add `Notes` for what a future reader must know: what was verified
   and how, what is unverified, a follow-up, a decision made on the spot. The template and the
   field meanings are in `docs/sessions/README.md`.
2. **Everything the change made stale, in this same step**, citing the entry's sha: OVERVIEW
   "Status" / "Next up"; a decision → a new ADR (the `documentation-and-adrs` skill if installed, else the template in `docs/decisions/README.md`); a changed
   requirement or default → `docs/plan/PRD-001-envsetup.md`; a plan's status line; a finding → an
   analysis; a new or sharpened term → `CONTEXT.md` (the `domain-modeling` skill if installed, else its own format); a directory convention →
   that directory's `CLAUDE.md`; the directory README index for any new doc.
3. **Narrative** — add to the current session's Narrative what happened around this commit that
   the entry cannot hold: the request, a dead end, a false lead, a verification.
4. **Gate and commit**:

   ```bash
   bun run session -- --check                                   # must print: session: complete
   git add docs/sessions/<your SES file>.md <other docs you touched>   # named files only
   git commit -m "docs(session): <what the entry records>"
   ```

**Done when** `bun run session -- --check` printed `session: complete` and the `docs(session)`
commit exists (or the entry rode in the same PR's next commit) — with no placeholder left and
every stale doc updated or explicitly deferred in `Open at end`.

## end

Run at the end of a conversation or before a long pause. Recording is continuous; this is the
check that nothing slipped.

1. **Log complete** — `bun run session` (expect `up to date`) then `bun run session -- --check`
   (expect `complete`). In the current session file: `Outcome` and `Open at end` describe how the
   conversation actually ended; the Narrative is whole; every entry's `Notes` names what was
   verified and what was not.
2. **OVERVIEW current** — Status (released / unreleased on `main` / parked with branch names) and
   Next up match reality and cite the shas. The top of Next up is the first thing the next
   conversation should do; if that changed, change it.
3. **Tree matches the log**:

   ```bash
   git status --short             # nothing uncommitted; WIP lives on a named branch cited in Status
   git branch --show-current      # main, after the last PR merged
   gh pr list --state open        # none dangling, or each named in Open at end
   ```

**Done when** `session: complete`, a clean tree on `main` (or every exception named in `Open at
end` and in Status), and a two-line note to the user: what shipped in this conversation, and the
first thing to do next time.
