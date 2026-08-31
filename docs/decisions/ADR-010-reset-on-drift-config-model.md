# ADR-010: Config model — reset-on-drift; selection is the consent; no conflict checking

## Status

Accepted (supersedes the config-conflict-consent / compatibility-graph design of 2026-08-26)

## Date

2026-08-27 (Peter: "only exclude an item if installed at the right version AND config exactly
matches; otherwise mark 'installed — settings differ', opportunity to reset; no conflict checking.
That's the whole shebang."); built and released in v0.1.0

## Context

Config-only items have no `install()`, so the orchestrator re-ran `configure()` on every run and
silently overwrote a user's deliberate customization. A first design proposed a three-state
detect + per-item keep/re-apply choice + orchestrator gate + impact analysis; a second proposed a
Zod-driven compatibility graph (`superRefine` internal rules, `conflictsWith` edges, ■ error
states, disabled downstream options). The verified research
([analysis](../analysis/ANA-007-config-compatibility.md)) found real couplings and four defects — but
Peter judged the machinery over-complicated relative to the value.

## Decision

1. An item is left **off** the install list only when it is installed at the version we would
   install **and**, if we define defaults for it, its current values **exactly match** the
   effective config (manifest config, else schema defaults).
2. Anything installed whose configuration drifted **stays listed**, marked
   **"applied — settings differ (select to reset)"**, default **unchecked**. Selecting it is the
   user's opt-in to reset (or vary via the config screen). Unselected = untouched. `doctor` shows
   drift as `≠`, not "missing".
3. **No conflict checking.** No `superRefine` compatibility rules, no `deriveDisabled`, no
   blocking gates, no reactive config screen.

Mechanics: `DetectResult.differs`, `presentOption()` in bootstrap, and a **drift-aware
`detect()` on every item with defaults** (compare actual values to the effective config; return
`{ installed: false, differs: true }` for present-but-mismatched vs plain `installed: false` for
never-configured).

## Alternatives considered

### Keep/re-apply choice per drifted item with impact analysis

- Rejected: a second UI group and an orchestrator gate for what selection already expresses.

### Compatibility graph (negative dependencies)

- Rejected: correct in principle, but the real couplings are few and already welded where needed
  (Raycast + Spotlight, plugin filtering); the rest are recorded, not encoded.

## Consequences

- `sync` unchanged: it applies the manifest; drift-aware detects only make reporting honest.
- Every new item with defaults **must** implement drift-aware `detect()` (CONTRIBUTING).
- The four defects from the research were fixed as ordinary bugs.
