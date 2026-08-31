---
name: session
argument-hint: "start | entry | end | close"
arguments: [mode]
allowed-tools: Bash(git status:*) Bash(git branch:*) Bash(git show:*) Bash(gh pr list:*) Bash(bun run session:*)
description: "Runs the envsetup session ritual and produces its artifacts: `/session start` reads the docs system in full (OVERVIEW, open sessions, CONTEXT.md, the area's ADRs/plan), joins the open docs/sessions/SES-NNN this work belongs to or opens one for it, and posts a brief; `/session entry` after every commit appends and fills the commit's entry, updates OVERVIEW/ADR/PRD/CONTEXT.md where the change made them stale, and commits it as docs(session); `/session end` leaves the session open with the log complete and a handoff written; `/session close` closes a session whose Goal is done and updates the plan it served. Use at the start of a conversation in this repo, right after each commit, and before finishing. Not for authoring the docs themselves (an ADR, the PRD, an analysis, the glossary — their own skills), not for driving the CLI (the run skills), and not for changing or testing the session tool (`scripts/session.ts` in this skill: the run-session-tool skill; questions about it: docs/sessions/README.md)."
---

# Session — start, entry, end, close

Every conversation here starts from nothing but the repo; the docs system (ADR-017) is the
continuity, and only if each conversation reads it at the start and writes to it as it goes. A
**session** is a stream of work toward one Goal, open until closed, and may outlive many
conversations (ADR-020); a conversation joins one or opens one before its first commit, and a
conversation that changes nothing needs none.

Mode: **$mode** (`start`, `entry`, `end` or `close`; when empty, infer: no session joined or
opened in this conversation → `start`; a commit just landed → `entry`; the user is wrapping up
and the Goal is not done → `end`; the Goal is done → `close`). The user-only aliases
`/session-start`, `/session-entry`, `/session-end`, `/session-close` invoke the same modes.

Live state at invocation (injected; do not re-run these to "confirm"):

- Branch: !`git branch --show-current`
- Tree: !`git status --short | head -20 || true`
- Sessions: !`PATH="$HOME/.bun/bin:$PATH" bun run --silent session list 2>&1 | grep -v '^ ' || true`

Paths are relative to the repo root; a shell you open needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Gotchas

- **The three lines above arrive as output on every path** — a typed `/session …`, a `/session-*`
  alias, the model's own invocation (verified 2026-08-30 through the transcripts of both). A marker
  is recognised only at line start or after a space; wrapped in a code span it is inert, which is
  why an earlier version of this skill never rendered. If the lines ever show markers instead of
  output, run those three commands once yourself and treat their output as the injected state.
  (This bullet spells no marker: the harness runs any it finds in the body, and a failed one
  aborts the whole invocation.)
- **No sampling.** Every file a step names is read to its last line; when the Read tool truncates,
  continue with `offset`. A file you did not finish is a file you did not read.
- **Your session is the one you joined or opened, never "the newest".** Another conversation may
  share this checkout with its own open session (a stray `SES-005` once got swept into a commit),
  so every `bun run session`, `check` and `close` in this conversation takes
  `--session SES-NNN`; with two sessions open the tool refuses to guess. Placeholders in any other
  session are that conversation's: the gate reports them as warnings, and you leave that file
  untouched.
- **The gate's exit status is the gate.** Run `bun run session check --session SES-NNN`
  bare and read its exit; pipe it through nothing (a `| tail` once hid a failure and a PR merged
  with an unfilled entry). Stage by named file; `git add -A` is how the stray file got swept in.
- **`docs(session): …` commits are skipped by the tool** — the entry-writing commit never needs an
  entry of its own.
- **The gate counts entries, the Goal and the Narrative; `Outcome` and `Open at end` are
  counted only by `close`.** An open session carries those two as placeholders until it closes
  or a conversation leaves; do not invent an Outcome for a stream that just began.
- **`new` opens a session for a stream of work, not for a conversation.** A conversation
  continuing that work joins with `--session`.
- **A release marker lands only when the release commit's entry is appended.** Tag first, then
  `bun run session append --session SES-NNN`; if the release entry already exists, add
  `> **Released vX.Y.Z** — tag on this commit.` under it by hand.

## start

```text
Start progress:
- [ ] 1 OVERVIEW read to the end
- [ ] 2 sessions index + every open SES read to the end (+ earlier ones back to the last release marker)
- [ ] 3 CONTEXT.md read to the end
- [ ] 4 injected state above read as findings (branch, tree, sessions)
- [ ] 5 the area's PLAN / ADRs / ANAs read
- [ ] 6 session joined, opened (Goal set), or "none" stated
- [ ] 7 brief posted in the template
```

1. `docs/OVERVIEW.md` — all of it; hold **Status**, **Next up**, **Key empirical facts**.
2. `docs/sessions/README.md` (the index, which shows each session's status), then every **open**
   `SES-NNN` in full (Goal / Outcome / Open at end, Narrative, every entry), then earlier sessions
   back to the last `> **Released vX.Y.Z**` marker. Collect: unreleased on `main`, parked branches
   (Status names them), what was tried and abandoned, what was verified and how.
3. `CONTEXT.md` — its words from here on, in code labels, prompts, commits, docs.
4. The injected branch / tree / sessions lines are findings for the brief (a branch you did not
   expect, a dirty tree, a second open session, warnings about another session's file). Report
   them; do not tidy anyone's work.
5. For the item you take (or the user's request): its `PLAN-NNN` in `docs/plan/` if one exists;
   every `ADR-NNN` in `docs/decisions/` for the areas involved (settled — a change needs a
   superseding ADR); the `ANA-NNN` in `docs/analysis/` for facts you would otherwise re-research;
   `grep -rn <file-or-keyword> docs/sessions/`. A directory's own `CLAUDE.md` loads when you read
   files there.
6. The session, one of three outcomes:
   - **join** — this conversation will record entries into an open session whose Goal is the
     work it is about to do (a second conversation on the same plan part): use
     `--session SES-NNN` from here on and say so in the brief. A session another conversation
     owns — its placeholders unfilled, its Outcome not yours to write — is never joined, whatever
     its title says; and a question that changes nothing is `none`, not a join;
   - **open** — the work is new: `bun run session new <slug> [--plan "PLAN-NNN · <part>"]`
     (slug = the work ahead, kebab-case), then set the title and `Goal` in the file it names;
   - **none** — the user asked a question, a review, a check, and nothing will change: say so;
     the moment the work turns into a change, run this step alone (the reading is done) before
     the first commit.
7. Post the brief — this template and nothing after it, every line present, the whole reply under
   ~1,200 characters (one clause per line; the session file and the Narrative hold the detail):

   ```text
   Released: vX.Y.Z (date, sha)
   Unreleased on main: …
   Parked: <branch> — <what, verified or not>
   Findings: <branch/tree/sessions observations, or "clean">
   Open / unverified: …
   Next: <item> — first step: …
   Question: <at most one, or omit the line>
   Session: SES-NNN <joined | opened> — <its Goal> | none — nothing to record yet
   read in full: <every file from steps 1–3 and 5>
   ```

**Done when** the brief is posted in that shape and the session is joined, opened with its Goal
set, or stated as none. If the user asked a question rather than for work, answer it from what you
read; open a session before the first change, not before the answer.

## entry

Right after every commit — the entry is cheapest while the change is in front of you, and the next
conversation's `start` depends on it.

```text
Entry progress:
- [ ] 1 bun run session (--session yours) appended the skeleton(s)
- [ ] 2 every placeholder filled; Notes say what was verified and how
- [ ] 3 everything the change made stale updated, citing the sha
- [ ] 4 Narrative updated
- [ ] 5 gate green (bare command, exit read), then named-file stage + docs(session) commit
```

1. `bun run session append --session SES-NNN` appends one skeleton per commit not yet accounted
   for (`Summary` / `Why` placeholders, one line per touched file with its +/− counts;
   `current --session SES-NNN` lists them by line). A skeleton for a commit you did not make is
   a finding: fill what `git show <sha>` supports, say in its Notes that it was not verified, or
   ask. **The session log holds value only** (ADR-021): a skeleton for a fix-up of an earlier commit
   is deleted, and that earlier entry gets `- Also: <sha> — <what it fixed>` under its `Why`; a
   commit with nothing to record should have carried the trailer `Session-entry: none` when it
   was made (the tool then appends nothing) — write that trailer yourself on such commits.
2. Fill every placeholder. `Summary` = what the change does as a whole; `Why` = the problem or
   request (name who asked when it was Peter); per file, a phrase that says what changed *in that
   file*; `Notes` = what was verified and how, what is unverified, a follow-up, a decision made on
   the spot. A per-file line, Input → Output:

   ```text
   Input:  - `src/items/finder/assets/set-favorites.swift` (+19/−0) — _(fill in)_
   Output: - `src/items/finder/assets/set-favorites.swift` (+19/−0) — re-synced with the embedded
             SET_FAVORITES_SWIFT constant: gains the `list` mode and the
             LSSharedFileListItemCopyResolvedURL binding (verified byte-identical by the driver)
   ```

   "updated" or "changes" is not a phrase. Verify the change's claim yourself (its driver, a test,
   a byte comparison) before writing it down.
3. In this same step, citing the entry's sha: OVERVIEW **Status** / **Next up**; a decision → a
   new ADR (`documentation-and-adrs` if installed, else the template in `docs/decisions/README.md`);
   a changed requirement or default → `docs/plan/PRD-001-envsetup.md`; the plan this session
   serves → tick its task citing the sha; a finding → an analysis; a new or sharpened term →
   `CONTEXT.md` (`domain-modeling` if installed); a directory convention → that directory's
   `CLAUDE.md`; any doc that now states something the commit made false (grep for the old claim);
   the README index for any new doc.
4. Add to your session's Narrative what the entry cannot hold: the request, a dead end, a false
   lead, a verification.
5. Gate and commit — three commands, in this order, each on its own:

   ```bash
   bun run session check --session SES-NNN          # prints: session: complete (SES-NNN, open)
   git add docs/sessions/SES-NNN-<slug>.md docs/sessions/README.md <other docs you touched>
   git commit -m "docs(session): <what the entry records>"
   ```

   `NOT ready` names what is missing or unfilled (`bun run session current --session SES-NNN`
   lists each placeholder with its line number): fill it, run the gate again, and only then stage.

**Done when** the gate printed `session: complete` for your session, the `docs(session)` commit
exists, no placeholder is left in your file, and every stale doc is updated or named in `Open at
end`.

## end

Leaving: the conversation stops, the session stays open for the next one. The check that nothing
slipped, and the handoff.

```text
End progress:
- [ ] 1 log complete for your session (append → up to date; check → complete)
- [ ] 2 Open at end = the handoff: what to pick up first, what is unverified; Narrative whole
- [ ] 3 OVERVIEW Status / Next up match reality; top of Next up = first thing next time
- [ ] 4 handoff committed: docs(session): handoff SES-NNN
- [ ] 5 tree clean on main, or every exception named
- [ ] 6 closing note posted
```

1. `bun run session append --session SES-NNN` (expect `up to date`), then the gate (expect
   `session: complete (SES-NNN, open)`).
2. In your session file: `Open at end` says what the next conversation picks up first and what is
   unverified; the Narrative is whole; every entry's `Notes` names what was verified and what was
   not. `Outcome` stays its placeholder — it is written at `close`.
3. OVERVIEW Status (released / unreleased on `main` / parked with branch names) and Next up match
   reality and cite the shas; the top of Next up is the first thing the next conversation should
   do.
4. Stage by name and commit: `git add docs/sessions/SES-NNN-<slug>.md docs/sessions/README.md
   docs/OVERVIEW.md` → `git commit -m "docs(session): handoff SES-NNN"`.
5. The tree:

   ```bash
   git status --short             # nothing uncommitted; WIP lives on a named branch cited in Status
   git branch --show-current      # main, after the last PR merged
   gh pr list --state open        # none dangling, or each named in Open at end (skip if origin is not GitHub; say so)
   ```

6. Post the closing note — this template, at most ~60 words:

   ```text
   Shipped: <what landed this conversation — PRs/commits, one line>
   Next time: <the first thing to do, one line>  (SES-NNN stays open)
   ```

**Done when** the gate is green for your session, the handoff commit exists, the tree is clean on
`main` (or every exception is named in `Open at end` and in Status), and the closing note is
posted in that shape.

## close

The Goal is done: everything `end` checks, plus the Outcome and the plan, then the status flips.

```text
Close progress:
- [ ] 1 end's steps 1–3 done (log complete, Narrative whole, OVERVIEW current)
- [ ] 2 Outcome written as the stream actually ended; Open at end = what it leaves behind
- [ ] 3 the plan it served updated (status line / ticks citing shas), OVERVIEW Status
- [ ] 4 bun run session close --session SES-NNN printed: session: closed SES-NNN
- [ ] 5 docs(session) commit; tree clean (end step 5); closing note posted
```

1. Run `end` steps 1–3.
2. `Outcome` = what the session delivered (releases, merged PRs, what was verified); `Open at end`
   = what it leaves for a later session, or "nothing".
3. The plan named on the session's `Plan:` line: its status line becomes `done — shipped in
   vX.Y.Z (session SES-NNN)` or its remaining ticks cite the entry shas; OVERVIEW Status names the
   session as closed where it named it as in flight.
4. `bun run session close --session SES-NNN` — it runs the gate first, this time counting
   `Outcome` and `Open at end` too, and refuses while anything is unfilled or unrecorded. It
   prints `session: closed SES-NNN`; a `— still open: …` suffix names other conversations'
   sessions, not a problem. Then stage by name and commit `docs(session): close SES-NNN`, and run
   `end` step 5 (the tree).
5. Post the closing note as in `end`, with `(SES-NNN closed)` on the second line.

**Done when** the tool printed `session: closed SES-NNN`, the `docs(session)` commit exists, the
tree is clean, and the plan and OVERVIEW say the same thing as the session's Outcome.
