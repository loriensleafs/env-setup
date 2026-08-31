# Plan: nested CLAUDE.md files — where they pay off, and what they say

> Status: done — merged 2026-08-30 (SES-004; ADR-018) · Peter, 2026-08-30 ("evaluate all the nested `.claude` dirs and figure out where
> a nested CLAUDE.md would make more sense, and write it") · session SES-004

## Overview

The root `CLAUDE.md` is always loaded. Nearly every directory now has a `.claude/skills/run-*/`
skill (PLAN/SES-004, `ba38081`). A nested `CLAUDE.md` is a different instrument: directory-scoped
guidance that Claude Code pulls in only when it works in that directory. Decide, per directory,
whether such a file earns its context load — and write the ones that do, per the
`writing-for-agents` rules (cache only what the agent cannot find by looking; pointers with
branches; positive phrasing; single source of truth; no restating the root).

## Decisions it relies on

- ADR-017 (docs system; continuous upkeep). New: **ADR-018 — nested CLAUDE.md placement criteria**
  (write it in this PR; alternatives: one in every directory / none / criteria-based).
- Root CLAUDE.md stays the single home of the hard rules; nested files never repeat them.

## Criteria (a nested CLAUDE.md is written only when at least one holds)

1. **Unwritten convention** an agent editing there must follow that the code does not confess
   (e.g. every item's `detect()` must be drift-aware; every prompt takes `input: promptInput()`).
2. **Gotcha that bit us** and is specific to that directory (empirical facts).
3. **Branching pointer**: the directory has its own run skill / ADRs / analyses / templates and an
   agent needs to know which to reach for which task.
4. **Blast radius**: edits there mutate the user's machine or ship to it, so a safety frame is
   needed before the first edit.

Not sufficient on its own: "the directory exists", "it has a run skill" (the skill is discovered
by itself), "it has tests" (the convention is in the root).

## Task list

### Phase 1: research

- [x] T1 Confirm nested-CLAUDE.md load semantics from the official docs (claude-code-guide agent).
- [x] T2 Read the `writing-for-agents` skill; extract the rules above.

### Phase 2: inventory

- [x] T3 For every directory with a `.claude/` (56), list candidate content against the criteria
  (two forks: src core + src/items/**; docs/.github/scripts/vendor). Output: a scored table.
- [x] T4 Propose (Peter: option one + docs subdirectories + prune skills that don't earn their command) the placement set to Peter — one question, recommendation first.

### Checkpoint: placement agreed

### Phase 3: write

- [x] T5a Prune run skills without a real driver (20 `__tests__`, 5 docs subdirs, `.github/workflows`, 2 Swift-asset skills → typecheck folded into the parent drivers); 28 remain.

- [x] T5 Write each nested CLAUDE.md (short; steps/reference split; pointers to the dir's run
  skill, ADR, ANA, README templates; no duplication of the root or of each other).
- [x] T6 Root CLAUDE.md: one pointer line naming that nested files exist and what they cover.
- [x] T7 Verify: `bun run check` (markdownlint), the docs link checker over the new files, and a
  duplication pass (no sentence appears in two CLAUDE.md files).

### Phase 4: record and ship

- [x] T8 ADR-018; OVERVIEW doc-map row; session entry; this plan's status → done.
- [x] T9 PR → CI → merge (docs only, no release).

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Nested files restate the root (sediment, double context load) | Med | duplication pass in T7; criteria 1–4 gate every line |
| Load semantics differ from assumption (e.g. not lazy) | Med | T1 before writing; ADR-018 records the cited behaviour |
| Too many files → cognitive load on Peter | Low | placement question T4; expect ~10–15, not 56 |

## Open questions

- Resolved: `AGENTS.md` is not read by Claude Code at all; the root symlink stays for other agents, no per-directory copies (ADR-018).
- `**/.claude/skills/**` matching dot-directories is unverified in the docs (ADR-018 consequence).
