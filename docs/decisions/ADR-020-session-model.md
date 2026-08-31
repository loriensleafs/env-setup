# ADR-020: A session is a bounded stream of work with an explicit status, not a conversation; a conversation joins or opens one before its first commit

## Status

Accepted

## Date

2026-08-30 (session SES-004; supersedes the "one file per conversation" rule in
`docs/sessions/README.md` and the `new` once-per-conversation gotcha of ADR-019's skill)

## Context

`docs/sessions/README.md` defined a session as "a conversation with an agent, or a human's
sitting", and the tool and skill were built on it: the newest file was the current session,
`new` ran once per conversation, `/session end` wrote the Outcome when the conversation stopped.
The two live sessions contradicted that within a day. SES-004 ran through many context
compactions and 27 entries (PRs #13–#32) — a stream of work, not a sitting. SES-005 was a
conversation that only rehydrated and changed nothing, yet had to create a file, which then sat
with two placeholders warning every gate. "Newest = current" broke as soon as two conversations
overlapped, and `--session` had to be added so a conversation could name its own file. Plans
already carried a status and could name the session that shipped them; a session could not name
its plan. Peter: "I'm not sure it makes sense to require a session be the length of a
conversation… a session could potentially be longer than a single conversation… worth giving
sessions some sort of status… and hooking sessions up to plans."

## Decision

- **Session** = a bounded stream of work toward one Goal, `open` from `bun run session new`
  until `bun run session close` writes `Status: closed`. It may span any number of
  conversations. The header carries `- Status: open | closed` and `- Plan: PLAN-NNN · <part>` (or
  `—` when unplanned; unplanned work stays legal).
- **Conversation** = one agent context or one human sitting. It is a participant: before its
  first commit it joins the open session whose Goal is its work, or opens one for the item it
  takes. A conversation that changes nothing needs no session and leaves no file.
- **The tool decides by status, not position.** Named (`--session`) wins; otherwise the single
  open session is the target; no open session, or several, is an error that says what to do
  (`list` shows them). `close` refuses while the gate is red, so a session closes complete or
  not at all; appends into a closed session are refused. A file without a Status line reads as
  open (another conversation's, or pre-ADR-020).
- **The skill splits `end`.** `/session end` = *leave*: log complete, handoff written in
  `Open at end`, the session stays open. `/session close` = the Goal is done: Outcome written,
  `close`, the plan's status line updated citing the sha. `/session start` ends by naming the
  open sessions and joining, opening, or stating "no session — nothing to record yet".
- **Plans and sessions point at each other.** A session's `Plan:` line names the plan and part it
  serves; a plan's task ticks cite the entry sha that did them and its status line the session
  that shipped it. Progress is read from the entries, not tracked twice.

## Alternatives considered

### Keep session = conversation; add a status line only

- Pros: smallest change. Cons: keeps "newest = current" (already broken) and a file per
  conversation (already producing empty sessions). Rejected.

### Session = one plan part, 1:1

- Pros: plan progress falls out for free. Cons: the two sessions that exist had no plan part
  (docs work before PLAN-002, a rehydration); an "unplanned" exception would be needed on day
  one — which is this decision with an extra rule. Rejected.

### A separate "conversation" record per sitting inside a session

- Pros: keeps who-did-what-when. Cons: the entries already carry the sha and date, and the
  Narrative carries the rest; a third file type for the same facts. Rejected.

## Consequences

- The tool gains `list`, `close`, `--plan`, status-based selection and refusal messages; its
  pure half is `session-lib.ts` with tests in a sibling `__tests__/`. Peter's call, same day: the
  tool moves from `scripts/` into the skill — `.claude/skills/session/scripts/` — so one directory
  holds the ritual, its tool, its tests and its evals; `package.json`'s `session` script points
  there, `/run-session-tool` (formerly `/run-scripts`) drives it, and the repo's `test` script
  names the directory because `bun test` skips dot-directories.
- SES-001–003 carry `Status: closed`; SES-004 `Status: open` (the docs-system session, closed when
  its stream ends); SES-005 is left to its conversation (reads as open; no edit).
- `docs/sessions/README.md` (rules, template, history line), `CONTEXT.md` (Session, Conversation,
  Open, Closed), CLAUDE.md, CONTRIBUTING.md, README.md, OVERVIEW.md, the `/session` skill and its
  typed aliases (`/session-close` added) say the same thing.
- The gate's `check` without `--session` now errors when two sessions are open rather than
  picking the newest; the skill always names its session.
