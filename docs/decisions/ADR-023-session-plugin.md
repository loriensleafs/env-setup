# ADR-023: The session skill ships as the `sessions` plugin, and this repo consumes it

## Status

Accepted — revises the location half of [ADR-019](ADR-019-session-skill-invocation-and-name.md) and
[ADR-020](ADR-020-session-model.md) (the skill and its tool no longer live in this repo); the
invocation, the name, the modes and the model those ADRs settled stand.

## Date

2026-08-31 (session SES-006)

## Context

The `/session` skill was born here as a project skill (`.claude/skills/session/`) with its tool
under `scripts/`, then inside the skill (ADR-020), driven by a `/run-session-tool` skill and four
typed-only aliases. Every other repo that wanted the ritual would have had to copy all of it, and
the rehydrate-by-plan work (ADR-022) touched the global plan and spec templates — the ritual had
stopped being envsetup-specific. Peter: "This might also mean that the session skill might need to
be moved into ~/.claude/skills"; the plugin route was chosen over a personal skill because a plugin
carries the aliases, the tool and its tests as one installable unit, versions them, and is what the
ACMElabs marketplace already distributes. Then: "plugin name should just be session — part of me
would prefer a single skill with a commands folder."

## Decision

- **The skill, its four aliases, its tool, its tests and its eval evidence live in
  [acmelabs-15/sessions](https://github.com/acmelabs-15/sessions)**, a plugin named `sessions`, built
  with plugin-kit (plugin-creator, skill-creator, command-creator): one skill (`skills/session/`)
  plus a `commands/` folder for the aliases — a legacy layout kept deliberately at Peter's
  preference — with `references/` for what the model reads (the record's shapes and rules, the
  tool's outputs and refusals), `assets/` for what `session init` copies into a repo, `scripts/`
  for the tool. The repo is its own marketplace (`.claude-plugin/marketplace.json`) and is listed
  in the ACMElabs marketplace; the `repo-sessions` item clones it.
- **This repo consumes it.** `.claude/skills/session`, `.claude/skills/run-session-tool`, the four
  `.claude/commands/session-*.md` and the `bun run session` script are gone; `docs/sessions/`,
  `docs/plan/` and `CONTEXT.md` keep the record and point at the skill for the rules, which now
  have one home. The tool finds the repo on its own (`CLAUDE_PROJECT_DIR`, else the git toplevel)
  and is run as `bun "${CLAUDE_PLUGIN_ROOT}/skills/session/scripts/session.ts" <command>`.
- **The tool's behaviour is unchanged** where it matters to this repo's log — numbering, order,
  the status line, the gate, `Also:` and `Session-entry: none` — and gained `init`, `list --plan`
  and `list --brief`.

## Alternatives considered

### A personal skill under `~/.claude/skills/session`

Installs on one machine, carries no aliases, versions nothing, and its tool would still need a
home the skill can reach from any repo. Rejected.

### Six skill directories instead of `skills/session` + `commands/`

Both layouts load identically and produce the same `/session-*` names; plugin-kit calls `commands/`
legacy. Peter preferred one skill with a commands folder, and the aliases carry nothing a directory
would hold. Rejected in favour of his preference.

### Keep a copy of the skill here as well

Project scope shadows plugin scope, so the copy would silently win and the two would drift.
Rejected — the reviewers flagged exactly this.

## Consequences

- `/session` in this repo is the plugin's; a machine without the plugin has no `/session`. The
  ACMElabs marketplace entry and `repo-sessions` item make `envsetup` install it.
- The eval evidence (four iterations, tier and trigger sweeps) moved with the skill; the next
  iteration is measured there. The `evals/` fixture is any git repo after `session init`.
- Headless runs of the skill (`claude -p`) must pass `--allowedTools Skill`, and in headless mode
  only the namespaced `/sessions:session …` form resolves; interactively the bare `/session` works
  when nothing else claims the name — which is why this repo's copy had to go.
