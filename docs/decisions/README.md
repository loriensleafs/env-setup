# Decisions — Architecture Decision Records

The **current truth** of every decision that shapes envsetup, one ADR per decision, with the
context, the alternatives that were rejected and why, and the consequences. Read the ADR for the
area you are about to touch before touching it; decisions here are settled — do not re-litigate
them in a session. If one must change, write a new ADR that supersedes it (never edit history
away) and cite the session entry (sha).

## Index

| ADR | Decision | Status |
| --- | --- | --- |
| [001](ADR-001-pure-bun-no-node.md) | Pure Bun; no Node runtime, no Python shipped; shell only as glue | accepted |
| [002](ADR-002-distribution-curl-one-liner.md) | Distribution: `curl … \| sh` shim → compiled binary from GitHub Releases | accepted |
| [003](ADR-003-vendored-clack.md) | `@clack/*` vendored from `main` for `completeOnTab` | accepted (revisit when npm > 1.7.0 / > 1.4.3) |
| [004](ADR-004-repo-structure-and-tests.md) | Single package, feature-first `src/items/**`, sibling `__tests__/` | accepted |
| [005](ADR-005-three-stage-workflow.md) | Decide → Build → Connect; nothing touches the system before confirm; connect runs automatically; re-run converges | accepted (rev. 2026-08-30) |
| [006](ADR-006-everything-toggleable-requires-cascade.md) | Every shown item toggleable; safety from the requires-cascade (detect+lock is dead) | accepted |
| [007](ADR-007-manifest-journal-item-architecture.md) | Manifest (decisions) + journal (execution truth) + one module per item; toposorted; failure policy | accepted |
| [008](ADR-008-secrets-age-encrypted-in-repo.md) | Secrets: age-encrypted file committed to the public repo; one passphrase | accepted |
| [009](ADR-009-github-auth-and-signing.md) | Own OAuth-app device flow right after confirm; two per-machine SSH keys; SSH commit signing; noreply email | accepted |
| [010](ADR-010-reset-on-drift-config-model.md) | Config model: reset-on-drift, selection is consent, no conflict checking | accepted (supersedes conflict-consent) |
| [011](ADR-011-install-method-per-tool.md) | Install method chosen per tool from official docs; transitive prerequisites auto-installed | accepted |
| [012](ADR-012-per-item-zsh-contributions.md) | Shell config: per-item `zsh()` contributions assembled into one managed block | accepted |
| [013](ADR-013-claude-code-format-hook-installed-by-cli.md) | Claude Code auto-format hook installed by the CLI (FileChanged), not a repo hook | accepted |
| [014](ADR-014-terminal-input-in-process-dev-tty.md) | Prompt input: open `/dev/tty` in-process and pass it to every prompt | accepted |
| [015](ADR-015-chrome-web-apps-ax-automation.md) | Chrome web apps via Accessibility automation + filename rename; no enterprise policy | accepted |
| [016](ADR-016-dev-tooling.md) | Biome + markdownlint-cli2 + lefthook + git-cliff + CI with gitleaks, all no-Node | accepted |
| [017](ADR-017-docs-system.md) | Docs system: OVERVIEW · sessions · plan · analysis · decisions; kept current continuously | accepted |

## Rules

- **One decision per file**, `ADR-NNN-kebab-title.md`, numbered sequentially; never renumber.
- **Lifecycle**: proposed → accepted → superseded by / deprecated. Don't delete old ADRs; a changed
  decision gets a new ADR that references the old one, and the old one's status line points
  forward.
- **Write the ADR in the same PR as the change that makes the decision** (CLAUDE.md hard rule:
  docs are never deferred). Cite the session entry (sha) and the analysis that informed it.
- **Product-level choices** (which apps, which settings values) live in
  [../plan/PRD-001-envsetup.md](../plan/PRD-001-envsetup.md); ADRs are for decisions with alternatives and consequences.
- **Produced with** the `documentation-and-adrs` skill (template below) — or `grill-with-docs`
  when a design needs to be interrogated first; it writes ADRs as it goes.

## Template

```markdown
# ADR-NNN: <Decision as a statement>

## Status
Accepted | Proposed | Superseded by ADR-XXX | Deprecated

## Date
YYYY-MM-DD (session entry `<sha>`)

## Context
The problem, the constraints, what forced a choice. Link the analysis that informed it.

## Decision
What we do, in one or two paragraphs. Concrete.

## Alternatives considered
### <Alternative>
- Pros / Cons / Rejected because …

## Consequences
What follows — positive, negative, and what must now be true elsewhere (items, docs, CI).
```
