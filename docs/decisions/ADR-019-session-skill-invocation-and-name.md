# ADR-019: One model-invoked `/session` skill (start | record | end), named for its leading word, with the gate as the guard for its side effects

## Status

Accepted

## Date

2026-08-30 (session SES-004; ANA-009; the skill-creator loop, iteration 1)

## Context

The session ritual (ADR-017) has three moments — start, record after every commit, end — and
was split across two skills plus prose in CLAUDE.md. Peter asked whether it should be one
skill. Anthropic's pages ([ANA-009](../analysis/ANA-009-skill-workflow-best-practices.md))
document a "conditional workflow pattern" for related branches inside one coherent unit, say
both the user and Claude can pass arguments, and recommend `disable-model-invocation: true` for
commit-like side-effect workflows; they prefer gerund names but accept noun phrases and warn
against inconsistency within a collection. `record` and `end` commit; `start` must fire on its
own in a fresh conversation. A single skill cannot be user-only for two branches and
model-invoked for the third.

## Decision

- **One skill, `session`, branching on its argument** (`start`, `record`, `end`; inferred when
  absent), following the documented conditional pattern; the three branches share the same
  gotchas, tool and state, so they are one coherent unit.
- **Model-invoked** (no `disable-model-invocation`), because `start` is the whole point of the
  always-loaded CLAUDE.md pointer and must fire without the user remembering it. The side effects
  of `record`/`end` are guarded by the gate the docs ask for: the `docs(session)` commit happens
  only after `bun run session -- --check` has printed `session: complete`, and pushes/PRs are
  never part of the skill (Peter approves outward-facing steps).
- **Named `session`**, a noun, not the gerund `managing-sessions`: the word is the leading word
  across the tool (`bun run session`), the directory (`docs/sessions/`) and the glossary, and the
  repo's other skills are action-named (`run-*`); consistency inside this collection outranks
  gerund form.

## Alternatives considered

### Two skills, `/start-session` and `/end-session`, with `record` as CLAUDE.md prose

- Rejected by Peter: `record` is the step most often deferred and deserves a procedure with a
  completion criterion; two description lines cost more context than one.

### `disable-model-invocation: true` on the whole skill

- Rejected: `start` would depend on Peter typing it; the failure mode the skill exists to remove.

### Dispatch script (`scripts/session.ts --op start|record|end`) with a thin SKILL.md

- Partly adopted: the deterministic parts already live in `scripts/session.ts`; the reading,
  judging and writing that the branches do are not scriptable and stay in the body.

## Consequences

- `record` and `end` never commit on a red gate; a red gate caused by another conversation's
  file is reported, not silently fixed (gotcha in the skill).
- Evaluated with the skill-creator loop (`.claude/skills/session/evals/`); the name and
  invocation choice are re-examined only if the measured trigger sweep shows a routing problem.
