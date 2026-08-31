# Install methods per tool — analysis

> **Analysis** · 2026-08-26 · status: current · decision [ADR-011](../decisions/ADR-011-install-method-per-tool.md)

## Question

For every runtime and tool on a fresh Mac, what is the *best* install method — the one the
official docs recommend and community practice confirms — not merely the easiest (Homebrew by
default)? And what else does each need on a completely fresh machine?

## Sources

bun.com/install docs; go.dev install docs + Go ≥ 1.21 toolchain directive docs; fnm README and
2026 community comparisons (nvm/fnm/Volta/mise); docs.astral.sh/uv installation; cli/cli README
(macOS section); Apple WWDC 2026 Rosetta announcements; Homebrew formula/cask metadata (bottled vs
source builds); BetterDisplay CLI releases.

## Findings

1. **bun — official installer** (`curl -fsSL https://bun.com/install | bash` → `~/.bun`). Docs
   say brew installs forfeit `bun upgrade` self-update; Peter is bun-first and wants the newest
   bun. The installer's `.zshrc` edit is suppressed — envsetup's shell block owns the PATH line.
2. **Go — brew.** Official docs recommend the `.pkg` and do not mention brew, but the `.pkg` has
   no upgrade path while brew rides `brew upgrade`; since Go ≥ 1.21 the toolchain directive
   downloads the version a module needs, so the installed go is a bootstrap whose exact version
   barely matters. Peter confirmed with this context. Needed for his gopls Claude plugin.
3. **Node.js — via fnm** (brew install fnm → `fnm install --lts`, default `lts-latest`,
   `corepack enable` so pnpm/yarn are available on demand). Community consensus: plain brew node
   is discouraged (single system version, surprise major bumps); fnm is nvm-compatible, ~15 ms
   shell hook, `.nvmrc` auto-switching; Volta's `package.json` pinning only pays off for node
   teams (his are bun); mise only wins when managing *all* runtimes. Not for Peter's own work —
   for community tooling that hardcodes node.
4. **Python — uv via its standalone installer** (docs-primary; `uv self update` is disabled under
   brew per docs). PATH line owned by the shell block.
5. **gh — brew.** The cli/cli README lists brew first for macOS.
6. **Rust — no.** Not wanted.
7. **Rosetta 2 — skip; on demand only.** WWDC 2026: macOS 27 is the last full-Rosetta release,
   macOS 28 keeps only a games-focused remnant. A deprecated component does not belong in a
   future-machines manifest; any item that truly needs it declares it as *its* dependency.
8. **Transitive prerequisites** (dependency audit): brew auto-installs formula/cask deps, so the
   risk is only in non-brew methods. Installer-script items (bun, uv, fonts) need only
   curl/unzip/fetch (present by default). All registry formulae are bottled (no full-Xcode
   compile) except `betterdisplaycli`, which compiles from source → switched to the prebuilt
   signed release binary. `git-identity` depends on `xcode-clt` (git). Swift helpers
   (finder-favorites, ghostty-icon) depend on `xcode-clt` (`swiftc`).
9. The pattern "self-updater ⇒ official installer / no self-updater ⇒ brew" held for these cases
   but is **not a standing rule** — every future tool is researched individually (Peter).

## Refuted

- "Homebrew is the right default for everything" — see 1 and 4 (self-update lost) and 8
  (betterdisplaycli source build needs full Xcode).

## Unverifiable

- Google Sans (non-code) install method was open until the font became OFL-licensed on
  fonts.google.com; now installed from the official download manifest (verified live).

## Implications

- [ADR-011](../decisions/ADR-011-install-method-per-tool.md); the shell block
  ([ADR-012](../decisions/ADR-012-per-item-zsh-contributions.md)) owns every PATH/hook line.
