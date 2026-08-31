# ADR-007: Manifest + journal + one module per item, toposorted, with an encoded failure policy

## Status

Accepted

## Date

2026-08-26 (research-backed, [analysis](../analysis/ANA-001-clack-citty-bun.md) §11)

## Context

Decisions must be decoupled from execution (resume, `doctor`, `sync`), every step must be
auditable and resumable after a crash, and ~65 heterogeneous items need one shape.

## Decision

- **Manifest** `~/.config/envsetup/manifest.json`: Zod-versioned with an explicit migration chain
  (`src/manifest/migrations.ts` holds the recipe; migrations run automatically on load; a
  future-version manifest is refused with an upgrade message). Holds identity, locations,
  per-item `selected` + `config`.
- **Journal** `~/.local/state/envsetup/journal.jsonl`: append-only, Zod-validated step events,
  torn-line-tolerant reader; `computeResume` (latest run only; failed-then-retried counts as
  completed); `failedSteps` drive "failed last run — retry".
- **Item** (`src/items/item.ts`): `detect` / `install` / `configure` / `verify`, `deps`,
  `ceremonies`, Zod `configSchema` + `defaultConfig`, optional `zsh()` (ADR-012). `defineItem`.
  Execution order = deterministic Kahn toposort of declared deps (cycle + unknown-dep errors);
  deps outside the run are ignored.
- **Orchestrator** (`src/orchestrator/`): UI-agnostic (events interface); per step detect →
  skip if satisfied; `maxAttempts = 2` (one auto-retry); a *required* failure aborts the run
  (journals `RUN_END failed`); an optional failure continues with transitive dependents
  skipped-with-reason; `configure()` runs after install with schema-validated config (invalid
  config fails the step — clamping is the prompt layer's job); resume continues the same run id.
- **Paths**: XDG dirs honouring `XDG_*` overrides via a 20-line module. `env-paths` was dropped
  because on macOS it returns `Library/*` (GUI-app convention) while dev CLIs use `~/.config`.

## Alternatives considered

### `conf` / a settings library

- Rejected: would split schema systems from Zod.

### State only in the manifest (no journal)

- Rejected: execution truth and resume need an append-only event log; the manifest is decisions.

## Consequences

- Adding a migration: bump the schema version, add one entry to `MIGRATIONS` (recipe in the file).
- Items are unit-testable with an injectable `Runner` (`src/exec/run.ts`).
