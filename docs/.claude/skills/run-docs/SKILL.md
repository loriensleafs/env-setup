---
name: run-docs
description: Lint and link-check the docs system (OVERVIEW, sessions, plan, analysis, decisions, archive). Use when asked to check, lint, validate, verify links in, check retired words in, or run the docs.
---

`docs/` is the documentation system (ADR-017): OVERVIEW + `sessions/` `plan/` `analysis/` `decisions/`
`archive/`, all named `<TYPE>-<NNN>-<kebab-title>.md`. "Running" it means proving every relative
link resolves, every file lints and no retired word is in the live prose — driven by
`docs/.claude/skills/run-docs/link-check.ts` and `avoid-check.ts`.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path) — the link checker

```bash
bun docs/.claude/skills/run-docs/link-check.ts            # docs/** + CLAUDE.md, README.md, CONTRIBUTING.md
```

Expected:

```text
50 files, 136 relative links, 0 broken
```

Exit 1 lists each `broken: <file> → <target>`. Limit to one directory with an argument:

```bash
bun docs/.claude/skills/run-docs/link-check.ts docs/decisions   # → 20 files, 26 relative links, 0 broken
```

## Run (agent path) — retired words (ANA-010)

```bash
bun docs/.claude/skills/run-docs/avoid-check.ts    # CONTEXT.md's "former name" _Avoid_ items against the live prose
```

Expected:

```text
10 files, 1 former names, 0 hits
```

Exit 1 lists each `retired: <file>:<line> "<word>" → say <Term>`. Live prose is CLAUDE.md, README.md,
CONTRIBUTING.md, OVERVIEW, `plan/`, the sessions README outside its generated index, and every `.md`
under `.claude/` and `docs/.claude/`; session files, ADRs and analyses are records and are not
checked; code spans and fenced blocks are skipped. To retire a word, mark it in `CONTEXT.md`:
`_Avoid_: word (former name, …)` — the other `_Avoid_` items restrict a sense and need a reader.

## Run (agent path) — lint

```bash
bunx markdownlint-cli2 "docs/**/*.md"      # the config's own **/*.md glob is added → Linting: 91 files … Summary: 0 issues in 0 files
bun run check                              # the full gate (Biome + tsc + markdownlint), CI/pre-push
```

## Run (agent path) — session log

```bash
bun ~/Dev/ACMElabs/brain/skills/session/scripts/cli.ts check --session SES-NNN    # → session: complete (SES-NNN, in progress)  (the brain plugin's tool)
```

Scope the link check to a subdirectory with the argument above.

## Gotchas

- **The first run found 3 broken links** (two in `docs/archive/ARC-001-living-plan.md` whose relative
  links broke when the file moved, one in `README.md` from a rename) — fixed. Run the checker after
  any move or rename.
- markdownlint's config (`.markdownlint-cli2.jsonc`) relaxes MD013/MD025/MD033/MD041/MD049 for long-form
  docs; `CHANGELOG.md`, `vendor/`, `dist/` are ignored.
- `session new <slug>` (the plugin's tool) creates a file — do not run it as a test.
