# 2026-08-30 22:40 · Session skill follow-ups — injection verified, iteration 4, plugin-kit fixes

- Goal: Close what SES-004 left open: verify the `!` injection in a real conversation, measure the transcript-evidence expectations (iteration 4), and land the plugin-kit eval-tooling fixes.
- Status: open
- Plan: —
- Outcome: _(fill in)_
- Open at end: plugin-kit branch `fix/eval-tooling` @ b0d4411 is local — the push is refused until acmelabs-15 grants the GitHub CLI OAuth app (`gh api user/orgs` must list the org); then push, `gh pr create`, merge. The tightened join wording is unmeasured (iteration 5 when the next skill change lands). SES-005 belongs to the rehydration conversation of 19:25; close it by hand if that conversation is over.

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

### 2026-08-30 · eval(session): iteration 4 — transcript-evidence expectations measured; join rule tightened · 20448af

- Summary: Iteration 4 of the eval loop: the transcript-evidence expectations measured (with_skill 25/27 vs 23/27), the skill's join rule tightened from the one with-skill miss, eval 1's stale expectation texts reworded, two PRD-001 defects the run found fixed.
- Why: Peter: measure the new expectations. The one with-skill miss (joining a rehydration-titled session another conversation owns, for a question) exposed a wording gap in step 6.
- Files:
  - `.claude/skills/session/SKILL.md` (+5/−2) — step-6 join rule: only a session this conversation will record into; an owned session is never joined; a question that changes nothing is none
  - `.claude/skills/session/evals/evals.json` (+2/−2) — eval 1 expectations 4 and 6 reworded: question + no change → none, an owned session is never joined; name every open session and SES-005's ownership
  - `.claude/skills/session/evals/results/iteration-4/benchmark.json` (+497/−0) — aggregate: with_skill 94% vs old_skill 83%, +16 s, +1,050 tokens
  - `.claude/skills/session/evals/results/iteration-4/benchmark.md` (+13/−0) — aggregate: with_skill 94% vs old_skill 83%, +16 s, +1,050 tokens
  - `.claude/skills/session/evals/results/iteration-4/end-close/eval_metadata.json` (+14/−0) — eval end-close: prompt + the expectations graded this iteration (transcript-evidence added)
  - `.claude/skills/session/evals/results/iteration-4/end-close/old_skill/grading.json` (+148/−0) — 66b083d skill (baseline), end-close: grader verdict 5/7 — failed: reply.md is at most 60 words and states what shipp; Every read, review or verification that the sessio
  - `.claude/skills/session/evals/results/iteration-4/end-close/old_skill/outputs/git-state.txt` (+58/−0) — 66b083d skill (baseline), end-close output — HEAD, status, log, session list/close/check output at the end of the run
  - `.claude/skills/session/evals/results/iteration-4/end-close/old_skill/outputs/overview.diff` (+1/−0) — 66b083d skill (baseline), end-close output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end
  - `.claude/skills/session/evals/results/iteration-4/end-close/old_skill/outputs/reply.md` (+2/−0) — 66b083d skill (baseline), end-close output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-4/end-close/old_skill/outputs/session-file.md` (+22/−0) — 66b083d skill (baseline), end-close output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-4/end-close/old_skill/outputs/transcript.md` (+21/−0) — 66b083d skill (baseline), end-close output — the run's own step-by-step account
  - `.claude/skills/session/evals/results/iteration-4/end-close/old_skill/timing.json` (+1/−0) — 66b083d skill (baseline), end-close: 81,466 tokens, 125.4 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-4/end-close/with_skill/grading.json` (+134/−0) — current skill, end-close: grader verdict 7/7
  - `.claude/skills/session/evals/results/iteration-4/end-close/with_skill/outputs/git-state.txt` (+53/−0) — current skill, end-close output — HEAD, status, log, session list/close/check output at the end of the run
  - `.claude/skills/session/evals/results/iteration-4/end-close/with_skill/outputs/overview.diff` (+1/−0) — current skill, end-close output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end
  - `.claude/skills/session/evals/results/iteration-4/end-close/with_skill/outputs/reply.md` (+2/−0) — current skill, end-close output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-4/end-close/with_skill/outputs/session-file.md` (+24/−0) — current skill, end-close output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-4/end-close/with_skill/outputs/transcript.md` (+18/−0) — current skill, end-close output — the run's own step-by-step account
  - `.claude/skills/session/evals/results/iteration-4/end-close/with_skill/timing.json` (+1/−0) — current skill, end-close: 82,877 tokens, 109.7 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-4/end-leave/eval_metadata.json` (+12/−0) — eval end-leave: prompt + the expectations graded this iteration (transcript-evidence added)
  - `.claude/skills/session/evals/results/iteration-4/end-leave/old_skill/grading.json` (+127/−0) — 66b083d skill (baseline), end-leave: grader verdict 3/5 — failed: reply.md is at most 60 words, states what shipped ; Every read, review or verification that the sessio
  - `.claude/skills/session/evals/results/iteration-4/end-leave/old_skill/outputs/git-state.txt` (+47/−0) — 66b083d skill (baseline), end-leave output — HEAD, status, log, session list/close/check output at the end of the run
  - `.claude/skills/session/evals/results/iteration-4/end-leave/old_skill/outputs/overview.diff` (+34/−0) — 66b083d skill (baseline), end-leave output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end
  - `.claude/skills/session/evals/results/iteration-4/end-leave/old_skill/outputs/reply.md` (+2/−0) — 66b083d skill (baseline), end-leave output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-4/end-leave/old_skill/outputs/session-file.md` (+13/−0) — 66b083d skill (baseline), end-leave output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-4/end-leave/old_skill/outputs/transcript.md` (+22/−0) — 66b083d skill (baseline), end-leave output — the run's own step-by-step account
  - `.claude/skills/session/evals/results/iteration-4/end-leave/old_skill/timing.json` (+1/−0) — 66b083d skill (baseline), end-leave: 86,650 tokens, 132.7 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-4/end-leave/with_skill/grading.json` (+132/−0) — current skill, end-leave: grader verdict 5/5
  - `.claude/skills/session/evals/results/iteration-4/end-leave/with_skill/outputs/git-state.txt` (+50/−0) — current skill, end-leave output — HEAD, status, log, session list/close/check output at the end of the run
  - `.claude/skills/session/evals/results/iteration-4/end-leave/with_skill/outputs/overview.diff` (+33/−0) — current skill, end-leave output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end
  - `.claude/skills/session/evals/results/iteration-4/end-leave/with_skill/outputs/reply.md` (+2/−0) — current skill, end-leave output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-4/end-leave/with_skill/outputs/session-file.md` (+22/−0) — current skill, end-leave output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-4/end-leave/with_skill/outputs/transcript.md` (+29/−0) — current skill, end-leave output — the run's own step-by-step account
  - `.claude/skills/session/evals/results/iteration-4/end-leave/with_skill/timing.json` (+1/−0) — current skill, end-leave: 88,449 tokens, 156.7 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-4/feedback.json` (+45/−0) — Peter's review: eight runs, no feedback (submitted with the dialog held open; read before the viewer stopped)
  - `.claude/skills/session/evals/results/iteration-4/notes.json` (+12/−0) — analyst pass: the attribution expectation discriminates both ways; the join miss; clean harness; graders' standing asks
  - `.claude/skills/session/evals/results/iteration-4/record-commit/eval_metadata.json` (+14/−0) — eval record-commit: prompt + the expectations graded this iteration (transcript-evidence added)
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/grading.json` (+134/−0) — 66b083d skill (baseline), record-commit: grader verdict 7/7
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/outputs/commit.diff` (+131/−0) — 66b083d skill (baseline), record-commit output — `git show HEAD` at the end
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/outputs/git-state.txt` (+13/−0) — 66b083d skill (baseline), record-commit output — HEAD, status, log, session list/close/check output at the end of the run
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/outputs/overview.diff` (+30/−0) — 66b083d skill (baseline), record-commit output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/outputs/reply.md` (+20/−0) — 66b083d skill (baseline), record-commit output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/outputs/session-file.md` (+42/−0) — 66b083d skill (baseline), record-commit output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/outputs/transcript.md` (+29/−0) — 66b083d skill (baseline), record-commit output — the run's own step-by-step account
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/outputs/verify.txt` (+34/−0) — 66b083d skill (baseline), record-commit output — captured stdout of the fix's verification commands (new this iteration)
  - `.claude/skills/session/evals/results/iteration-4/record-commit/old_skill/timing.json` (+1/−0) — 66b083d skill (baseline), record-commit: 98,776 tokens, 200.6 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/grading.json` (+139/−0) — current skill, record-commit: grader verdict 7/7
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/outputs/commit.diff` (+122/−0) — current skill, record-commit output — `git show HEAD` at the end
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/outputs/git-state.txt` (+13/−0) — current skill, record-commit output — HEAD, status, log, session list/close/check output at the end of the run
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/outputs/overview.diff` (+28/−0) — current skill, record-commit output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/outputs/reply.md` (+20/−0) — current skill, record-commit output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/outputs/session-file.md` (+30/−0) — current skill, record-commit output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/outputs/transcript.md` (+64/−0) — current skill, record-commit output — the run's own step-by-step account
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/outputs/verify.txt` (+54/−0) — current skill, record-commit output — captured stdout of the fix's verification commands (new this iteration)
  - `.claude/skills/session/evals/results/iteration-4/record-commit/with_skill/timing.json` (+1/−0) — current skill, record-commit: 107,227 tokens, 206.9 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-4/start-brief/eval_metadata.json` (+15/−0) — eval start-brief: prompt + the expectations graded this iteration (transcript-evidence added)
  - `.claude/skills/session/evals/results/iteration-4/start-brief/old_skill/grading.json` (+144/−0) — 66b083d skill (baseline), start-brief: grader verdict 8/8
  - `.claude/skills/session/evals/results/iteration-4/start-brief/old_skill/outputs/brief.md` (+9/−0) — 66b083d skill (baseline), start-brief output — the brief the run posted
  - `.claude/skills/session/evals/results/iteration-4/start-brief/old_skill/outputs/git-state.txt` (+32/−0) — 66b083d skill (baseline), start-brief output — HEAD, status, log, session list/close/check output at the end of the run
  - `.claude/skills/session/evals/results/iteration-4/start-brief/old_skill/outputs/session-file.md` (+1/−0) — 66b083d skill (baseline), start-brief output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-4/start-brief/old_skill/outputs/transcript.md` (+70/−0) — 66b083d skill (baseline), start-brief output — the run's own step-by-step account
  - `.claude/skills/session/evals/results/iteration-4/start-brief/old_skill/timing.json` (+1/−0) — 66b083d skill (baseline), start-brief: 191,675 tokens, 206.8 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-4/start-brief/with_skill/grading.json` (+169/−0) — current skill, start-brief: grader verdict 6/8 — failed: The brief's Session line states one of the three o; brief.md reports the state of the tree and the ses
  - `.claude/skills/session/evals/results/iteration-4/start-brief/with_skill/outputs/brief.md` (+8/−0) — current skill, start-brief output — the brief the run posted
  - `.claude/skills/session/evals/results/iteration-4/start-brief/with_skill/outputs/git-state.txt` (+34/−0) — current skill, start-brief output — HEAD, status, log, session list/close/check output at the end of the run
  - `.claude/skills/session/evals/results/iteration-4/start-brief/with_skill/outputs/session-file.md` (+12/−0) — current skill, start-brief output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-4/start-brief/with_skill/outputs/transcript.md` (+49/−0) — current skill, start-brief output — the run's own step-by-step account
  - `.claude/skills/session/evals/results/iteration-4/start-brief/with_skill/timing.json` (+1/−0) — current skill, start-brief: 184,213 tokens, 255.3 s (from the subagent's completion notification)
  - `docs/plan/PRD-001-envsetup.md` (+2/−2) — ARC-001 link now points at archive/; the retired scripts/ entry removed from the structure line (both found by the iteration-4 with_skill start-brief run)
- Notes: Verified: every grade re-run against its fixture by the grader; fixtures fully recorded this time (no swept-in skeletons); Peter's review read from feedback.json with status complete before the viewer was stopped. Not verified: the tightened join wording (edited after the run). Open: the graders' standing asks — name the word-count method for the 60-word cap, capture a raw tool log, an OVERVIEW-upkeep expectation on end/close, a handoff-accounts-for-the-commit expectation.
