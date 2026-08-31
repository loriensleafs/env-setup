# ADR-013: The Claude Code auto-format hook is installed by the CLI as a FileChanged hook, not committed as a project hook

## Status

Accepted

## Date

2026-08-26 (Peter: "it shouldn't be in the project hooks. It should be part of the Claude Code
settings template… added as part of the install CLI"; FileChanged chosen over PostToolUse)

## Context

Files Claude edits should be formatted with the *project's own* Biome/markdownlint config. A
repo-committed `.claude/` hook only helps this repo and clutters it; a global capability is what
Peter wants on every machine.

## Decision

The `claude-settings` item deploys `hooks-format.ts` → `~/.claude/hooks/format.ts` and adds a
**FileChanged** hook to `settings.template.json` (matcher = source-extension globs). The script
locates the project via `$CLAUDE_PROJECT_DIR` (not cwd), formats the changed file with that
project's Biome / markdownlint config, is inert where no config matches, skips deletes, and is
loop-safe (formatters write only on change, so the re-fire converges; Claude Code debounces).
Requires Claude Code v2.1+.

## Alternatives considered

### PostToolUse on Edit/Write

- Rejected (Peter's call): tool-specific; misses Bash-driven rewrites. FileChanged is tool-agnostic.

### Repo-committed `.claude/hooks`

- Rejected: not global; would live in every project.

## Consequences

- Hooks (notify, subagent statusline, format) and the pure-Bun statusline are **part of the
  install** (embedded assets); `detect()` deep-compares `settings.json` and all deployed assets.
