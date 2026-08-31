# 2026-08-30 21:43 · closing eval

- Goal: Review the docs system end to end and fix anything stale.
- Status: closed
- Plan: —
- Outcome: The docs system was reviewed end to end (OVERVIEW, the sessions index and open sessions, CONTEXT.md, the session skill and its nested CLAUDE.md) and nothing stale was found; no code or doc change was needed and none was made. At close, `bun run session append` surfaced one unrecorded commit, `66b083d` (the ADR-020 session model, made before this session opened); its entry is recorded here from `git show`, with the session-lib tests (13 pass) and the tool's `list` / `append --session` / `check` / `close` subcommands exercised as verification. No release, no PR.
- Open at end: `66b083d` belongs to the session-model stream OVERVIEW Status credits to SES-004, but is recorded in this session because the tool appended it here at close — SES-004's conversation may want to cite it from its Narrative. This checkout is on branch `feat/session-model` (not `main`); `origin` is a local path, so `gh pr list` was skipped. SES-004 and SES-005 stay open and untouched, for their own conversations.

## Narrative

Peter asked for the docs system to be reviewed end to end and anything stale fixed. The review
read OVERVIEW, `docs/sessions/README.md` and its index, this session, the `/session` skill and its
nested `CLAUDE.md`, and found nothing to change — no commit was made toward the Goal, so the
review itself leaves no entry. Peter then said the review found nothing to fix and asked to close
the session.

At close, `bun run session append --session SES-006` did not print `up to date`: it appended a
skeleton for `66b083d` — a commit no session recorded, made at 21:42 by the session-model stream,
one minute before this session opened (`3e94d4f`). Per the skill that is a finding, not a fix:
the entry below is filled from `git show 66b083d` and the commit message; what could be verified
cheaply was (the 13 `session-lib` tests pass; `list`, `append --session`, `check` and `close`
behave as the message says), and the rest is marked unverified in its Notes. Nothing in SES-004
or SES-005 was edited. OVERVIEW Status and Next up already describe reality (the session model
bullet is there; SES-006 is never named), so OVERVIEW is unchanged. `Plan:` is `—`, so no plan
to update.

## Changes (one entry per commit, in order)

### 2026-08-30 · feat(session): sessions are streams of work with status; tool moves into the skill as a subcommand CLI · 66b083d

- Summary: Implements ADR-020 — a session becomes a bounded stream of work with `Status: open | closed` and a `Plan:` line, spanning conversations. The session tool moves from `scripts/` into the skill as a subcommand CLI (`list`, `new`, `append`, `check`, `close`, `current`, all with `--session`) with its pure half split into `session-lib.ts` under test; the skill gains a `close` mode (`end` = leave) and its `/session-close` alias; every doc that described the old flag spellings or "the newest session" is rewritten; SES-001…003 are marked closed.
- Why: The old model tied one session to one conversation, so a second conversation on the same work had to open a new file and the tool guessed "the newest" — ADR-020 records the decision to make a session a stream of work instead. Not this conversation's commit (see Notes).
- Files:
  - `.claude/commands/session-close.md` (+9/−0) — new typed-only alias for `/session close` (`disable-model-invocation: true`) that invokes the skill in `close` mode
  - `.claude/commands/session-end.md` (+1/−1) — description now says `end` = leave: handoff in Open at end, session stays open
  - `.claude/commands/session-start.md` (+1/−1) — description now says `start` joins the open session, opens one, or states none
  - `.claude/skills/run-envsetup/SKILL.md` (+1/−1) — gate example becomes `bun run session check --session SES-NNN` and points to `/run-session-tool`
  - `.claude/skills/run-session-tool/SKILL.md` (+58/−0) — new run skill for the relocated session tool (replaces `/run-scripts`)
  - `.claude/skills/session/CLAUDE.md` (+15/−0) — new nested CLAUDE.md: tool invariants (skips `docs(session)`/`docs(ledger)`, `--no-renames`, target = named session else the single open one, `close` runs the gate and alone counts Outcome / Open at end)
  - `.claude/skills/session/SKILL.md` (+115/−61) — `start` joins / opens / states none (Session line in the brief); `end` = leave; new `close` mode; injected sessions `list` line; `allowed-tools` gains `git show` and `gh pr list`; every `bun run session` takes `--session`
  - `.claude/skills/session/evals/evals.json` (+11/−10) — expectations updated for the join/open Session line, subcommand spellings, and eval 3 reworded so `close` is what is measured; iteration-3 note added
  - `.claude/skills/session/scripts/__tests__/session-lib.test.ts` (+132/−0) — 13 tests for header parsing, session selection and the status edit (verified: 13 pass, 0 fail)
  - `.claude/skills/session/scripts/session-lib.ts` (+131/−0) — new pure half of the tool: header parsing (`Status:`, `Plan:`), selection by `--session` or the single open session, the `Status: closed` edit
  - `.claude/skills/session/scripts/session.ts` (+339/−0) — the tool, moved here from `scripts/session.ts` and reshaped into subcommands (`list`, `new <slug> [--plan]`, `append`, `check`, `close`, `current`); old `--flag` spellings still parse
  - `CLAUDE.md` (+22/−16) — Rehydrating reads every open session and joins/opens/states none; Recording gains `close`; command block lists the subcommands
  - `CONTEXT.md` (+28/−9) — new "The session log" section defining Session, Conversation, Open / Closed (with words to avoid); Reset and Shell block moved up under config
  - `CONTRIBUTING.md` (+15/−9) — step 1 joins or opens a session; step 7 uses the subcommand spellings and names `/session end` (leave) vs `/session close`; release step 6 uses `bun run session check`
  - `README.md` (+3/−3) — working-on-it line and the `bun run session` table row name the subcommands and `close`
  - `docs/OVERVIEW.md` (+15/−8) — docs table rows for the skill and `sessions/` describe the session model; nested-CLAUDE.md row lists `.claude/skills/session/` instead of `scripts/`; Status gains the "Session model (ADR-020)" bullet and ADR-001…020; resume step 2 joins or opens a session
  - `docs/decisions/ADR-018-nested-claude-md-placement.md` (+3/−1) — notes `scripts/` retired with ADR-020 and its invariants moved to the skill's CLAUDE.md
  - `docs/decisions/ADR-019-session-skill-invocation-and-name.md` (+4/−1) — status note: revised by ADR-020 (`end` = leave, fourth mode `close`)
  - `docs/decisions/ADR-020-session-model.md` (+81/−0) — new ADR: a session is a stream of work with status and a plan line, not a conversation
  - `docs/decisions/README.md` (+2/−1) — ADR-019 row mentions `close`; ADR-020 row added
  - `docs/plan/README.md` (+3/−0) — rule: plans and sessions point at each other (`Plan:` line ↔ ticks citing shas)
  - `docs/sessions/CLAUDE.md` (+6/−4) — invariant now covers the status line and never appending to a closed session or editing another conversation's session
  - `docs/sessions/README.md` (+44/−23) — session-as-stream definition, join-or-open rule, own-session-by-name, leave vs close, template gains `Status:` and `Plan:`
  - `docs/sessions/SES-001-foundation.md` (+1/−0) — `Status: closed` added
  - `docs/sessions/SES-002-curl-sh-interactivity-and-first-bootstrap-fixes.md` (+1/−0) — `Status: closed` added
  - `docs/sessions/SES-003-real-bootstrap-runs-v0.1.5-to-v0.1.9.md` (+1/−0) — `Status: closed` added
  - `docs/sessions/SES-004-docs-rehydration.md` (+2/−0) — `Status: open` and `Plan: —` added
  - `package.json` (+2/−2) — `session` script points at `.claude/skills/session/scripts/session.ts`; `test` also runs the session-lib tests by path (bun test skips dot-directories)
  - `scripts/.claude/skills/run-scripts/SKILL.md` (+0/−36) — removed with the directory (superseded by `/run-session-tool`)
  - `scripts/CLAUDE.md` (+0/−9) — removed with the directory
  - `scripts/session.ts` (+0/−294) — removed; moved into the skill
- Notes: Not this conversation's commit — it was made by the session-model stream before SES-006 opened and no session had recorded it; the tool appended it here at close and the skill treats that as a finding. Filled from `git show 66b083d` and its message. Verified here: `bun test ./.claude/skills/session/scripts/__tests__/session-lib.test.ts` → 13 pass, 0 fail; `bun run session list` shows status per session; `append --session SES-006` targets the named session; `check` and `close` as recorded in this session's Outcome. Not verified here: the `/session-close` alias in a real conversation, `new --plan`, `bun run check`, and the evals.json changes.
