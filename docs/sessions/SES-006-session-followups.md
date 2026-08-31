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
