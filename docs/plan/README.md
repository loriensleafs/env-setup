# Plan — what we are building and how

Two kinds of document live here:

- **[PRD-001-envsetup.md](PRD-001-envsetup.md)** — the product requirements: what envsetup is, for whom, the promise, the
  UX requirements, the item catalog with its chosen defaults, boundaries, success criteria, open
  questions. The single source for *what* and *why* at product level. One file, kept current.
- **Feature plans** — `<feature>.md`, one per piece of work larger than a small fix: overview,
  the decisions it relies on (link ADRs), the ordered task list with checkpoints, risks, open
  questions, and — when the work is done — a closing status line pointing at the session and
  release that shipped it. Current: [PLAN-001-visual-grouping.md](PLAN-001-visual-grouping.md).

## Index

| Doc | What | Status |
| --- | --- | --- |
| [PRD-001-envsetup.md](PRD-001-envsetup.md) | Product requirements for envsetup | current (v0.1.9) |
| [PLAN-001-visual-grouping.md](PLAN-001-visual-grouping.md) | Visual grouping of the config flow + overall progress tracker | planned; patch parked on `wip/visual-grouping` |

## Rules

- **PRD first, then plan, then tasks, then code** for anything non-trivial (the
  `spec-driven-development` gate). A change to *what* we build updates PRD-001-envsetup.md in the same PR; a
  change to *how* updates the feature plan. Never let either lag the code (CLAUDE.md hard rule).
- **Decisions with alternatives** go to [../decisions/](../decisions/README.md) as ADRs and are
  linked from here — a plan cites decisions, it does not restate them.
- **Facts** come from [../analysis/](../analysis/README.md); a plan cites analyses, it does not
  re-research.
- A finished plan is not deleted: add `Status: done — shipped in vX.Y.Z (session …)` at the top.
- **Produced with** the `spec-driven-development` skill (PRD; surface assumptions first, reframe
  vague asks as success criteria) and the `planning-and-task-breakdown` skill (feature plans:
  dependency graph, vertical slices, tasks with acceptance criteria, checkpoints). Use
  `idea-refine` when the idea is still vague and `grill-me` / `grill-with-docs` to stress-test a
  design before planning it.

## Templates

### PRD section shape (spec-driven-development, adapted)

```markdown
# PRD: envsetup

> Status: current as of vX.Y.Z · YYYY-MM-DD · last change: session entry `<sha>`

## Objective — what, why, for whom; what success looks like
## The promise — the user-visible contract
## Commands — every command with what it does
## UX requirements — the flow, numbered, testable
## Item catalog — what gets installed/configured, grouped, with the chosen defaults
## Tech stack · Project structure · Code style · Testing strategy
## Boundaries — Always / Ask first / Never
## Success criteria — specific, testable
## Non-goals
## Open questions
```

### Feature plan (planning-and-task-breakdown, adapted)

```markdown
# Plan: <feature>

> Status: planned | in progress | done — shipped in vX.Y.Z (session `<file>`) · owner · YYYY-MM-DD

## Overview
One paragraph: what and why (link the PRD requirement).

## Decisions it relies on
- ADR-NNN … (link); new decisions needed → write the ADR first.

## Task list
### Phase 1: …
- [ ] Task 1: <title> — acceptance criteria; verification (`bun test …`, PTY oracle); files
### Checkpoint
- [ ] `bun run check` + `bun test` green; manual check …

## Risks and mitigations
| Risk | Impact | Mitigation |

## Open questions
```
