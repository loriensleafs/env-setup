# 2026-08-30 18:00 · Docs for rehydration — OVERVIEW, ledger → granular entries → sessions, continuous upkeep

- Goal: Make a fresh session able to pick up exactly where the last one stopped: a handoff overview, a complete record of what was done (with files), and a discipline that keeps it all current.
- Outcome: OVERVIEW.md; a git-derived change record that evolved (one line per commit → files touched → Summary/Why + a note per file → per-session files under `docs/sessions/`); `bun run session` tooling with `--check`; CLAUDE.md rehydration reading order; continuous-upkeep hard rule; PLAN.md status current.
- Open at end: Docs restructure (PRD / DECISIONS / research; retire PLAN.md + CONFIG-COMPAT-PLAN.md) — OVERVIEW Next-up 2. Then Next-up 1 (visual grouping).

## Narrative

At 99% context Peter asked for docs first ("don't do visual grouping first… do the second thing"):
an overview/PRD-style handoff (`bb46dcb`), then "the overview should include all the stuff we've
done almost like a ledger… continuously updated as we work" (`7439bec`). Each iteration was his
correction of the previous: the one-line ledger "is not complete enough" → files per change,
template, read/maintain rules, startup pointers in CLAUDE.md/README (`ee5e336`); "how agents
should digest the docs", "files aren't always going to be TS files", "for each file a line with a
note" → Summary/Why + per-file notes, `--check`, CLAUDE.md reading order (`f772638`, `f29ec58`);
"the AI agent should never defer or put off keeping these things up to date" → hard rule, PLAN.md
status brought current with sha citations (`62dbf83`); then "should the ledger be called session…
multiple sessions" → this layout: one file per work session, index auto-generated, entries appended
to the current session (see this session's later entries). History was split by day (and today at
the v0.1.9 tag) because git has no session notion; from here on, one file per conversation
(`bun run session -- --new <slug>` at session start).

Also this session: the visual-grouping patch was found applied but uncommitted in the working tree
and parked on local branch `wip/visual-grouping`; PRs #13–#16 merged with merge commits (the shas
in these entries depend on that — never squash).

## Changes (one entry per commit, in order)

### 2026-08-30 · docs: OVERVIEW.md — project map, status, and handoff for new sessions · bb46dcb

- Summary: First handoff doc: project map, doc table, hard rules, architecture, hard-won empirical facts, status, next-up designs.
- Why: Peter asked (2026-08-30, at 99% context) for an overview/PRD-style doc pointing to the other docs so a fresh session can resume without re-deriving the project.
- Files:
  - `CLAUDE.md` (+2/−1) — "Start here: docs/OVERVIEW.md" pointer
  - `docs/OVERVIEW.md` (+130/−0) — new — the whole handoff, incl. the visual-grouping design and curl|sh / PTY facts

### 2026-08-30 · docs: add LEDGER.md and the update discipline; record docs-restructure plan · 7439bec

- Summary: First ledger (one line per commit from git log) plus the discipline to keep it; the PRD/DECISIONS/LEDGER/research restructure recorded as a plan.
- Why: Peter asked for a continuously updated ledger of everything done, and whether PLAN.md / CONFIG-COMPAT-PLAN.md should be reworked into a PRD.
- Files:
  - `CLAUDE.md` (+2/−1) — pointer to the ledger
  - `CONTRIBUTING.md` (+9/−1) — "Record it" step with a git-log regeneration command
  - `docs/LEDGER.md` (+115/−0) — new — seeded from git history under "Since vX" headings
  - `docs/OVERVIEW.md` (+13/−3) — doc-map row; Next-up 2 = docs restructure that retires PLAN.md

### 2026-08-30 · docs: ledger with files touched + bun run ledger; startup pointers for agents · ee5e336

- Summary: Ledger becomes a rehydration mechanism: generated entries with files touched, read/maintain instructions, entry template; agents pointed at OVERVIEW → LEDGER on startup.
- Why: Peter: the one-line ledger was not complete enough to rehydrate a session — needs a template, maintenance rules, how to read it against OVERVIEW, files per change, and startup pointers in CLAUDE.md/README.
- Files:
  - `CLAUDE.md` (+14/−4) — "Session start / session end" checklist replaces the start-here paragraph; `bun run ledger` in commands
  - `CONTRIBUTING.md` (+8/−9) — intro points at OVERVIEW/LEDGER; step 5 uses `bun run ledger`
  - `README.md` (+5/−3) — "Working on it" pointer to OVERVIEW → LEDGER
  - `docs/LEDGER.md` (+335/−79) — header rewritten (read / maintain / template); body regenerated with files per commit
  - `docs/OVERVIEW.md` (+14/−2) — Status references the unreleased ledger section; Next-up 1 points at `wip/visual-grouping`; resume checklist
  - `package.json` (+1/−0) — `ledger` script
  - `scripts/ledger.ts` (+92/−0) — new — append-only generator, skips docs(ledger) commits, escapes `_` in subjects
- Notes: The visual-grouping patch found uncommitted in the working tree was parked on local branch `wip/visual-grouping`, unverified.

### 2026-08-30 · docs: granular ledger — Summary, Why, and a note per touched file; rehydration procedure in CLAUDE.md · f772638

- Summary: Ledger entries become granular — Summary, Why, and a note per touched file — and CLAUDE.md gains the reading order for digesting the docs at session start.
- Why: Peter: CLAUDE.md should tell agents how to digest the docs (incl. the ledger) to rehydrate; the template must make clear Files means any file (docs, config, …); each file should get its own line with a note.
- Files:
  - `CLAUDE.md` (+40/−21) — "Rehydrating — how to digest the docs" (ordered reading procedure, what to extract from each doc, PLAN vs ledger precedence) and "Recording" with the full template inline; `--check` in commands
  - `docs/LEDGER.md` (+575/−96) — template + rules for granular entries; "Files means every file"; body regenerated with +/− per file; the three earlier unreleased entries filled in fully
  - `scripts/ledger.ts` (+75/−28) — numstat-based per-file lines with placeholders, Summary/Why placeholders, `--check` mode (missing entries or unfilled entry lines fail)
- Notes: History (up to 2026-08-30) keeps only file lists with counts — no Summary/Why/notes; they can't be backfilled honestly. `--check` counts placeholders only on entry lines because the header prose names the placeholder.

### 2026-08-30 · docs: CONTRIBUTING step and OVERVIEW doc-map match the granular ledger · f29ec58

- Summary: CONTRIBUTING step 5 and the OVERVIEW doc-map row describe the granular ledger and `--check`.
- Why: Same request as f772638; these two patches missed in that commit because the formatter had rewrapped the anchor text.
- Files:
  - `CONTRIBUTING.md` (+6/−4) — step 5 "Record it": skeleton per commit, every file kind, `bun run ledger -- --check`
  - `docs/OVERVIEW.md` (+4/−3) — doc-map row for LEDGER.md (Summary/Why/per-file, `--check`); resume step 3 mentions the placeholders and `--check`

### 2026-08-30 · docs: continuous upkeep is a hard rule; PLAN status current; OVERVIEW/PLAN cite ledger entries · 62dbf83

- Summary: Continuous doc upkeep becomes a hard rule; PLAN.md's status block is current again and cites ledger entries; OVERVIEW Status cites entries by sha.
- Why: Peter: OVERVIEW, PLAN and the ledger must be kept up to date constantly — the agent must never defer it — and OVERVIEW/PLAN should reference specific ledger entries.
- Files:
  - `CLAUDE.md` (+9/−4) — hard rule "Docs are kept current continuously — never deferred"; Recording section is "continuously, as you go" (after every commit) and asks for sha citations
  - `docs/LEDGER.md` (+3/−2) — "Continuously, after every commit" replaces "before merge"; OVERVIEW/PLAN updated in the same step with the sha
  - `docs/OVERVIEW.md` (+6/−2) — Status block carries the never-defer note and cites unreleased entries by sha
  - `docs/PLAN.md` (+20/−2) — new CURRENT STATUS (2026-08-31) with ledger refs and the decisions settled since; the 2026-08-26 block demoted to a snapshot; purpose banner says update in the same commit
