# 2026-08-30 22:40 · Session skill follow-ups — injection verified, iteration 4, plugin-kit fixes

- Goal: Close what SES-004 left open: verify the `!` injection in a real conversation, measure the transcript-evidence expectations (iteration 4), and land the plugin-kit eval-tooling fixes.
- Status: open
- Plan: —
- Outcome: _(fill in)_
- Open at end: plugin-kit PR #1 merged (acmelabs-15/plugin-kit `e4b1a53`) — the fixed viewer, report path, neighbour sweep and aggregator are what the next skill-creator run uses. The tightened join wording and the ADR-021 entry step are unmeasured (iteration 5 with the next skill change). SES-005 belongs to the rehydration conversation of 19:25; close it by hand if that conversation is over.

## Narrative

Peter: do the two open items, and why can't I push to plugin-kit. The `!` injection was probed twice in a
fresh clone of main: `claude -p "/session-start"` (Skill{session,start}) and an interactive session driven
under expect typing `/session-start` — both transcripts show the skill delivered with the three `!` lines
literal, and the model running them itself. So the Skill-tool path never renders the injection; the
gotcha now says so. Iteration 4 runs the four evals with the transcript-evidence expectations (fixtures-5:
clones of main @ 2a815ac; baseline = the 66b083d skill text). plugin-kit: the org has OAuth-app
restrictions and the GitHub CLI app is not granted for acmelabs-15 (`gh api user/orgs` → []), so the push
is refused; branch `fix/eval-tooling` @ b0d4411 stays local.

The plugin-kit push unblocked once the GitHub CLI app showed `acmelabs-15 ✓` under its Organization
access (Peter granted it; `gh api user/orgs` then listed the org); pushed, PR #1 opened and merged (`e4b1a53`). Entry grain
settled as ADR-021 (`77aa614`): value only, `Also:` lines, the `Session-entry: none` trailer.

ANA-010 answered "why not automatic": nothing in the reference automates CONTEXT.md; its setup installs a
reading rule, one skill owns the write. Peter had the installed copies under `~/.claude/skills` brought in
line: ADR location follows the project, 16 skills read CONTEXT.md before exploring, 6 route to
`domain-modeling` (recorded in `~/.claude/skills/LOCAL-CHANGES.md`; outside this repo, so no entry here).

**Correction, 2026-08-30 (late):** the claim above and in entries `631b7f8`/`4d575a4` — that the Skill-tool path
delivers the skill unrendered — was wrong. The cause was the marker shape: the three lines wrapped the marker in a
code span (a backtick before the `!`), and a marker is recognised only at line start or after a space, so no path
ever ran them. With the documented shape both paths render (transcripts of a typed `/session start` and of the
`/session-start` alias under `claude -p`, 23:53–23:54). The gotcha now states that.

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

### 2026-08-30 · feat(session): the ledger holds value only — fix-ups vouched for by Also lines, valueless commits opt out by trailer · 77aa614

- Summary: ADR-021: an entry is the block a change worth reading about gets; a fix-up gets none and is vouched for by its parent's `- Also: <sha>` line; a commit with nothing to record carries `Session-entry: none` and the tool skips it; every commit still resolves, so the gate stays mechanical.
- Why: Peter challenged entry = commit: "it's important that only things of value get put there" — SES-004's 27 entries include fix-ups and a formatting pass with nothing to say.
- Files:
  - `.claude/skills/run-session-tool/SKILL.md` (+2/−0) — gotcha: a commit is accounted for by a heading, a parent's `- Also:` line, or the `Session-entry: none` trailer
  - `.claude/skills/session/CLAUDE.md` (+1/−1) — tool invariants name the trailer and the Also-line accounting
  - `.claude/skills/session/SKILL.md` (+6/−3) — entry step 1: delete a fix-up's skeleton and add `- Also:` to its parent; write the trailer on valueless commits
  - `.claude/skills/session/scripts/__tests__/session-lib.test.ts` (+29/−0) — two tests: knownShas over headings + Also lines; declinesEntry on the trailer (case-insensitive, line-anchored)
  - `.claude/skills/session/scripts/session-lib.ts` (+22/−0) — knownShas() and declinesEntry()
  - `.claude/skills/session/scripts/session.ts` (+16/−9) — reads commit bodies (%b) and skips trailer commits; missingCommits() uses knownShas
  - `CLAUDE.md` (+3/−1) — Recording: the ledger holds value only (ADR-021)
  - `CONTEXT.md` (+5/−3) — Entry redefined: the block a change worth reading about gets; fix-ups vouched for, valueless commits opt out; avoid 'commit' as the unit
  - `CONTRIBUTING.md` (+4/−1) — step 7 names the Also line and the trailer
  - `docs/OVERVIEW.md` (+1/−1) — ADR count 001…021
  - `docs/decisions/ADR-021-entry-grain.md` (+61/−0) — new ADR: entry grain — value only, Also lines, the trailer, the mechanical gate kept; alternatives (per-PR entries, git-independent entries, a one-line valueless entry) rejected
  - `docs/decisions/README.md` (+1/−0) — index row 021
  - `docs/sessions/README.md` (+15/−6) — rule 'the ledger holds value only' and the template's `Also:` line
- Notes: Verified in a scratch clone with the new tool: a commit made with `-m "Session-entry: none"` appends nothing; a fix-up commit with `- Also: <sha>` under its parent is not reported missing; 15 lib tests pass. First probe was invalid (clone taken before the code was committed, so it ran the old tool) and was redone. Unverified: the skill's new entry-step wording in a run (next eval iteration).

### 2026-08-30 · docs: sweep the claims ADR-020/021 made stale — OVERVIEW modes and run-skill row, run-docs spellings, ADR-017 status note, value-only rule in README and sessions CLAUDE.md · 5ca06eb

- Summary: A sweep for claims ADR-020/021 made stale: OVERVIEW still listed three modes and scripts/, run-docs used the old command spelling, ADR-017 quoted it, README and the sessions CLAUDE.md lacked the value-only rule.
- Why: Peter: "everything that needs to be updated has been updated including project level CLAUDE.md/README.md/docs/*?" — a grep sweep said no; the glossary/duplicate/shape check was clean.
- Files:
  - `README.md` (+1/−1) — the working-on-it line names the value-only rule (ADR-021)
  - `docs/.claude/skills/run-docs/SKILL.md` (+2/−2) — its two session-tool blocks in subcommand spelling (`check --session`, `new <slug>`); the check block was run
  - `docs/OVERVIEW.md` (+4/−3) — Status bullet names the four modes and ADR-020/021 with an entry-grain line; the run-skill row no longer lists scripts/
  - `docs/decisions/ADR-017-docs-system.md` (+6/−0) — dated status note pointing at ADR-020 and ADR-021 (its quoted `-- --flag` commands are the old spelling; the decision stands)
  - `docs/sessions/CLAUDE.md` (+2/−1) — invariant carries the value-only rule (Also lines, the trailer)
- Notes: Verified by re-running the sweep (old spellings, three-mode lists, scripts/ mentions, old ADR ranges: none left outside history and dated ADR notes), `bun run check`, link-check (138 links, 0 broken) and verify-agent-docs.py (0 avoid-words, 0 duplicate sentences).

### 2026-08-30 · docs(context): Session log, Join/Open/Leave/Close, Handoff and Gate defined; 'ledger' retired again · 2dd1455

- Summary: CONTEXT.md defines the four session-log words the docs used without definition (Gate, Join/Open/Leave/Close, Handoff, Session log) and retires 'ledger' again; eight live lines now say session log.
- Why: Peter: does CONTEXT.md need updating? A usage count said yes — gate 30×, join 26×, leave 17×, handoff 15× undefined, ledger 15× against the retired name.
- Files:
  - `.claude/skills/session/SKILL.md` (+1/−1) — entry step 1 says session log
  - `CLAUDE.md` (+1/−1) — Recording line says session log
  - `CONTEXT.md` (+25/−2) — new terms Session log (Avoid: ledger), Join/Open/Leave/Close, Handoff, Gate; Entry says session log
  - `CONTRIBUTING.md` (+1/−1) — step 7 says session log
  - `README.md` (+1/−1) — working-on-it line says session log
  - `docs/OVERVIEW.md` (+1/−1) — Status entry-grain line says session log
  - `docs/decisions/README.md` (+1/−1) — ADR-021 index row says session log
  - `docs/sessions/CLAUDE.md` (+1/−1) — invariant says session log
  - `docs/sessions/README.md` (+1/−1) — the value-only rule says session log (the SES-004 title and the migration note keep the historical word)
- Notes: Verified: verify-agent-docs.py with 'ledger' added to its avoid list reports only the two historical uses; check, link-check and the gate green. Decision on the spot: 'leave' is the canonical word for `/session end` (the mode name stays `end`; the glossary lists end under Avoid for close only).

### 2026-08-30 · docs(analysis): ANA-010 — how the reference skills keep CONTEXT.md current (no automation; a reading rule from setup; one skill owns the write) · 67f40d6

- Summary: ANA-010: how the reference skills repo keeps CONTEXT.md current — no automation anywhere; the setup skill installs a reading rule (docs/agents/domain.md) that defers creation to /domain-modeling; one skill owns the write, reached by delegation from four others; the reference's own docs admit the discipline leaks; envsetup never received the setup hook and has the same discipline with the same leak.
- Why: Peter: "Why didn't those things get automatically added to CONTEXT.md? … do a complete and comprehensive analysis of ~/Dev/reference/matt-pocock-skills … is it part of the install stack?"
- Files:
  - `docs/analysis/ANA-010-context-md-maintenance-in-the-reference-skills.md` (+122/−0) — the analysis: findings A–E with file:line citations to the reference at 6654f6b, refuted claim, unverifiable, four implications
  - `docs/analysis/README.md` (+1/−0) — index row for ANA-010
- Notes: Sources verified by reading the cited files at the cited lines (setup SKILL.md, domain.md, domain-modeling SKILL.md + CONTEXT-FORMAT.md, the four delegating skills, .agents/invocation.md, docs/engineering/domain-modeling.md, the glossary's git log) plus an Explore agent's full pass; the only unverifiable claim is how often the discipline fires in other users' repos. Decision left to Peter: which of the four implications to act on (avoid-word check, the two extra CONTEXT.md sections).

### 2026-08-30 · docs(analysis): ANA-010 acted on — the installed skills now follow the project's ADR location, read CONTEXT.md, route to domain-modeling · f907932

- Summary: ANA-010 gains a dated "Acted on" section: the installed skills under ~/.claude/skills were edited (ADR location follows the project; 16 read CONTEXT.md before exploring; 6 route to domain-modeling; LOCAL-CHANGES.md lists them); the Narrative records the same.
- Why: Peter asked for the reference-derived skills to read CONTEXT.md and to stop assuming docs/adr/; an analysis is never silently edited, so the outcome is a dated addition.
- Files:
  - `docs/analysis/ANA-010-context-md-maintenance-in-the-reference-skills.md` (+14/−0) — dated Acted-on section naming every edit made under ~/.claude/skills and the validator result
  - `docs/sessions/SES-006-session-followups.md` (+5/−0) — Narrative: the ANA-010 answer and the global skill edits (outside this repo, no entry of their own)
- Notes: The global edits themselves are verified by plugin-kit's validator on all 22 touched skills (valid; idea-refine's 4 warnings pre-exist) and by grep tallies (16 read rules, 5 routing sections + the grill-me pointer, no bare `docs/adr/` rule left). Not measured: whether the added lines change how those skills behave — no evals exist for them.

### 2026-08-30 · docs(claude): talk plain — a line of context, then Simplified Technical English in CONTEXT.md's words · e73676b

- Summary: The root CLAUDE.md's Working-with-Peter list gains "Talk plain": a line of context, then Simplified Technical English in CONTEXT.md's words, /wait-what as the repair — mirroring the standing rule added to ~/CLAUDE.md §1.
- Why: Peter: fold the /wait-what prompt (context, ASD-STE100, the ubiquitous language) into the global CLAUDE.md so the agent speaks that way by default; the repo section mirrors §1 for readers of AGENTS.md alone.
- Files:
  - `CLAUDE.md` (+2/−0) — one bullet under Working with Peter
- Notes: The full rule (four STE rules that matter in chat, the CONTEXT.md/CONTEXT-MAP clause, structure over prose) is in ~/CLAUDE.md §1; the repo carries the one-line form. Not measured: effect on reply length or clarity.

### 2026-08-30 · fix(session skill): the injection gotcha spelled a marker the harness ran · 4d575a4

- Summary: The injection gotcha no longer spells the marker: the harness parsed the literal example as an injection, ran `…`, and the failure aborted every typed `/session`. The bullet now describes the marker in words and records the finding: a typed `/session` renders injections; the Skill-tool path does not.
- Why: Peter, in a new conversation: `/session` → "Shell command failed for pattern !`…`: command not found: …".
- Files:
  - `.claude/skills/session/SKILL.md` (+7/−5) — first gotcha reworded; no marker text left in the body outside the three real injection lines
- Notes: Verified: `grep -c` finds exactly the three injection lines; validator valid; the failure itself is the first evidence that the typed path renders injections (SES-006's earlier probes only covered the Skill-tool path). Not yet verified: a typed `/session start` completing in a fresh conversation after this fix — Peter's next `/session` is the check.

### 2026-08-30 · fix(session skill): injection markers in the documented shape — they now render on every path · a6fddea

- Summary: The three injection lines take the documented shape (marker after the label's space, no code span); they now render on the typed path and the Skill-tool path alike. The gotcha states that and keeps the fallback; the Sessions line uses `bun run --silent`.
- Why: Peter's new conversation showed "the injected state markers didn't render"; the transcript confirmed literal markers on the typed path too, which pointed at the marker shape, not the path.
- Files:
  - `.claude/skills/session/SKILL.md` (+10/−10) — three injection lines rewritten; gotcha corrected; --silent on the Sessions line
  - `docs/sessions/SES-006-session-followups.md` (+6/−0) — dated correction paragraph in the Narrative (the earlier never-renders claim was the marker shape)
- Notes: Verified: two `claude -p` transcripts in the fixed clone show the block arriving as `- Branch: main / - Tree: … / - Sessions: SES-001 closed …` for both `/session start` and `/session-start` (files 6454da08… and 4bc0cab2… under ~/.claude/projects/…inject-probe/). Four expect-driven interactive attempts failed at the folder-trust dialog (its default is No; arrow keys under the kitty keyboard protocol did not move it), so the interactive check is Peter's next typed `/session start`.
