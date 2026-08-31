# docs/sessions — the session log

Written by the `/brain:session` skill (ADR-024): `start <description> --plan "PLAN-NNN · part N"`
creates a session and marks its plan part → `log` after every commit → `close SES-NNN` when the
Goal is done; a conversation that stops does nothing. By hand, `README.md` has the rules and the template.

Invariant: the `brain` plugin's tool owns the numbering, the order, the status line and the release
markers — hands fill the placeholders and write the Narrative, never renumber, reorder or append
to a done session. The session log holds value only (ADR-021): a fix-up gets no entry (its parent's
`Also:` line vouches for it) and a valueless commit says so with `Session-entry: none`. A session is a stream of work, not a conversation (ADR-020); another
conversation's session in progress is never edited to make a gate green. Rules, index and template:
`README.md`.
