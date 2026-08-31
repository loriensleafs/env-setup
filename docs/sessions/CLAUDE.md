# docs/sessions — the session log

Driven by the `/session` skill (`start` joins or opens → `entry` after every commit → `end` to
leave, `close` when the Goal is done); by hand, `README.md` has the rules and the template.

Invariant: `bun run session` owns the numbering, the order, the status line and the release
markers — hands fill the placeholders and write the Narrative, never renumber, reorder or append
to a closed session. The session log holds value only (ADR-021): a fix-up gets no entry (its parent's
`Also:` line vouches for it) and a valueless commit says so with `Session-entry: none`. A session is a stream of work, not a conversation (ADR-020); another
conversation's open session is never edited to make a gate green. Rules, index and template:
`README.md`.
