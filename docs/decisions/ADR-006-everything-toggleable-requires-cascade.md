# ADR-006: Every shown item is toggleable; safety comes from the requires-cascade

## Status

Accepted (supersedes the "detect + lock" design of the same day)

## Date

2026-08-26 (design revision after three rounds of friction)

## Context

The first picker locked required items ON and showed installed items as locked ✓. Three rounds of
Peter's feedback: locked rows broke navigation and made the "Required" group act like a broken
single-select; informational rows added noise.

## Decision

- Items that are installed **and** match are not shown at all — straight into the manifest
  (`--show-installed` exposes them for cascade inspection).
- Every shown item is a normal toggleable option, default-selected (drifted items default
  unselected, ADR-010). The "Required" header is a real group toggle like any other.
- **Safety = the requires-cascade**: registry `deps` feed the picker's `requires` (filtered to
  shown items — absent deps are installed, hence satisfied). Unselecting Homebrew visibly disables
  every brew item with a "needs Homebrew" hint; dependents disable **in place** (strikethrough +
  reason) rather than hiding, keep their selection memory, and return when re-enabled. Group
  headers with zero togglable items render as plain headings.
- Stock fidelity: option labels render white only when focused; the checkbox shows selection.

## Alternatives considered

### Detect + lock (locked-on required, locked ✓ installed)

- Rejected: see context. Version-aware "installed but wrong version → per-item confirm" folded
  into drift handling (ADR-010).

### Hide disabled dependents

- Rejected in favour of disable-in-place (clack's dynamic-group-multiselect example; better UX).

## Consequences

- `src/ui/group-multi-select.ts` is a faithful extension of clack's `GroupMultiSelectPrompt`
  with ALL-of requires, multi-missing labels, plain headings and viewport windowing.
- The manifest records already-installed items as `selected: true` (it is the machine's
  definition, not a work list) — `doctor`/`sync` depend on this.
