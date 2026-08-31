---
name: run-docs
description: Lint and link-check the docs system (OVERVIEW, sessions, plan, analysis, decisions, archive). Use when asked to check, lint, validate, verify links in, or run the docs.
---

`docs/` is the documentation system (ADR-017): OVERVIEW + `sessions/` `plan/` `analysis/` `decisions/`
`archive/`, all named `<TYPE>-<NNN>-<kebab-title>.md`. "Running" it means proving every relative
link resolves and every file lints — driven by `docs/.claude/skills/run-docs/link-check.ts`.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path) — the link checker

```bash
bun docs/.claude/skills/run-docs/link-check.ts            # docs/** + CLAUDE.md, README.md, CONTRIBUTING.md
```

Expected:

```text
41 files, 135 relative links, 0 broken
```

Exit 1 lists each `broken: <file> → <target>`. Limit to one directory with an argument:

```bash
bun docs/.claude/skills/run-docs/link-check.ts docs/decisions   # → 18 files, 25 relative links, 0 broken
```

## Lint

```bash
bunx markdownlint-cli2 "docs/**/*.md"      # → Linting: 43 files … Summary: 0 issues in 0 files
bun run check                              # the full gate (Biome + tsc + markdownlint), CI/pre-push
```

## Session log

```bash
bun run session -- --check                 # → session: complete
```

Each subdirectory has its own skill (`/run-docs-decisions`, `/run-docs-analysis`, `/run-docs-plan`,
`/run-docs-sessions`, `/run-docs-archive`) that runs the same two checks scoped to it.

## Gotchas

- **The first run found 3 broken links** (two in `docs/archive/ARC-001-living-plan.md` whose relative
  links broke when the file moved, one in `README.md` from a rename) — fixed. Run the checker after
  any move or rename.
- markdownlint's config (`.markdownlint-cli2.jsonc`) relaxes MD013/MD025/MD033/MD041/MD049 for long-form
  docs; `CHANGELOG.md`, `vendor/`, `dist/` are ignored.
- `bun run session -- --new <slug>` creates a file — do not run it as a test.
