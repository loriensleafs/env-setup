Recorded — `c99547b`, and the gate prints `session: complete` for SES-006.

**Entry for `e1f2f0b`** in `docs/sessions/SES-006-record-eval.md`: Summary, Why, the per-file line
and Notes, plus Outcome, Open at end and the Narrative.

**Verified rather than copied from the commit message.**
`bun src/items/finder/.claude/skills/run-src-items-finder/driver.ts` now prints
`SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓` — before the commit it printed
`WARNING: assets/set-favorites.swift differs …`; `swiftc -typecheck` passes on both copies (neither
is ever executed — the helper rewrites the real sidebar); `bun test src/items/finder/__tests__`
2 pass / 0 fail; `bun run check` clean.

**Made stale by the fix, updated in the same commit citing `e1f2f0b`:**

- `docs/OVERVIEW.md` — Next up 5 no longer claims the asset is stale (the `hooks-format.ts` half of
  that item stays, untouched); Status gains the unreleased-on-`main` line for the fix.
- `src/items/finder/CLAUDE.md` — the "currently stale" bullet is now the standing rule: runtime
  ships the constant, mirror it into the asset in the same commit.
- `src/items/finder/.claude/skills/run-src-items-finder/SKILL.md` — the skill's expected driver
  output showed the WARNING line as normal; it now shows the ✓ line, and the stale gotcha becomes a
  drift-watch gotcha.

**Two things worth your attention before the PR:**

1. Nothing *enforces* the equality. The driver reports it, it does not gate — which is exactly how
   the two drifted the first time. Left in "Open at end" and as the remaining half of OVERVIEW Next
   up 5 (generate one from the other, or assert equality in `src/items/finder/__tests__/`). Say the
   word and I'll add that test to this PR.
2. The gate warns that `SES-005-rehydration.md` has 2 unfilled placeholders. That is another
   conversation's file — left untouched.

Tree clean on `main`. Nothing pushed, no PR opened.
