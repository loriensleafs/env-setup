# docs — the docs system (ADR-017)

`OVERVIEW.md` is the map and the status page; every subdirectory's `README.md` is that directory's
purpose, index, rules and template — there is no `docs/README.md` by design. Every file is
`<TYPE>-<NNN>-<kebab-title>.md`.

- Adding a file: read the subdirectory's README, use its template, take the next number, add the
  index row.
- After any move or rename: `bun docs/.claude/skills/run-docs/link-check.ts` — relative links break
  silently (it caught three the first time). `/run-docs` also lints; pass a subdirectory to scope it.
