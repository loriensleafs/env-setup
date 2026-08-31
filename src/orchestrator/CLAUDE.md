# src/orchestrator — the engine (ADR-007)

The failure policy is code here, by decision, and every branch of it is driven with fake items and
a mock runner: `bun src/orchestrator/.claude/skills/run-src-orchestrator/driver.ts`
(`__tests__/orchestrator.test.ts` mirrors it).

- The policy: `maxAttempts = 2` (one auto-retry); a Required item's failure aborts the run
  (journals `RUN_END failed`); an optional failure continues and skips transitive dependents with a
  reason; `configure()` runs after install with schema-validated config and invalid config fails
  the step (clamping belongs to the config screen); resume continues the same run id.
- UI-agnostic: it emits events; rendering lives in `src/commands/bootstrap.ts`.
- An item with neither `install` nor `configure` gets the `deferred` outcome — a Ceremony, never
  Applied (SES-003).
- `transitiveDependents(registry, selection, id)` — selection before id; returns a `Set`.
