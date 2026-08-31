# ADR-012: Shell configuration is assembled from per-item `zsh()` contributions into one managed block

## Status

Accepted

## Date

2026-08-26 (audit pass; fixed real bugs: compinit never invoked, uv completions missing, fnm hook
not `--shell zsh`, dead `.cargo/bin` line)

## Context

A central dotfiles block drifted from the items that needed shell lines; installers each want to
edit `.zshrc`; a missing tool must never break shell startup.

## Decision

Each item declares its shell needs co-located via `zsh()` (`ZshContribution`: env → FPATH →
compinit → init → aliases). `src/items/defs/shell-block.ts` assembles all contributions, deduped,
into a single **managed marker block** in `~/.zshrc` (`dotfiles` = `makeDotfiles(allItems)`).
Every line is guarded so an absent tool cannot break startup. The `dotfiles` item's `detect()` is
the validation: exact-block match, else drift; `doctor` reports per-item gaps. The login shell is
ensured to be zsh (`chsh` for migrated bash accounts). Installers' own `.zshrc` edits are
suppressed. Per-machine values (Podman `DOCKER_HOST`) go to a sourced file under
`~/.config/envsetup/`, not the block.

## Alternatives considered

### Central hand-maintained block

- Rejected: drifted; the audit found dead completions.

### Let each installer edit `.zshrc`

- Rejected: unordered, unguarded, un-diffable.

## Consequences

- Add shell needs to the item, never to a central file (CLAUDE.md).
- `~/.zshrc` outside the marker block is never touched.
