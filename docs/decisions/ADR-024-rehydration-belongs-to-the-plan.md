# ADR-024: Rehydration belongs to the plan skill; the session skill keeps the record with three acts and a status

## Status

Accepted — supersedes the *placement* and *mode* clauses of [ADR-019](ADR-019-session-skill-invocation-and-name.md)
(the mode set), [ADR-020](ADR-020-session-model.md) (the `leave` act and `Open at end`),
[ADR-022](ADR-022-rehydrate-by-plan.md) ("`/session start [PLAN-NNN]` reads down that walk") and
[ADR-023](ADR-023-session-plugin.md) (the walk shipping in the plugin; the plugin as the skill's
final home). What stands: the session as a stream of work (ADR-020), the entry grain (ADR-021),
the plan part → session pointer and the PRD Plans table (ADR-022).

Its own *home* clause ("the skill moves into `~/.claude/skills/session`; the git-repo question is
deferred") is superseded by acmelabs-15/brain's ADR-002 (2026-08-31): the home is the `brain`
plugin, which carries the whole toolset. The rest stands. The same text is brain's ADR-001, the
copy of record (noted 2026-08-31, session SES-008).

## Date

2026-08-31 (session SES-001 in acmelabs-15/sessions; analysis [ANA-011](../analysis/ANA-011-rehydration-ownership.md))

## Context

After a fresh conversation typed `/sessions:session continue PLAN-001`, Peter: "session skills
should be really strictly just about the session … the plan should be responsible for rehydrating
the context, including how to identify the correct session." ANA-011 read every installed skill,
both authors' lifecycle material and the plugin, and found that "start of a session" had four
homes (`using-agent-skills`, `context-engineering`, the root `CLAUDE.md` rehydrate section the
conventions require, and the plugin's `start`/`continue`) with none owning it; that both
lifecycles treat the state file as the spine and reading it as the first step of a run; that both
reject an orchestrator and endorse a thin typed entry point; and that the plan already owns
"where the work stands" while the session owns "what happened". Peter then simplified the record
itself: a session has a status; nothing happens when a conversation stops; three acts suffice.

## Decision

- **`/plan [PLAN-NNN]` owns rehydration.** `planning-and-task-breakdown` gains a *Continuing a
  plan* section: decide new-vs-continue from the arguments; find the first part `in progress`
  (else the first `planned`) and its first unticked task; read the session that part's status
  line names — Narrative, entries newest-first, the files the last entries reference; read what
  the next task names; post the brief; route to `/build`. The router (`using-agent-skills`)
  carries one line to it; `context-engineering` one pointer; the repo's root `CLAUDE.md`
  § Rehydrating carries only the per-repo read order.
- **The session skill keeps the record, with three acts and a status.** A session is
  `in progress | done`. **start** creates one from a description (asking only for what the
  description lacks); **log** appends and fills a commit's entry into a session `in progress`;
  **close** — the only act that must be named — requires `SES-NNN`, else lists the sessions
  `in progress` through `ask-user-question`, and says so when there are none. No join, open or
  leave: a conversation that stops does nothing; the session stays `in progress`. `Open at end`
  is retired — the plan says what is next, the entries' `Notes` say what is unverified.
- **Argument inference.** `/session` infers the act from its arguments (`SES-NNN` + a commit →
  log; a description → start); three personal commands `/session-start`, `/session-log`,
  `/session-close` each expose only their act's arguments and infer the same way. `/plan`
  handles its arguments alike.
- **One status vocabulary** across session (`in progress | done`), plan part
  (`planned | in progress (session SES-NNN) | done (session SES-NNN, sha)`) and plan
  (`planned | in progress | done`). Tickets keep the triage roles; ADRs keep
  `Accepted | Superseded`.
- **Home and order.** The skill moves into `~/.claude/skills/session` (bare `/session` resolves
  for a personal skill; the plugin form never did). Whether `~/.claude/skills` becomes a git repo
  is deferred. Sequencing: **build in acmelabs-15/sessions, move last**, so every step is
  recorded in that repo's session log and gated.
- **The evals are redone**, not carried: once the skills work together, trigger statements and
  disclosure scenarios are written against real usage.

## Alternatives considered

### `context-engineering` owns the walk

A Lineage-A reference; `choosing-a-skill` classes those as "consult, not execute", and Addy's
skill would grow a session-log dependency it lacks upstream. Rejected.

### The root `CLAUDE.md` alone owns it

Right for the per-repo *order* (env-setup's section is that), wrong for the *procedure*, which is
identical in every repo and drifts when copied (env-setup's already said `/session start`).
Rejected for the procedure; kept for the order.

### A separate model-invoked `rehydrating` skill

One consumer; fails the deletion test. Its one benefit — firing on "catch me up" alone — is bought
by those words in `planning-and-task-breakdown`'s description. Rejected.

### Keep the walk in the plugin

Two homes keep evolving in step; the `/sessions:session` prefix stays; the description stays at
its 1,024-character ceiling. Rejected — Peter's direction, and the four-home finding.

### Keep join / open / leave as acts

Join and open are "continue a session `in progress`" and "start one"; leave writes a handoff that
the plan plus the entries already carry. Rejected — three acts, one status.

## Consequences

- PLAN-002 in acmelabs-15/sessions carries the work in five parts (the record's model; the
  commands; rehydration into `/plan`; the docs sweep and duplicated shapes; the move and the eval
  redo). PLAN-001 Part 4's remaining measurement tasks are superseded; Part 5 (plugin-kit) stays.
- The session-log glossary `session init` writes, `project-docs-conventions`, this repo's root
  `CLAUDE.md` § Rehydrating and `~/CLAUDE.md` §1 change to the new words and the new door.
- The disclosure figures on record (35 → 36 → 37 → 35 of 54) describe the old layout and are not
  comparable to anything measured after this ADR.
- Duplicated shapes get one home each: the ADR template (`documentation-and-adrs` vs
  `domain-modeling/ADR-FORMAT.md`), the spec template (`spec-driven-development` vs `to-spec`),
  the ticket shape (`to-tickets` vs `issue-tracker.md`).
