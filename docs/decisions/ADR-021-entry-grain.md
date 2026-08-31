# ADR-021: The ledger holds value only — one entry per change worth reading about, and every commit still accounted for

## Status

Accepted

## Date

2026-08-30 (session SES-006)

## Context

ADR-017's tool derives entries from `git log`: one skeleton per commit, and the gate fails while
any commit on `main` has none. That is what makes recording enforceable — git is the oracle — and
it made the grain of an entry a commit's. Peter challenged that: "Does it make sense for an entry
to be tied to a commit? … I don't think [a commit with no value] should have any entry — the
whole point of this session ledger is so that a conversation can rehydrate its context by looking
back through the ledger, so it's important that only things of value get put there." SES-004's
27 entries bear it out: several are fix-ups whose Summary and Why say nothing a reader wants, and
a formatting pass got a block of its own.

## Decision

- **An entry is the block a change worth reading about gets.** Summary, Why, one phrase per
  touched file, Notes — as before, written right after the commit.
- **A fix-up gets no entry.** The entry it belongs to vouches for it with a line
  `- Also: <sha> — <what it fixed>` under its `Why`; the tool reads those shas as accounted for,
  and the skeleton it appended for the fix-up is deleted.
- **A commit with nothing to record gets no entry either**, and says so itself: the trailer
  `Session-entry: none` in its message (`git commit -m "…" -m "Session-entry: none"`). The tool
  skips it the way it skips `docs(session)` commits. The decision that a commit has no value is
  the author's, taken at commit time, recorded where it cannot be forgotten; a valueless commit
  already pushed without the trailer is vouched for by its nearest parent entry.
- **The mechanical gate stays.** Every commit on `main` resolves to an entry heading, an `Also:`
  line, or a trailer; `check` fails otherwise. The sha remains the join key to `git show`.

## Alternatives considered

### One entry per PR (merge commit), commits listed inside

- Pros: matches how PRs merge; fewer blocks. Cons: recording moves to "before the PR opens" — a
  batch, the deferral ADR-017 exists to prevent; a branch worked by two conversations gets one
  entry two people wrote; commits outside a PR need a second rule. Rejected.

### Entries independent of git (decisions, findings)

- Pros: reads like a narrative. Cons: nothing to diff the ledger against, which is how the
  pre-tool ledger drifted; the Narrative already holds this. Rejected.

### A one-line entry for every valueless commit (`Nothing to record: …`)

- Pros: every sha visible in the file. Cons: Peter's point — a line that says "nothing here" is
  still noise in the thing a conversation reads to rehydrate. Rejected in favour of the trailer.

## Consequences

- `session-lib.ts` gains `knownShas` (headings + `Also:` lines) and `declinesEntry` (the trailer);
  `session.ts` reads commit bodies and applies both; tests cover both.
- `docs/sessions/README.md` (rules, template `Also:` line), `CONTEXT.md` (Entry), CLAUDE.md,
  CONTRIBUTING and the `/session` skill's `entry` step say the same thing.
- The eval `record-commit` still expects a full entry: the fix it records is a real change.
