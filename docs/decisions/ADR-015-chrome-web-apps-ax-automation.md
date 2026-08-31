# ADR-015: Chrome web apps are installed by Accessibility automation and named by bundle filename; no enterprise policy

## Status

Accepted

## Date

2026-08-26 ([analysis](../analysis/ANA-004-chrome-web-apps.md))

## Context

Peter wants Gmail, Calendar, Drive and Keep as Dock apps labelled Mail / Calendar / Drive / Notes.
`WebAppInstallForceList` would do it with zero clicks but brands Chrome "managed by your
organization". Synthesizing bundles does not work (profile-side registration).

## Decision

A ceremony drives Chrome's own install flow through the Accessibility API (embedded Swift
driver: spatial ⋮ detection, delta submenu scraping, two-step wizard), one app at a time, after
Chrome sign-in; then renames **only the `.app` filename** (Info.plist edits trigger Chrome's
self-repair). `detect()` matches `CrAppModeShortcutURL` host and the idempotent rename re-applies
after Chrome regenerates a bundle. One Accessibility grant for the runner is the only manual step.

## Alternatives considered

### `WebAppInstallForceList` policy

- Rejected (Peter): permanent "managed" badge. Research retained as the zero-click fallback.

### Forged bundles

- Rejected: no window launches without the LevelDB registration.

## Consequences

- `chrome-pwas` is ceremony-only → reports `deferred` ("attended step"), never "installed".
- `dock` composition skips absent PWAs and adds them on re-run.
