# ADR-009: GitHub device flow under envsetup's own OAuth app, right after confirm; two per-machine SSH keys; SSH commit signing; noreply email

## Status

Accepted

## Date

2026-08-26 (auth placement chosen with a full re-pitch; validated end-to-end by Peter)

## Context

Private ACMElabs repos, SSH key upload, secrets and Claude settings all need GitHub credentials,
and Peter's automation principle is: manual steps are limited to *true* auth ceremonies (a browser
authorize click, OS permission dialogs). Placing auth at the end (Stage C) would push clones and
settings into the attended phase.

## Decision

- envsetup implements the **device flow itself** in Bun under its **own registered GitHub OAuth
  app** (client id ships in the binary — GitHub's documented pattern for CLI tools; scopes `repo`,
  `admin:public_key`, `read:org`, `user:email`; token expiry off). It runs **immediately after
  summary confirm**, so keygen/upload, clones, secrets and Claude settings run unattended in Build.
  Token → Keychain (service `envsetup-github`) → `gh auth login --with-token` handoff → `gh` is the
  git credential helper (HTTPS day-to-day). `detect()` validates envsetup's token against
  `GET /user` (`gh auth status` is not our token).
- **Two fresh ed25519 keys per machine**: `id_ed25519` (auth; revoke freely on machine loss) and
  `id_ed25519_sign` (signing; registered as a signing key and **never deleted** — deleting an SSH
  signing key flips historical commits to Unverified per user reports). `~/.ssh/config` with
  `AddKeysToAgent yes`, `UseKeychain yes`; public halves uploaded via the API with
  machine-identifying titles; 422-tolerant re-runs; `detect()` verifies both registrations.
- **SSH commit signing on**: `gpg.format=ssh`, `user.signingkey=~/.ssh/id_ed25519_sign.pub`,
  and `commit.gpgsign=true` written **only once the key exists** (otherwise every commit fails —
  [analysis](../analysis/ANA-007-config-compatibility.md) #3).
- `user.email` defaults to the GitHub **noreply** address, fetched via the API and written back
  into the manifest; `user.name` and github user default to Peter's identity (editable prompts).

## Alternatives considered

### `gh auth login` in Stage C

- Rejected: pushes unattended work into the attended phase.

### One SSH key for auth and signing

- Rejected: lifecycle hygiene (revoke auth freely; keep signing forever). SSHSIG namespaces would
  make reuse safe, but separation is about lifecycle, not security.

## Consequences

- Peter's one-time OAuth app registration; `envsetup auth` subcommand; `github-auth` gates repo
  and settings items.
