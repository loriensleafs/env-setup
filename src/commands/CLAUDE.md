# src/commands — the subcommands; bootstrap is the product

Invariant: **nothing touches the system before "Proceed?"** (ADR-005). The scan and every prompt
before the confirm stay pure; the manifest is saved only after it. The PTY walk
(`.claude/skills/run-envsetup/bootstrap-walk.exp`) relies on this — it answers No there.

- A new pre-confirm prompt defaults to the safe answer and joins the walk's pattern list
  (`Resume it?` installs on Yes — that is why the walk always answers `n`).
- Every prompt, `p.group` members included, passes `input: promptInput()`; a command gates on
  `process.stdout.isTTY` and `interactiveCapable()` (ADR-014).
- `presentOption(d, failedLastRun)` is the one place detect results become picker hints and
  defaults (drifted → unchecked "settings differ"; failed last run → checked "retry") — tested in
  `__tests__/bootstrap-presentation.test.ts`.
- `executePlan` draws one append-only spinner per step (a re-rendering taskLog duplicated lines,
  SES-003); `ItemContext.ask()` pauses it; ceremony-only items report `deferred`; the connect phase
  and the finishing pass run automatically afterwards.
- Requirements: PRD-001 "UX requirements" 1–9. Pending UI change: PLAN-001 (branch `wip/visual-grouping`).
- Drive: `bun src/commands/.claude/skills/run-src-commands/driver.ts` — `bootstrap()` and `sync`
  run for real only from a terminal, on purpose.
