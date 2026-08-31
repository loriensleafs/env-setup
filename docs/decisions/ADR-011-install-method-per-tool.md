# ADR-011: The install method is chosen per tool from official docs; transitive prerequisites are installed automatically

## Status

Accepted

## Date

2026-08-26 (Peter's install principle + transitive-prereq principle; [analysis](../analysis/ANA-002-install-methods.md))

## Context

"Best way, not easiest." Homebrew is the easy default, but some tools lose their self-updater
under brew, some brew formulae compile from source (needing full Xcode), and a fresh machine has
none of a tool's companions.

## Decision

- For **every** tool, research the official docs' recommended method plus community practice
  before choosing; present findings **with a recommendation**; never assume. Homebrew when it *is*
  the best way, never because it is easy. Current choices: bun (official installer), Go (brew),
  Node (fnm; `corepack enable`), Python via uv (standalone installer), gh (brew), Rosetta 2
  (skipped; on demand). The self-updater heuristic is not a standing rule.
- Identify everything else a tool needs on a completely fresh machine — prerequisites,
  companions, shell hooks, runtimes — and install those too, declared as `deps` on the item
  (e.g. `terminal-notifier` for the Claude notify hook; `xcode-clt` for Swift helpers and git;
  `betterdisplaycli` from the prebuilt release, not the source-building formula).
- Version pins are honoured where Peter pinned (Nerd Fonts v3.5.1 zips); otherwise latest via the
  tool's own upgrade path. Peter: "critical that the newest bun is installed."

## Alternatives considered

### Homebrew for everything

- Rejected: loses `bun upgrade` / `uv self update`; some formulae need full Xcode.

### One runtime manager (mise) for all runtimes

- Rejected: per-tool idiomatic methods already chosen; mise only wins when managing all of them.

## Consequences

- Installer-script items suppress their own `.zshrc` edits; the shell block owns PATH (ADR-012).
- `doctor` checks versions natively per tool.
