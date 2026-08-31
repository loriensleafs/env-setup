# ADR-003: `@clack/*` is vendored from `main` for `completeOnTab`

## Status

Accepted — revisit when npm publishes `@clack/core` > 1.4.3 / `@clack/prompts` > 1.7.0 with
`completeOnTab` (`vendor/README.md` has the swap steps)

## Date

2026-08-26 (third UI feedback round)

## Context

Published `@clack/prompts` 1.7.0 advertises "Tab: complete" in the path prompt, but core's
`completeOnTab` exists only on `main`. Our first fix was a custom path prompt porting the
behaviour; Peter's screenshots showed styling drift because our prompts were full custom renders
instead of extensions of stock ones.

## Decision

Build `@clack/core` and `@clack/prompts` from Peter's clone of clack `main` (2026-08-15) into
`vendor/*.tgz`, pin them in `package.json` (with an `overrides` entry so Bun does not nest the
published core under prompts and break types), delete the custom path prompt, and keep every
custom prompt a faithful extension of the stock one (same render structure, states, footer).
`~/Dev/clack/examples/docs` is the reference for any UI work.

## Alternatives considered

### Keep the custom path prompt on published packages

- Rejected: drifted styling; duplicated upstream logic.

### Fork and publish our own package

- Rejected: more moving parts than two tarballs for a temporary gap.

## Consequences

- Hard rule in CLAUDE.md: never swap to npm until upstream ships `completeOnTab`.
- Custom prompts (`group-multi-select.ts`, `radio-group.ts`) extend `@clack/core` and must accept
  an explicit `input` (ADR-014).
