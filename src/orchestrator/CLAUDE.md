# src/orchestrator — the engine (ADR-007)

The failure policy is code here, by decision: `maxAttempts = 2` (one auto-retry); a required
item's failure aborts the run (journals `RUN_END failed`); an optional failure continues and skips
transitive dependents with a reason; `configure()` runs after install with schema-validated config
and invalid config fails the step (clamping belongs to the prompt layer); resume continues the
same run id.

- UI-agnostic: it emits events; rendering lives in `commands/bootstrap.ts`.
- An item with neither `install` nor `configure` gets the `deferred` outcome — an attended step,
  never "installed" (SES-003).
- `transitiveDependents(registry, selection, id)` — selection before id; returns a `Set`.
- Drive every branch with fake items and a mock runner:
  `bun src/orchestrator/.claude/skills/run-src-orchestrator/driver.ts`; `__tests__/orchestrator.test.ts`
  mirrors it.
