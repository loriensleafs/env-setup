# ADR-022: Rehydrate by plan — a plan part's status line names the session serving it, and the PRD names its plans

## Status

Accepted

## Date

2026-08-30 (session SES-006)

## Context

ADR-020 made a session a stream of work with a `Plan:` line, and ADR-017's reading order started
from OVERVIEW and the newest sessions. Peter, after reading a real `/session start` transcript:
"If sessions are essentially ledgers for parts of a plan being executed … I'd argue there still
isn't a way for me to start a new conversation and easily rehydrate a context using plans and
sessions … we probably need to update our existing templates for plans so that they point to the
session note that is being used for each different part of a plan … which likely means that PRDs
should reference plan notes as well." The pointer ran one way only — session → plan — so a
conversation told "work on PLAN-003" had to find the session by scanning the index.

## Decision

- **Each plan part carries a status line**, directly under its `### Part N` heading:
  `> Status: planned | in progress (session SES-NNN) | done (session SES-NNN, sha)`. `/session
  start` writes `in progress` when it opens the part's session; `/session close` writes `done`
  with the sha of the entry that finished it. The plan's own top status changes only when every
  part is done, and the plan's task ticks cite the entry sha that did them — progress is read
  from the session entries, never tracked twice.
- **The PRD carries a `## Plans` table** naming every plan that implements it, with the plan's
  status, so PRD → plan → part → session is one walk.
- **`/session start [PLAN-NNN]` reads down that walk**: OVERVIEW, the plan and the PRD it cites,
  every open session serving the plan (`session list --plan PLAN-NNN`), CONTEXT.md, the ADRs the
  plan cites — and joins the session the part names, or opens one and marks the part.
- **One session per part.** A second conversation on the same part joins its session. Unplanned
  work opens a session with `Plan: —` and no part points at it.
- The templates that carry the shape — `docs/plan/README.md` (PRD and plan), the global
  `planning-and-task-breakdown` and `spec-driven-development` skills, `/plan` and `/build`,
  `~/.claude/references/project-docs-conventions.md` — say the same thing; **Plan part** is a
  glossary term in `CONTEXT.md`.

## Alternatives considered

### Keep the pointer one-way and let `start` scan the sessions index for the plan

Works while there are six sessions; fails as the index grows and never answers "which part is in
progress" without opening every open session. Rejected.

### Track progress in the plan (ticks, percentages) as well as in the session

Two records of one fact drift. The plan points; the session records. Rejected.

## Consequences

- The `sessions` plugin's tool gained `list --plan PLAN-NNN`; `start` takes the plan id as its
  argument; the `/session-start` alias passes it through.
- PLAN-001 and PLAN-002 were rewritten to parts with status lines; PRD-001 gained its Plans table.
  The sha in a `done` line is the entry that finished the part, so it is never self-referential —
  it is written by `close`, after that commit exists.
