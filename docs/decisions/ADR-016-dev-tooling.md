# ADR-016: Dev tooling — Biome, markdownlint-cli2, lefthook, git-cliff, CI with gitleaks; all without Node

## Status

Accepted

## Date

2026-08-26

## Context

Peter asked for autofix scripts, a commit pipeline (Husky researched), typechecking, markdown
linting with autofix, a changelog, and a secrets scan — all under the pure-Bun rule (ADR-001).

## Decision

- **Biome** (`biome.json`: 2-space, double quotes, semicolons, trailing commas, lineWidth 100,
  preset `recommended`; `noControlCharactersInRegex` off for ANSI stripping) formats + lints
  JS/TS/JSON. **markdownlint-cli2** (`.markdownlint-cli2.jsonc`, long-form-docs rules relaxed:
  MD013/MD025/MD033/MD041/MD049) lints Markdown; `CHANGELOG.md`, `vendor/`, `dist/` ignored.
- **lefthook** (Go binary; installed by the `prepare` script): pre-commit auto-fixes staged files
  (Biome + markdownlint, `stage_fixed`) and runs `tsc --noEmit`, blocking only on un-auto-fixable
  lint/type errors; pre-push runs the full check + `bun test`.
- **git-cliff** (`cliff.toml`, Keep a Changelog + SemVer) generates `CHANGELOG.md` from
  conventional commits (`bun run changelog -- --tag vX.Y.Z` at release time).
- **CI** `.github/workflows/ci.yml` on macos-14 mirrors the hooks (Biome + tsc + markdownlint +
  tests) plus a **gitleaks** job. `release.yml` on `v*` tags (ADR-002).
- Umbrella scripts: `bun run check` (the gate), `bun run fix`, `bun run test`, `bun run compile`,
  `bun run session` (ADR-017).

## Alternatives considered

### Husky + lint-staged

- Rejected: Node-runtime hooks; lefthook is a native binary with the same model.

### ESLint + Prettier

- Rejected: two Node tools where Biome is one native binary.

## Consequences

- `bun run check` must pass before finishing code (CLAUDE.md); PRs are merged with merge commits
  so session-log shas stay valid (ADR-017).
