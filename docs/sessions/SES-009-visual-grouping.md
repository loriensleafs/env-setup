# 2026-08-31 09:49 · Visual grouping of the config flow — the parked patch reviewed, phase markers added, verified under a PTY

- Goal: Land PLAN-001 part 1 — review the parked `wip/visual-grouping` patch (boxed per-item
  header "Configure N of M" in the config screens, `Step n of 5` phase markers in bootstrap),
  decide whether the connect phase counts as step 6, and verify under a PTY with a strong oracle.
- Status: in progress
- Plan: PLAN-001 · part 1
- Outcome: _(fill in)_

## Narrative

Started 2026-08-31 by a headless `/brain:plan PLAN-001` run — acmelabs-15/brain PLAN-001 Part 4's
checkpoint probe, kept as the real thing on Peter's call ("re-run the probe, let the log land") —
the first conversation to take the plan up since the patch was parked on `wip/visual-grouping`
(`10f1e24`, unverified, never run under a PTY). Rehydrated per
the read order; this session started for part 1, which was `planned` with no session serving it.

2026-08-31, the log run for `53f28b3` and `021ff51`: `53f28b3` confirmed as the parked patch
re-applied — the +/− lines of `10f1e24` and `53f28b3` are byte-identical (the wip branch sits on
a pre-docs-system base, so the shas differ). Task 1's acceptance verified here: `bun run check`
exit 0, `bun test` 111 pass / 0 fail on the tree at `021ff51`. Task 2 was decided as the plan
recommended (step 6 only when ceremonies are pending). What remains for part 1 is the PTY
checkpoint; a limit found while recording: the checkpoint's walk stops at the confirm, so it can
assert markers 1–5 and the boxed config frame but never reaches the step-6 connect header.

## Changes (one entry per commit, in order)

### 2026-08-30 · wip: visual grouping of the config flow (unverified — see OVERVIEW Next-up 1) · 53f28b3

- Summary: bootstrap prints a phase marker — bold `Step n of 5 · <title>` via `p.log.step` —
  before each of scan, identity, picker, config screens and review; each config screen opens with
  a boxed `p.note` header "Configure N of M" instead of the plain `p.log.step` title. The parked
  `wip/visual-grouping` patch (`10f1e24`) re-applied onto current `main` — the +/− lines of the
  two commits are byte-identical (verified by diffing the two `git show` outputs).
- Why: in the config screens the last field of one item ran straight into the next item's first
  field; Peter asked for visual grouping between item config groups and an overall progress
  tracker (PLAN-001, PRD UX requirement 4).
- Files:
  - `src/commands/bootstrap.ts` (+11/−2) — a local `phase(n, title)` helper and its five call
    sites; marker 4 prints only when the run has configurable items ("Configure {count} items");
    the config loop now passes `{ index, total }` to `promptItemConfig`.
  - `src/ui/config-screens.ts` (+4/−1) — `promptItemConfig` takes an optional
    `position?: { index; total }` and opens with `p.note(item.title, "Configure N of M")`
    ("Configure" alone without a position) instead of `p.log.step(item.title)`.
- Notes: commit made before this conversation; filled from `git show`. Unverified at commit time
  (its message says so). Verified here: `bun run check` (exit 0) and `bun test` (111 pass, 0
  fail) on the tree at `021ff51` — Task 1's acceptance. Still unverified: the rendered output —
  part 1's PTY checkpoint (strip ANSI, assert the markers and the boxed frame) has not run yet.

### 2026-08-31 · feat(bootstrap): the connect phase announces itself as step 6 when the run has ceremonies — runConnectPhase takes an optional asStep, the bootstrap flow passes 6, the standalone connect command keeps its plain header (PLAN-001 part 1 task 2) · 021ff51

- Summary: in bootstrap the connect phase header becomes `Step 6 · Finishing steps (N) — these
  need you`, printed only when ceremonies are pending; `runConnectPhase` takes an optional
  `asStep`, the bootstrap flow passes 6, the standalone `envsetup connect` passes nothing and
  keeps its plain header. The five phase markers keep "of 5" — step 6 is conditional and carries
  no total.
- Why: PLAN-001 part 1 task 2 asked whether the connect phase counts as step 6; decided yes when
  the run has ceremonies, the plan's own recommendation ("the marker is cheap").
- Files:
  - `src/ceremonies/connect-phase.ts` (+6/−1) — `runConnectPhase` gains the optional `asStep`
    parameter; the header string gets the prefix `Step {asStep} ·` when it is passed.
  - `src/commands/bootstrap.ts` (+1/−1) — `executePlan` passes 6 to `runConnectPhase`.
- Notes: commit made before this conversation; filled from `git show`. Verified here: `bun run
  check` (exit 0) and `bun test` (111 pass, 0 fail) on this tree. The rendered header is
  unverified — the connect phase needs pending ceremonies, which the part-1 PTY checkpoint (a
  walk stopped at the confirm) does not reach; noted as a limit of that checkpoint.
