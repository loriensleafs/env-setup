# docs — the docs system (ADR-017); each directory's README is its rules and template

- Before adding a file here: read that directory's README, use its template, name it
  `<TYPE>-<NNN>-<kebab-title>.md` with the next number, add it to the README index.
- After any move or rename: `bun docs/.claude/skills/run-docs/link-check.ts` (relative links break
  silently; it caught three the first time).
- OVERVIEW "Status" / "Next up" change in the same step as the work they describe, citing the
  session entry's sha.
