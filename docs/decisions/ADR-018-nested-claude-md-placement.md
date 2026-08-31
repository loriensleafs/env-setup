# ADR-018: Nested CLAUDE.md files where a directory has unwritten conventions; path rules for file types; run skills only with a real driver

## Status

Accepted

## Date

2026-08-30 (session SES-004; PLAN-002)

## Context

The root `CLAUDE.md` is always loaded (133 lines) and must stay the single home of the hard rules.
After PR #19 nearly every directory had a `.claude/skills/run-*/` skill, and Peter asked where a
nested `CLAUDE.md` would make more sense. Facts from the official docs (code.claude.com/docs/en/memory.md,
large-codebases.md, Claude Code 2.1.251): a `CLAUDE.md` in a subdirectory is loaded **lazily, when
Claude reads files in that subdirectory**, and is **concatenated after** the root, never replacing
it; the guidance is under 200 lines per file and "conventions specific to that area" in nested
files; `AGENTS.md` is not read by Claude Code (only via an `@AGENTS.md` import); `.claude/rules/*.md`
with a `paths:` YAML list (project-root-relative globs, `**` any depth) load when Claude reads a
matching file anywhere (v2.1.198+); a rule without `paths` loads unconditionally. Observed here:
nested skills are discovered the moment a file under their directory is written. Two inventories
scored all 56 directories against four criteria.

## Decision

1. **A nested `CLAUDE.md` is written only where at least one criterion holds**: an unwritten
   convention the code does not confess; a gotcha that bit us there; a branching pointer (which
   driver/ADR/analysis/template for which task); a blast radius that needs framing before the first
   edit. A file at `src/` or `src/items/` covers everything beneath it, so "weak" directories fold
   into their parent's file instead of getting their own.
   Written: `src`, `src/commands`, `src/items`, `src/orchestrator`, `src/ui`, `src/items/chrome`,
   `src/items/claude-code` (with `assets/`), `src/items/defs`, `src/items/finder` (with `assets/`),
   `docs` and each docs subdirectory (a pointer to its README plus its one invariant), `.github`,
   `scripts`. Not written: `exec`, `paths`, `ceremonies`, `quick-actions`, `typora`, `vendor`,
   `.github/workflows`, every `__tests__` (the sibling-tests convention is a root rule).
2. **Cross-cutting facts that belong to a file type, not a directory, are path rules**:
   `.claude/rules/drivers.md` (`**/.claude/skills/**`: safe calls only, not typechecked, every
   SKILL.md block was run) and `.claude/rules/tests.md` (`**/__tests__/**`: temp dirs via the
   `XDG_*` / `ENVSETUP_SECRETS_FILE` overrides, mock `Runner`, substring filter).
3. **A run skill stays only when it has a driver that does something a plain command doesn't.**
   Removed: the 20 `__tests__` skills (`bun test <dir>` in prose), the 5 docs-subdirectory skills
   (the docs checker with an argument), `.github/workflows` (a copy of `.github`), and the two
   Swift-asset skills (their typecheck moved into the parent item's driver). 28 skills remain.
4. Nested files never restate the root or each other (single source of truth); they are written
   per the `writing-for-agents` skill: positive phrasing, pointers that name their trigger, cache
   only what cannot be found by looking.

## Alternatives considered

### A CLAUDE.md in every directory (mirroring the skills)

- Rejected: 33 directories had nothing that the root, the code, or the README did not already say;
  the files would be sediment and double context load.

### No nested files; grow the root

- Rejected: the root is always loaded; directory-specific gotchas would cost every turn.

### Path rules only (no nested files)

- Rejected: most conventions here are per subsystem, which is exactly what nested files are for;
  rules fit the two genuinely file-type-shaped sets.

## Consequences

- The root `CLAUDE.md` names the nested files and rules in one line; nothing else there changes.
- Dot-directory matching for `**/.claude/skills/**` is _unverified_ in the docs; if the drivers rule
  never fires, list `.claude/skills/**` and `src/**/.claude/skills/**` explicitly.
- `AGENTS.md` at the root remains a symlink for other agents; no per-directory `AGENTS.md`.
- Adding a directory-specific convention later: put it in that directory's `CLAUDE.md` (create it
  by the criteria), cite the session; adding a file-type rule: `.claude/rules/<name>.md`.
