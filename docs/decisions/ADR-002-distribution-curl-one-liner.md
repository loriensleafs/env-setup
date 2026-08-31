# ADR-002: Distribution — `curl … | sh` shim that fetches a compiled binary from GitHub Releases

## Status

Accepted

## Date

2026-08-25/26 ("Option B"); release pipeline approved 2026-08-26; first release v0.0.1 2026-08-26

## Context

The product promise is one command on a completely fresh Mac with zero prerequisites. Browser
downloads get the quarantine attribute (Gatekeeper prompt); `curl` does not (verified empirically
2026-08-25). Bun can compile a self-contained binary per architecture.

## Decision

`curl -fsSL https://raw.githubusercontent.com/loriensleafs/env-setup/main/install.sh | sh`.
`install.sh` detects the architecture, downloads `envsetup-darwin-{arm64,x64}` from
`releases/latest`, `chmod +x`, ad-hoc codesign if needed, and `exec`s it (plain exec — see
ADR-014 for why there is no `/dev/tty` redirect). Releases: a pushed `v*` tag runs
`.github/workflows/release.yml` → `bun build --compile` both targets → ad-hoc codesign → attach
to the GitHub release. `install.sh` is served from `main`, so it deploys on merge.

## Alternatives considered

### Homebrew tap

- Rejected: requires Homebrew first — which envsetup installs.

### npm / bunx package

- Rejected: requires a runtime first.

### Notarized, signed binary

- Deferred: ad-hoc signing + curl (no quarantine) suffices for a personal tool; notarization is
  a paid Apple Developer step that can be added without changing the flow.

## Consequences

- Docs must say *use curl* (a browser-downloaded binary would be quarantined).
- Release uploads can flake ("other side closed") — re-run the job and verify both assets exist.
- The binary is not yet persisted to `~/.local/bin` (OVERVIEW "Next up").
