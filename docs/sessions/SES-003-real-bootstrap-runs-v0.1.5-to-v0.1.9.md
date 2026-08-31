# 2026-08-30 17:26 · Real bootstrap runs on Peter's machine; UX directives (v0.1.5–v0.1.9)

- Goal: Iterate on Peter's real runs until the bare command converges with 0 failures, and fold in his UX directives.
- Outcome: v0.1.5–v0.1.9; machine converged ('all done', 0 failed). No separate `connect` needed (auto connect phase + finishing pass); re-running bare `envsetup` picks up missing pieces (journal-driven retry, manifest prefill); config screens are one clack group per item with clack-faithful radio frames.
- Open at end: Visual grouping between item config groups + overall progress tracker (designed, not built); first end-to-end connect phase never exercised; compiled idle-CPU spin.

## Narrative

Peter ran the one-liner repeatedly and drove the fixes: "Chrome is running" failure → ask-to-quit
(`ctx.ask`, AppleScript quit, reopen) in v0.1.5; "I don't see any of the Chrome apps in the dock" →
ceremony-only items had been reported as installed → `deferred` outcome, "attended step" label
(v0.1.6); "Shouldn't have to pass the word connect… should just happen as part of that
installation phase" and "not convinced we should need to use sync… run the command again… pick
up the missing pieces" → `src/ceremonies/connect-phase.ts` runs automatically after install, a
finishing pass re-executes, the journal's `failedSteps` pre-check "failed last run — retry", and
identity prompts prefill from the prior manifest (v0.1.7); "I'd like them displayed rendered as a
group clack group" → config screens as `p.group` (v0.1.8) — "Still seems to be doing this as a
not a clack group" because the custom `radioGroup` always drew `└` → state-aware render, PTY-verified
(v0.1.9, `2384b88`). Peter's final directive of the run: visual grouping between item config groups
plus an overall progress tracker — design captured in OVERVIEW "Next up" 1, patch parked on local
branch `wip/visual-grouping` (unverified).

## Changes (one entry per commit, in order)

### 2026-08-30 · feat: chrome-config asks to quit Chrome, then edits and reopens it · 1eb01fd

- Files:
  - `src/commands/bootstrap.ts` (+20/−1)
  - `src/items/chrome/chrome-config.ts` (+25/−2)
  - `src/items/item.ts` (+6/−0)
  - `src/orchestrator/orchestrator.ts` (+8/−1)

### 2026-08-30 · chore(release): v0.1.5 · 1bdb147

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

> **Released v0.1.5** — tag on this commit.

### 2026-08-30 · fix: label ceremony-only items as attended steps, not 'installed' · 04ea640

- Files:
  - `src/commands/bootstrap.ts` (+10/−1)
  - `src/orchestrator/orchestrator.ts` (+13/−0)

### 2026-08-30 · chore(release): v0.1.6 · eab7d36

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

> **Released v0.1.6** — tag on this commit.

### 2026-08-30 · feat: the one command finishes the job — auto connect phase, journal-driven retry · 2f79bb9

- Files:
  - `README.md` (+3/−3)
  - `src/ceremonies/connect-phase.ts` (+67/−0)
  - `src/commands/__tests__/bootstrap-presentation.test.ts` (+6/−0)
  - `src/commands/bootstrap.ts` (+35/−16)
  - `src/commands/connect.ts` (+9/−35)

### 2026-08-30 · chore(release): v0.1.7 · 7e100c5

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

> **Released v0.1.7** — tag on this commit.

### 2026-08-30 · feat: render each item's config screen as one clack group · 361771b

- Files:
  - `src/ui/config-screens.ts` (+51/−38)

### 2026-08-30 · chore(release): v0.1.8 · 8f923db

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

> **Released v0.1.8** — tag on this commit.

### 2026-08-30 · fix: radio prompt flows inside a clack group (state-aware frame) · 9c6446e

- Files:
  - `src/ui/radio-group.ts` (+24/−8)

### 2026-08-30 · chore(release): v0.1.9 · 2384b88

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

> **Released v0.1.9** — tag on this commit.
