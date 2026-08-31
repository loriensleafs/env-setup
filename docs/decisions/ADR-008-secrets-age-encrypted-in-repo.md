# ADR-008: Secrets are an age-encrypted file committed to the public repo, unlocked by one passphrase

## Status

Accepted (research reversed an earlier lean toward a private repo)

## Date

2026-08-26

## Context

Four secrets must reach a fresh machine automatically: the Anthropic API key and the Typora,
superwhisper, CleanShot (later BetterDisplay) license keys. The repo is public. The community
pattern validated by chezmoi is an encrypted secrets file in the repo.

## Decision

`secrets.json.age` (age/scrypt, official age TypeScript implementation `age-encryption`,
Bun-compatible) is committed. On a new machine one clack password prompt takes the passphrase
(kept in Peter's password manager) → decrypt in memory → the API key goes to the macOS Keychain
(`security`), license keys are applied to their apps (scriptable ones written directly, online
ones via clipboard ceremony) → the decrypted store is cached at `~/.config/envsetup/secrets.json`
so `doctor`/`sync` never re-prompt. `envsetup secrets` = `init` · `list` · `show` (masked) ·
`reveal` · `copy <key>` · `set <key>` · `unlock`. Forgotten passphrase = re-encrypt with a new one
(every secret is reissuable).

**Hard rule:** a license key — even partial/truncated — never appears in a tracked file or a
commit message. (Audit 2026-08-26: none in tree or history; a non-usable 8-char fragment once did
and was scrubbed.)

## Alternatives considered

### Private repo

- Rejected: hides the whole project for four strings; the encrypted-file pattern is standard.

### macOS Keychain / iCloud as the source

- Rejected: not available before sign-in on a fresh machine; Keychain is the *destination* for
  the API key.

### Prompt for each secret at setup

- Rejected: defeats "one command".

## Consequences

- `.gitignore` blocks `.env*` (except `.env.example`) and bare `secrets.json`; CI runs gitleaks
  (ADR-016).
- Secret *names* are code (`SECRET_KEYS`); adding a secret needs `envsetup secrets set`.
