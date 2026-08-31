# docs — the docs system (ADR-017)

The map of this directory is `OVERVIEW.md` (read first; it is also the status page). Each
subdirectory's `README.md` is that directory's rules, index and template — there is no separate
`docs/README.md` by design.

- Before adding a file here: read that subdirectory's README, use its template, name it
  `<TYPE>-<NNN>-<kebab-title>.md` with the next number, add it to the README index.
- After any move or rename: `bun docs/.claude/skills/run-docs/link-check.ts` (relative links break
  silently; it caught three the first time).
- OVERVIEW "Status" / "Next up" change in the same step as the work they describe, citing the
  session entry's sha.
