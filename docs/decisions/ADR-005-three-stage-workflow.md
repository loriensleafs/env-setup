# ADR-005: Decide → Build → Connect; nothing touches the system before confirm; connect runs automatically; re-running converges

## Status

Accepted (2026-08-26); **revised 2026-08-30** — connect is no longer a separate command a user
must remember, and re-running the bare command replaces the need for `sync` in practice

## Date

2026-08-26; revision 2026-08-30 (session `SES-003-real-bootstrap-runs-v0.1.5-to-v0.1.9.md`, v0.1.7)

## Context

Peter's original idea was interleaved prompt→install per app. All *decisions* can be made up
front; only *application* has ordering constraints (repos before Claude settings, Chrome before
PWAs), and un-automatable steps (sign-ins, TCC grants — [analysis](../analysis/ANA-005-macos-permissions-tcc.md))
cluster at the end of the dependency graph anyway. Design principle (Peter): **nothing touches
the system until the summary is explicitly confirmed**; no background preloading.

## Decision

- **Stage A — Decide (attended):** scan the whole machine first (step zero, parallel per section),
  identity + Dev-dir prompts (prefilled from the prior manifest), one grouped picker over every
  candidate item (installed-and-matching items are simply absent), per-item config screens
  derived from Zod schemas, a summary, then **Enter confirms**. All answers persist to the
  manifest.
- **Stage B — Build (unattended):** the orchestrator applies the manifest in dependency order,
  journaling every step (ADR-007). GitHub device-flow auth happens immediately after confirm so
  keys, clones, secrets and Claude settings all run unattended (ADR-009).
- **Stage C — Connect (attended):** the ceremonies (license pastes, sign-ins, permission grants,
  Chrome web-app installs) **run automatically after Build** in the same invocation
  (`src/ceremonies/connect-phase.ts`, deduped), followed by a finishing pass that re-executes
  what the ceremonies unblocked. `envsetup connect` remains only to re-run skipped steps.
- **Re-run converges:** running the same command again re-detects state, pre-checks anything the
  journal recorded as failed ("failed last run — retry"), and only asks about what is missing.
  `sync` (apply the manifest non-interactively) exists but is not part of the promised flow.
- Resume: an unfinished journal + manifest → offer resume with the same run id.

## Alternatives considered

### Interleaved prompt → install per app (Peter's first sketch)

- Rejected: no reason to attend the whole run; decisions don't depend on install results.

### Separate `connect` step the user invokes (shipped v0.0.1–v0.1.6)

- Rejected 2026-08-30 (Peter: "shouldn't have to pass the word connect… should just happen as
  part of that installation phase"; "not convinced we should need to use sync… run the command
  again… pick up the missing pieces").

### Background CLT preload before confirm

- Rejected: violates "nothing before confirm".

## Consequences

- Two attended moments per setup: start and end.
- Ceremony-only items report the `deferred` outcome ("attended step"), never "installed".
- Items may ask a yes/no mid-step via `ItemContext.ask()` (spinner pauses) — e.g. quit Chrome.
