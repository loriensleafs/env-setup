# 2026-08-30 22:40 · Session skill follow-ups — injection verified, iteration 4, plugin-kit fixes

- Goal: Close what SES-004 left open: verify the `!` injection in a real conversation, measure the transcript-evidence expectations (iteration 4), and land the plugin-kit eval-tooling fixes.
- Status: open
- Plan: —
- Outcome: _(fill in)_
- Open at end: _(fill in)_

## Narrative

Peter: do the two open items, and why can't I push to plugin-kit. The `!` injection was probed twice in a
fresh clone of main: `claude -p "/session-start"` (Skill{session,start}) and an interactive session driven
under expect typing `/session-start` — both transcripts show the skill delivered with the three `!` lines
literal, and the model running them itself. So the Skill-tool path never renders the injection; the
gotcha now says so. Iteration 4 runs the four evals with the transcript-evidence expectations (fixtures-5:
clones of main @ 2a815ac; baseline = the 66b083d skill text). plugin-kit: the org has OAuth-app
restrictions and the GitHub CLI app is not granted for acmelabs-15 (`gh api user/orgs` → []), so the push
is refused; branch `fix/eval-tooling` @ b0d4411 stays local.

## Changes (one entry per commit, in order)

### 2026-08-30 · docs(skill): the Skill-tool path never renders the injection — verified interactive; open SES-006 · 631b7f8

- Summary: The injection gotcha states the verified fact — through the Skill tool (model invocation or a `/session-*` alias) the file arrives unrendered, in an interactive session too — and SES-006 opens for this follow-up stream.
- Why: Peter: verify the injection in a real conversation. An interactive `claude` driven under expect (`/session-start` typed) delivered the skill with the three `!` lines literal, same as `claude -p`; SES-004 is closed, so this work needs its own session (ADR-020).
- Files:
  - `.claude/skills/session/SKILL.md` (+5/−3) — gotcha reworded: verified interactive + `-p`; the Skill-tool path never renders the injection
  - `docs/sessions/README.md` (+1/−0) — index row for SES-006 (regenerated)
- Notes: Verified: the interactive transcript at ~/.claude/projects/…inject-probe/5c42ad71….jsonl shows `Skill{session,start}` → skill content with `- Sessions:`!`PATH=… bun run session list …``` literal, then the model's own Bash run of the three commands. Not verified: whether a typed`/session start` (no alias, no Skill tool) renders them — that path expands inline and the transcript does not echo the expanded prompt.
  - `docs/sessions/SES-006-session-followups.md` (+20/−0) — new session: title, Goal, Narrative (the two probes, iteration 4, the plugin-kit push block)
