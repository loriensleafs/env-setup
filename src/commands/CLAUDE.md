# src/commands — the subcommands; bootstrap is the product (ADR-005, ADR-014)

Invariant: the scan and every prompt before the confirm stay pure — the manifest is saved only
after "Proceed?", and the PTY walk (`.claude/skills/run-envsetup/bootstrap-walk.exp`) depends on
that when it answers No. Drive with `bun src/commands/.claude/skills/run-src-commands/driver.ts`;
`bootstrap()` and `sync` run for real only from a terminal, on purpose.

- A new pre-confirm prompt defaults to the safe answer and joins the walk's pattern list
  (`Resume it?` installs on Yes — that is why the walk always answers `n`).
- A command gates on `process.stdout.isTTY` and `interactiveCapable()` before its first prompt.
- `presentOption(d, failedLastRun)` is the one place detect results become picker hints and
  defaults (Drifted → unchecked "applied — settings differ"; failed last run → checked "retry") —
  tested in `__tests__/bootstrap-presentation.test.ts`.
- `executePlan` draws one append-only spinner per step (a re-rendering taskLog duplicated lines,
  SES-003); `ItemContext.ask()` pauses it; ceremony-only items report `deferred` as an attended
  step.
- For the requirements: PRD-001 "UX requirements" 1–9. For the pending UI change: PLAN-001
  (branch `wip/visual-grouping`).
