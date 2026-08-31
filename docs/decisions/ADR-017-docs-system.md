# ADR-017: The docs system — OVERVIEW · sessions · plan · analysis · decisions — kept current continuously

## Status

Accepted

## Date

2026-08-30 (session `SES-004-docs-rehydration.md`; supersedes the single "living plan"
`PLAN.md` + `CONFIG-COMPAT-PLAN.md`)

## Context

Work happens across many agent sessions, each starting from nothing but the repo. A ~1300-line
living plan mixed decisions, requirements, research, history and stale status; a ledger was tried,
then made granular, then split per session. Peter's requirements, in order: a handoff overview;
a continuously updated record of everything done, with the files touched and a note per file;
guidance on how agents digest the docs; per-session files; directories for plans and analyses
with templates; and — above all — **never defer keeping any of it current**.

## Decision

One job per document, each directory with a README holding its rules and template:

| Doc | Job | Produced by |
| --- | --- | --- |
| `docs/OVERVIEW.md` | Map, status, next up, hard rules, key facts — read first | by hand, every change |
| `docs/sessions/` | What was done, session by session: Goal/Outcome/Open, Narrative, per-commit entries with Summary, Why, a note per touched file | `bun run session` (`scripts/session.ts`) + the author |
| `docs/plan/` | What we are building and why (PRD) and how (per-feature implementation plans) | `spec-driven-development`, `planning-and-task-breakdown` skills |
| `docs/analysis/` | What we found out, against primary sources or empirically, cited per claim | `research` skill / spikes |
| `docs/decisions/` | Current truth of every decision with alternatives and consequences (ADRs) | `documentation-and-adrs`, `grill-with-docs` skills |

Rules: docs are updated **in the same step as the change that makes them stale** — session
entries after every commit (`bun run session`, fill placeholders, `-- --check`), OVERVIEW
Status/Next up, the ADR or PRD section touched, citing the session entry (sha). PRs are merged
with **merge commits** so shas stay valid. History is never rewritten; corrections are dated
additions. CLAUDE.md carries the reading order (rehydration) and the recording procedure.

## Alternatives considered

### One living plan (the original)

- Rejected: mixed concerns, stale status, un-navigable.

### Single ledger (one line per commit → granular entries)

- Rejected by Peter in favour of per-session files carrying narrative (what was tried and
  abandoned, verified and how), which a commit log cannot hold.

### Ledger + separate session notes (recommended at the time)

- Rejected by Peter: per-session files only.

## Consequences

- `PLAN.md` retired to `docs/archive/ARC-001-living-plan.md` (read-only history);
  `CONFIG-COMPAT-PLAN.md` absorbed (model → ADR-010, research → analysis).
- New session = `bun run session -- --new <slug>` first; new decision = new ADR in the same PR.
