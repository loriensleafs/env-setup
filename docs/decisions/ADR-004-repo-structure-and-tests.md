# ADR-004: Single package, feature-first layout, sibling `__tests__/` directories

## Status

Accepted

## Date

2026-08-26 (research-backed; Peter approved)

## Context

A Bun + TypeScript CLI with ~65 installable items, custom prompts, a manifest, a journal and
secrets. Community guidance (2026): workspaces earn their complexity only with interdependent
packages; feature-first layouts beat type-first for this size.

## Decision

- **One package, no monorepo.** Bun workspaces make a later split cheap; documented migration path.
- **Feature-first**: `src/index.ts` (citty entry) · `src/commands/` (one file per subcommand) ·
  `src/items/<item>/` (one module per installable thing: detect/install/configure/verify + Zod
  schema + `assets/`) · `src/ui/` (custom clack prompts) · named shared homes as built
  (`src/manifest/`, `src/secrets/`, `src/orchestrator/`, `src/ceremonies/`) — no `lib/` junk
  drawer. kebab-case filenames. Item payloads live in per-item `assets/`, not a top-level
  `templates/`.
- **Tests**: `<name>.test.ts` in a `__tests__/` directory that is a **sibling** of the file under
  test (`bun:test`). Research spikes (`test/spikes/`) were deleted once real tests superseded them.

## Alternatives considered

### Monorepo with `packages/*`

- Rejected: no interdependent packages to justify it.

### Type-first (`controllers/`, `services/`)

- Rejected: an item's detect/install/configure/verify belong together.

### Co-located `foo.test.ts` next to `foo.ts`

- Rejected by Peter in favour of the sibling `__tests__/` directory (memory: `ts-testing-sibling-tests-dirs`).

## Consequences

- Registry assembled in `src/items/all.ts`; adding an item = one directory + one registration.
- `bun run check` (Biome + tsc + markdownlint) is the gate everywhere (ADR-016).
