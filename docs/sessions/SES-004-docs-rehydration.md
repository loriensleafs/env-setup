# 2026-08-30 18:00 · Docs for rehydration — OVERVIEW, ledger → granular entries → sessions, continuous upkeep

- Goal: Make a fresh session able to pick up exactly where the last one stopped: a handoff overview, a complete record of what was done (with files), and a discipline that keeps it all current.
- Status: open
- Plan: —
- Outcome: OVERVIEW.md; a git-derived change record that evolved (one line per commit → files touched → Summary/Why + a note per file → per-session files); `bun run session` tooling with `--check`; CLAUDE.md rehydration reading order; continuous-upkeep hard rule; then the whole docs system — `plan/` (PRD-001, PLAN-001), `analysis/` (ANA-001…008), `decisions/` (ADR-001…017), `archive/` — with one naming convention `<TYPE>-<NNN>-<kebab-title>.md`, the living plan retired; and a `/run-*` skill with a verified driver in every directory (56), the root one walking the real bootstrap TUI under `expect` up to the confirm; then the `/session start | record | end` skill built with the skill-creator loop (validated, reviewed, two measured iterations: 95% vs 84% on the stricter set), ANA-009 (Anthropic's workflow-skill guidance, verified at source), ADR-019, and the session tool's `--session` / `--current`.
- Open at end: Next-up 1 (visual grouping, PLAN-001) from `wip/visual-grouping`; first real connect-phase run. From the /session work: the `!` injection is verified only by the next real conversation; both sweeps are run (`280d906`, ANA-009 addendum) — the description under-routes on Haiku (2/10) and Sonnet (6/10) and Haiku's outcome runs fail 6/20, which the next eval iteration can take up; three graders flagged that Outcome/Narrative/Shipped lines are tied to no transcript evidence; SES-005 belongs to another conversation and stays as it is. Session model (ADR-020, `66b083d`, `4e7f673`): the skill, tool and docs shipped and re-measured (24/24 vs 22/24); still open — the `!` injection and the `/session-*` aliases in a real conversation, an expectation tying Outcome/Narrative claims to transcript evidence, and closing this session once the docs stream ends.

## Narrative

At 99% context Peter asked for docs first ("don't do visual grouping first… do the second thing"):
an overview/PRD-style handoff (`bb46dcb`), then "the overview should include all the stuff we've
done almost like a ledger… continuously updated as we work" (`7439bec`). Each iteration was his
correction of the previous: the one-line ledger "is not complete enough" → files per change,
template, read/maintain rules, startup pointers in CLAUDE.md/README (`ee5e336`); "how agents
should digest the docs", "files aren't always going to be TS files", "for each file a line with a
note" → Summary/Why + per-file notes, `--check`, CLAUDE.md reading order (`f772638`, `f29ec58`);
"the AI agent should never defer or put off keeping these things up to date" → hard rule, PLAN.md
status brought current with sha citations (`62dbf83`); then "should the ledger be called session…
multiple sessions" → this layout: one file per work session, index auto-generated, entries appended
to the current session (see this session's later entries). History was split by day (and today at
the v0.1.9 tag) because git has no session notion; from here on, one file per conversation
(`bun run session -- --new <slug>` at session start).

Also this session: the visual-grouping patch was found applied but uncommitted in the working tree
and parked on local branch `wip/visual-grouping`; PRs #13–#16 merged with merge commits (the shas
in these entries depend on that — never squash).

Then Peter: "should there be plan and analysis directories… templates for research, PRDs and plan
documents… there might be some skills that already exist that could help us." Six local skills
mapped onto the need (`research`, `spec-driven-development`, `planning-and-task-breakdown`,
`documentation-and-adrs`, `grill-with-docs`, `writing-for-agents`); Peter chose the recommended
layout `plan/ analysis/ decisions/ sessions/` (ADR-017). The living plan was read end to end and
carved: 17 ADRs (decisions with alternatives), PRD-001 (promise, UX requirements, item catalog with
every chosen default, boundaries, success criteria), 8 analyses (research + empirical findings,
each with sources / refuted / unverifiable), PLAN-001 for the parked visual-grouping work; the plan
itself archived read-only (ARC-001) and CONFIG-COMPAT-PLAN absorbed. Then Peter: "make sure all of
the files in docs use similar naming conventions — decisions does a good job" → `<TYPE>-<NNN>-<kebab>`
everywhere, sessions renumbered `SES-NNN` (the script now numbers and orders by it; the H1 keeps
the start timestamp), source comments repointed from `docs/PLAN.md` to the ADR/PRD they meant.

Then `/domain-modeling`: the vocabulary was pulled from the code (item kinds, DetectResult fields,
orchestrator outcomes, doctor/bootstrap labels, ceremony ids) and `CONTEXT.md` seeded with the terms
the ADRs already settle. Three collisions went to Peter one at a time, each with a scenario: the
same config-mismatch idea had four names (`differs`, "settings differ", doctor's `drift` array filed
under "missing", the docs' "drift") → **Satisfied / Missing / Drifted / Untracked**; "selected" meant
both the picker's choice and the manifest's "this machine should have it" → **Picked / Wanted**
(unchecking a present item stays a no-op, and the summary now says so); `installed` was stretched
over configuration → **Applied** (with **Present** for the raw fact). Cross-reference findings fixed
along the way: `doctor` filed drifted items under "missing" (Peter's machine shows `1 drifted` now),
and the `deferred` outcome still told the user to run `envsetup connect`, automatic since v0.1.7.
A blanket replace briefly rewrote Peter's quoted words in ADR-010 — restored; quotes are not labels.

Last, the two loops the skill-creator flow calls optional ("We should run those two optional
loops"). The synthesizer refused twice before producing a query set — it found the description
in evals/results transcripts, then in the neighbour sweep quoting the session skill itself — so the
set came from a SKILL.md-only copy against a neighbour project without the skill; Peter signed off
the 23 queries. The description loop found nothing to change: both candidates bought two recall
misses with two precision misses on the held-out hard negatives. The tier sweep is the finding:
should-fire routing 9/9/6/2 of 10 on Fable/Opus/Sonnet/Haiku with no over-triggering anywhere, and
outcomes 19/20, 19/20, 20/20, 14/20 — Haiku ran `--new` twice, asserted a verification it never
ran, and wrote an Outcome the transcript does not support. While the sweeps ran Peter found and
fixed the plugin-kit aggregator reporting output_chars as tokens; iteration-1/2 benchmarks were
regenerated (real deltas +3,453 / +3,309 tokens).

Then the model itself: Peter — "I'm not sure it makes sense to require a session be the length of a
conversation… a session could potentially be longer… some sort of status… hooking sessions up to
plans." The docs defined a session as a conversation while SES-004 had spanned a day and SES-005 was
one read-only conversation forced to create a file. ADR-020 (`66b083d`): a session is a stream of
work, open until closed, joined or opened before the first commit, none needed for a conversation
that changes nothing; Peter confirmed that new work opens a new session. Same turn he moved the tool
into the skill and chose a subcommand CLI over flags or six scripts. The skill-reviewer's five
majors were applied before the evals (the gate had counted Outcome/Open at end; now only `close`
does). Iteration 3 (`4e7f673`): 24/24 vs 22/24, both baseline misses on the behaviours ADR-020
changed. The viewer's done-dialog erased an all-empty submit twice; the review was written by hand.

## Changes (one entry per commit, in order)

### 2026-08-30 · docs: OVERVIEW.md — project map, status, and handoff for new sessions · bb46dcb

- Summary: First handoff doc: project map, doc table, hard rules, architecture, hard-won empirical facts, status, next-up designs.
- Why: Peter asked (2026-08-30, at 99% context) for an overview/PRD-style doc pointing to the other docs so a fresh session can resume without re-deriving the project.
- Files:
  - `CLAUDE.md` (+2/−1) — "Start here: docs/OVERVIEW.md" pointer
  - `docs/OVERVIEW.md` (+130/−0) — new — the whole handoff, incl. the visual-grouping design and curl|sh / PTY facts

### 2026-08-30 · docs: add LEDGER.md and the update discipline; record docs-restructure plan · 7439bec

- Summary: First ledger (one line per commit from git log) plus the discipline to keep it; the PRD/DECISIONS/LEDGER/research restructure recorded as a plan.
- Why: Peter asked for a continuously updated ledger of everything done, and whether PLAN.md / CONFIG-COMPAT-PLAN.md should be reworked into a PRD.
- Files:
  - `CLAUDE.md` (+2/−1) — pointer to the ledger
  - `CONTRIBUTING.md` (+9/−1) — "Record it" step with a git-log regeneration command
  - `docs/LEDGER.md` (+115/−0) — new — seeded from git history under "Since vX" headings
  - `docs/OVERVIEW.md` (+13/−3) — doc-map row; Next-up 2 = docs restructure that retires PLAN.md

### 2026-08-30 · docs: ledger with files touched + bun run ledger; startup pointers for agents · ee5e336

- Summary: Ledger becomes a rehydration mechanism: generated entries with files touched, read/maintain instructions, entry template; agents pointed at OVERVIEW → LEDGER on startup.
- Why: Peter: the one-line ledger was not complete enough to rehydrate a session — needs a template, maintenance rules, how to read it against OVERVIEW, files per change, and startup pointers in CLAUDE.md/README.
- Files:
  - `CLAUDE.md` (+14/−4) — "Session start / session end" checklist replaces the start-here paragraph; `bun run ledger` in commands
  - `CONTRIBUTING.md` (+8/−9) — intro points at OVERVIEW/LEDGER; step 5 uses `bun run ledger`
  - `README.md` (+5/−3) — "Working on it" pointer to OVERVIEW → LEDGER
  - `docs/LEDGER.md` (+335/−79) — header rewritten (read / maintain / template); body regenerated with files per commit
  - `docs/OVERVIEW.md` (+14/−2) — Status references the unreleased ledger section; Next-up 1 points at `wip/visual-grouping`; resume checklist
  - `package.json` (+1/−0) — `ledger` script
  - `scripts/ledger.ts` (+92/−0) — new — append-only generator, skips docs(ledger) commits, escapes `_` in subjects
- Notes: The visual-grouping patch found uncommitted in the working tree was parked on local branch `wip/visual-grouping`, unverified.

### 2026-08-30 · docs: granular ledger — Summary, Why, and a note per touched file; rehydration procedure in CLAUDE.md · f772638

- Summary: Ledger entries become granular — Summary, Why, and a note per touched file — and CLAUDE.md gains the reading order for digesting the docs at session start.
- Why: Peter: CLAUDE.md should tell agents how to digest the docs (incl. the ledger) to rehydrate; the template must make clear Files means any file (docs, config, …); each file should get its own line with a note.
- Files:
  - `CLAUDE.md` (+40/−21) — "Rehydrating — how to digest the docs" (ordered reading procedure, what to extract from each doc, PLAN vs ledger precedence) and "Recording" with the full template inline; `--check` in commands
  - `docs/LEDGER.md` (+575/−96) — template + rules for granular entries; "Files means every file"; body regenerated with +/− per file; the three earlier unreleased entries filled in fully
  - `scripts/ledger.ts` (+75/−28) — numstat-based per-file lines with placeholders, Summary/Why placeholders, `--check` mode (missing entries or unfilled entry lines fail)
- Notes: History (up to 2026-08-30) keeps only file lists with counts — no Summary/Why/notes; they can't be backfilled honestly. `--check` counts placeholders only on entry lines because the header prose names the placeholder.

### 2026-08-30 · docs: CONTRIBUTING step and OVERVIEW doc-map match the granular ledger · f29ec58

- Summary: CONTRIBUTING step 5 and the OVERVIEW doc-map row describe the granular ledger and `--check`.
- Why: Same request as f772638; these two patches missed in that commit because the formatter had rewrapped the anchor text.
- Files:
  - `CONTRIBUTING.md` (+6/−4) — step 5 "Record it": skeleton per commit, every file kind, `bun run ledger -- --check`
  - `docs/OVERVIEW.md` (+4/−3) — doc-map row for LEDGER.md (Summary/Why/per-file, `--check`); resume step 3 mentions the placeholders and `--check`

### 2026-08-30 · docs: continuous upkeep is a hard rule; PLAN status current; OVERVIEW/PLAN cite ledger entries · 62dbf83

- Summary: Continuous doc upkeep becomes a hard rule; PLAN.md's status block is current again and cites ledger entries; OVERVIEW Status cites entries by sha.
- Why: Peter: OVERVIEW, PLAN and the ledger must be kept up to date constantly — the agent must never defer it — and OVERVIEW/PLAN should reference specific ledger entries.
- Files:
  - `CLAUDE.md` (+9/−4) — hard rule "Docs are kept current continuously — never deferred"; Recording section is "continuously, as you go" (after every commit) and asks for sha citations
  - `docs/LEDGER.md` (+3/−2) — "Continuously, after every commit" replaces "before merge"; OVERVIEW/PLAN updated in the same step with the sha
  - `docs/OVERVIEW.md` (+6/−2) — Status block carries the never-defer note and cites unreleased entries by sha
  - `docs/archive/ARC-001-living-plan.md` (+20/−2) — new CURRENT STATUS (2026-08-31) with ledger refs and the decisions settled since; the 2026-08-26 block demoted to a snapshot; purpose banner says update in the same commit

### 2026-08-30 · docs: per-session change log replaces the single ledger (docs/sessions/, bun run session) · db47945

- Summary: The single ledger becomes per-session files under `docs/sessions/` with `bun run session` (start / append / check) and an auto-generated index; history migrated and split into four sessions with narratives.
- Why: Peter: "should the ledger be changed to be called session, and can there be multiple sessions — it might not make sense to put everything in a single session"; chose the per-session split over one ledger + session notes.
- Files:
  - `CLAUDE.md` (+30/−20) — Rehydrating step 2 reads the sessions index + newest file; Recording covers session start (`--new`), after-every-commit, narrative-as-it-happens; commands block
  - `CONTRIBUTING.md` (+9/−8) — step 5 rewritten for the session workflow
  - `README.md` (+2/−2) — pointer → docs/sessions/ newest file
  - `docs/LEDGER.md` (+0/−888) — removed — content migrated into docs/sessions/
  - `docs/OVERVIEW.md` (+13/−11) — doc-map row for docs/sessions/; Status cites the session file; resume steps use `bun run session`
  - `docs/archive/ARC-001-living-plan.md` (+6/−6) — banner + CURRENT STATUS cite docs/sessions/ instead of LEDGER
  - `docs/sessions/SES-001-foundation.md` (+589/−0) — new — migrated 2026-08-26 entries; narrative points at PLAN.md's build log / UI history / session log
  - `docs/sessions/SES-002-curl-sh-interactivity-and-first-bootstrap-fixes.md` (+149/−0) — new — migrated 2026-08-27 entries (v0.1.0–v0.1.4); narrative: curl|sh root cause and the first full bootstrap failures
  - `docs/sessions/SES-004-docs-rehydration.md` (+87/−0) — new — this session: the post-v0.1.9 docs entries; narrative of the ledger → sessions evolution
  - `docs/sessions/SES-003-real-bootstrap-runs-v0.1.5-to-v0.1.9.md` (+101/−0) — new — migrated v0.1.5–v0.1.9 entries; narrative: Peter's run-driven UX directives
  - `docs/sessions/README.md` (+84/−0) — new — index (auto-regenerated between markers), how to read, how to keep up to date, session + entry template
  - `package.json` (+1/−1) — `session` script replaces `ledger`
  - `scripts/ledger.ts` (+0/−139) — removed (became session.ts)
  - `scripts/session.ts` (+230/−0) — new — `--new <slug>`, append into the newest session (ordered by H1 timestamp), `--check`, release markers, index regeneration; skips docs(session)/docs(ledger) commits
- Notes: Session order comes from the H1 timestamp, not the file name, so two sessions on one day sort correctly. `--check` treats a bare placeholder narrative line as unfilled too. The day-based split of history is an approximation of sessions — stated in the README. The first version of this entry was committed unfilled (`3bc882a`) because git's rename detection printed `docs/{LEDGER.md => sessions/…}` paths; the script now passes `--no-renames`.

### 2026-08-30 · docs: the docs system — plan/ analysis/ decisions/ archive/ with one naming convention; living plan retired · 7de62b7

- Summary: The docs system lands: `decisions/` (17 ADRs), `plan/` (PRD-001 + PLAN-001), `analysis/` (8 analyses), `archive/` (the retired living plan), one naming convention `<TYPE>-<NNN>-<kebab-title>.md` incl. sessions renumbered `SES-NNN`; OVERVIEW/CLAUDE.md/README/CONTRIBUTING rewired; source comments repointed.
- Why: Peter: plan and analysis directories with templates for research/PRDs/plans, using existing skills; chose the recommended `plan/ analysis/ decisions/ sessions/` layout; then "all files in docs should follow the naming convention decisions established".
- Files:
  - `CLAUDE.md` (+30/−22) — Rehydrating names OVERVIEW → newest SES → PLAN/ADR/ANA for the area → PRD; Recording names which doc and skill for decisions/requirements/plans/findings; never-defer rule lists every doc type
  - `CONTRIBUTING.md` (+5/−2) — intro points at decisions + PRD; step 2 mentions ADRs, PRD catalog, `input: promptInput()`
  - `README.md` (+2/−2) — pointers → decisions / PRD / analysis
  - `docs/CONFIG-COMPAT-PLAN.md` (+0/−112) — removed — model → ADR-010, research appendix → ANA-007
  - `docs/OVERVIEW.md` (+86/−96) — rewritten: doc map by TYPE with producing skills, rules/architecture/facts link their ADR/ANA, Status cites SES-004, Next-up 2 (restructure) done and removed, resume steps use the system
  - `docs/PLAN.md` (+0/−1301) — moved to docs/archive/ARC-001-living-plan.md
  - `docs/RESEARCH-clack-citty-bun.md` (+0/−204) — moved to docs/analysis/ANA-001-clack-citty-bun.md
  - `docs/analysis/ANA-001-clack-citty-bun.md` (+206/−0) — new — moved from docs/RESEARCH-clack-citty-bun.md + status banner
  - `docs/analysis/ANA-002-install-methods.md` (+62/−0) — new — install methods per tool (from the living plan's runtimes + dependency audit)
  - `docs/analysis/ANA-003-app-config-mechanics.md` (+98/−0) — new — app config + licensing mechanics (CleanShot/BetterDisplay/Typora/superwhisper/Raycast/Podman/editors/Ghostty/Claude Code captures)
  - `docs/analysis/ANA-004-chrome-web-apps.md` (+56/−0) — new — Chrome web apps without policy (bundle naming, AX driver techniques)
  - `docs/analysis/ANA-005-macos-permissions-tcc.md` (+44/−0) — new — TCC permissions cannot be pre-granted
  - `docs/analysis/ANA-006-finder-favorites-sharedfilelist.md` (+42/−0) — new — Finder favorites via LSSharedFileList (the sentinel-pointer segfault)
  - `docs/analysis/ANA-007-config-compatibility.md` (+84/−0) — new — config-compatibility research (CONFIG-COMPAT-PLAN appendix: defects, couplings, refuted)
  - `docs/analysis/ANA-008-terminal-input-under-curl-sh.md` (+55/−0) — new — terminal input under curl|sh (the empirical root cause)
  - `docs/analysis/README.md` (+68/−0) — new — index, primary-source rules, analysis template, `research` skill
  - `docs/archive/ARC-001-living-plan.md` (+1308/−0) — PLAN.md moved here verbatim with a retired/read-only banner
  - `docs/archive/README.md` (+14/−0) — new — what is archived and where its content went
  - `docs/decisions/ADR-001-pure-bun-no-node.md` (+42/−0) — new — ADR: pure Bun, no Node
  - `docs/decisions/ADR-002-distribution-curl-one-liner.md` (+45/−0) — new — ADR: distribution via curl one-liner + compiled binary
  - `docs/decisions/ADR-003-vendored-clack.md` (+41/−0) — new — ADR: vendored clack
  - `docs/decisions/ADR-004-repo-structure-and-tests.md` (+46/−0) — new — ADR: repo structure + sibling tests
  - `docs/decisions/ADR-005-three-stage-workflow.md` (+59/−0) — new — ADR: three-stage workflow, nothing before confirm, auto connect, re-run converges
  - `docs/decisions/ADR-006-everything-toggleable-requires-cascade.md` (+46/−0) — new — ADR: everything toggleable + requires-cascade
  - `docs/decisions/ADR-007-manifest-journal-item-architecture.md` (+50/−0) — new — ADR: manifest/journal/item architecture + failure policy
  - `docs/decisions/ADR-008-secrets-age-encrypted-in-repo.md` (+51/−0) — new — ADR: secrets age-encrypted in repo
  - `docs/decisions/ADR-009-github-auth-and-signing.md` (+52/−0) — new — ADR: GitHub device flow, two SSH keys, signing, noreply
  - `docs/decisions/ADR-010-reset-on-drift-config-model.md` (+55/−0) — new — ADR: reset-on-drift config model (supersedes conflict-consent)
  - `docs/decisions/ADR-011-install-method-per-tool.md` (+44/−0) — new — ADR: install method per tool + transitive prereqs
  - `docs/decisions/ADR-012-per-item-zsh-contributions.md` (+41/−0) — new — ADR: per-item zsh contributions
  - `docs/decisions/ADR-013-claude-code-format-hook-installed-by-cli.md` (+40/−0) — new — ADR: Claude Code format hook installed by the CLI
  - `docs/decisions/ADR-014-terminal-input-in-process-dev-tty.md` (+39/−0) — new — ADR: terminal input via in-process /dev/tty
  - `docs/decisions/ADR-015-chrome-web-apps-ax-automation.md` (+38/−0) — new — ADR: Chrome web apps via AX automation
  - `docs/decisions/ADR-016-dev-tooling.md` (+45/−0) — new — ADR: dev tooling (Biome/markdownlint/lefthook/git-cliff/CI)
  - `docs/decisions/ADR-017-docs-system.md` (+58/−0) — new — ADR: the docs system itself
  - `docs/decisions/README.md` (+67/−0) — new — index, lifecycle rules, ADR template, which skills produce ADRs
  - `docs/plan/PLAN-001-visual-grouping.md` (+52/−0) — new — plan for Next-up 1 (tasks, PTY checkpoint, risks); patch on `wip/visual-grouping`
  - `docs/plan/PRD-001-envsetup.md` (+205/−0) — new — promise, commands, UX requirements, full item catalog with chosen defaults, stack, structure, style, testing, boundaries, success criteria, non-goals, open questions
  - `docs/plan/README.md` (+80/−0) — new — index, rules, PRD + feature-plan templates, which skills
  - `docs/sessions/2026-08-26-foundation.md` (+0/−589) — renamed to SES-001-foundation.md
  - `docs/sessions/2026-08-27-curl-sh-interactivity-and-first-bootstrap-fixes.md` (+0/−149) — renamed to SES-002-…
  - `docs/sessions/2026-08-30-docs-rehydration.md` (+0/−108) — renamed to SES-004-docs-rehydration.md
  - `docs/sessions/2026-08-30-real-bootstrap-runs-v0.1.5-to-v0.1.9.md` (+0/−101) — renamed to SES-003-…
  - `docs/sessions/README.md` (+11/−11) — SES-NNN naming in the rules; ADR/PRD instead of PLAN.md
  - `docs/sessions/SES-001-foundation.md` (+589/−0) — renamed from the date-named file; narrative links to ARC-001
  - `docs/sessions/SES-002-curl-sh-interactivity-and-first-bootstrap-fixes.md` (+149/−0) — renamed from the date-named file; links updated
  - `docs/sessions/SES-003-real-bootstrap-runs-v0.1.5-to-v0.1.9.md` (+101/−0) — renamed from the date-named file
  - `docs/sessions/SES-004-docs-rehydration.md` (+121/−0) — renamed; Outcome/Open updated; narrative of the docs-system + naming work
  - `scripts/session.ts` (+13/−7) — SES-NNN files: numbered `--new`, ordered by number, index label `SES-NNN · timestamp · title`
  - `src/auth/auth-ceremony.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/auth/github-device-flow.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/all.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/chrome/chrome-defaults.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/chrome/chrome-pwas.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/claude-code/claude-settings.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/defs/dock.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/defs/git-email.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/defs/git-identity.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/defs/macos-defaults.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/defs/ssh-keys.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/editors/editor-config.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/ghostty/ghostty-config.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/ghostty/ghostty-icon.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/quick-actions/quick-actions.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/items/repos/repo-factory.ts` (+2/−2) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/paths/paths.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/secrets/age-store.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
  - `src/secrets/secrets.ts` (+1/−1) — comment repointed from docs/PLAN.md to the ADR/PRD it meant (no behaviour change)
- Notes: `AGENTS.md` is a symlink to CLAUDE.md (edits go through it). `docs/archive/` is read-only history; ADR-017 records the alternatives Peter rejected on the way (single ledger, ledger + session notes). Source files changed only in comments.

### 2026-08-30 · feat(skills): a /run-* skill with a verified driver in every directory · ba38081

- Summary: A `/run-*` skill in every directory (56): the root one drives the real bootstrap TUI under `expect` up to (never past) the confirm; every source dir gets a `driver.ts` that directly invokes its safe functions; tests/docs/CI/scripts/vendor dirs get theirs. Every command was run.
- Why: Peter ran `/run-skill-generator` with "do this recursively for every directory" and, asked about scope, chose literally every directory over one-per-unit.
- Files:
  - `.claude/skills/run-envsetup/SKILL.md` (+95/−52) — rewritten around the PTY walk + smoke driver; build, install.sh, tooling, gotchas from the three attempts (encoding, colour-wrapped symbols, `Ready in` line)
  - `.claude/skills/run-envsetup/bootstrap-walk.exp` (+70/−0) — new — expect driver: walks scan → identity → dev dir → picker → config screens → summary, answers No at Proceed?; UTF-8 + ANSI-tolerant prompt matching; refuses Resume it?
  - `.github/.claude/skills/run-github/SKILL.md` (+51/−0) — new — inspect workflows/runs via gh, reproduce the checks job locally
  - `.github/workflows/.claude/skills/run-github-workflows/SKILL.md` (+50/−0) — new — inspect ci.yml/release.yml via gh, reproduce locally, what cannot be run
  - `CLAUDE.md` (+5/−2) — "Safety when running it" names the PTY walk, smoke driver and per-directory drivers
  - `CONTRIBUTING.md` (+9/−4) — new step 3 "Drive it, don't guess"; later steps renumbered
  - `README.md` (+1/−1) — broken link `docs/RESEARCH-ANA-001-…` → `docs/analysis/ANA-001-clack-citty-bun.md`
  - `docs/.claude/skills/run-docs/SKILL.md` (+53/−0) — new — link checker + markdownlint + session check for the whole docs system
  - `docs/.claude/skills/run-docs/link-check.ts` (+44/−0) — new — relative-link checker for docs/** + CLAUDE/README/CONTRIBUTING (found 3 broken links on first run)
  - `docs/OVERVIEW.md` (+1/−1) — doc-map row for the run skills
  - `docs/analysis/.claude/skills/run-docs-analysis/SKILL.md` (+18/−0) — new — scoped link check + markdownlint (sessions: the session tool; archive: the moved-links gotcha)
  - `docs/archive/.claude/skills/run-docs-archive/SKILL.md` (+23/−0) — new — scoped link check + markdownlint (sessions: the session tool; archive: the moved-links gotcha)
  - `docs/archive/ARC-001-living-plan.md` (+3/−3) — two relative links repointed (`../OVERVIEW.md`, `../sessions/README.md`) after the move; banner notes it
  - `docs/decisions/.claude/skills/run-docs-decisions/SKILL.md` (+18/−0) — new — scoped link check + markdownlint (sessions: the session tool; archive: the moved-links gotcha)
  - `docs/plan/.claude/skills/run-docs-plan/SKILL.md` (+18/−0) — new — scoped link check + markdownlint (sessions: the session tool; archive: the moved-links gotcha)
  - `docs/sessions/.claude/skills/run-docs-sessions/SKILL.md` (+28/−0) — new — scoped link check + markdownlint (sessions: the session tool; archive: the moved-links gotcha)
  - `scripts/.claude/skills/run-scripts/SKILL.md` (+35/−0) — new — session tool: --check, append, --new (not run), gotchas
  - `src/.claude/skills/run-src/SKILL.md` (+58/−0) — new — the entry `src/index.ts`; points at the root skill for the TUI walk
  - `src/.claude/skills/run-src/driver.ts` (+29/−0) — new — entry-point surfaces via Bun.spawnSync (--help, --version, doctor --help, doctor)
  - `src/auth/.claude/skills/run-src-auth/SKILL.md` (+52/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/auth/.claude/skills/run-src-auth/driver.ts` (+70/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/auth/__tests__/.claude/skills/run-src-auth-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/ceremonies/.claude/skills/run-src-ceremonies/SKILL.md` (+51/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/ceremonies/.claude/skills/run-src-ceremonies/driver.ts` (+55/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/ceremonies/__tests__/.claude/skills/run-src-ceremonies-tests/SKILL.md` (+16/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/commands/.claude/skills/run-src-commands/SKILL.md` (+56/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/commands/.claude/skills/run-src-commands/driver.ts` (+53/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/commands/__tests__/.claude/skills/run-src-commands-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/exec/.claude/skills/run-src-exec/SKILL.md` (+49/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/exec/.claude/skills/run-src-exec/driver.ts` (+29/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/exec/__tests__/.claude/skills/run-src-exec-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/.claude/skills/run-src-items/SKILL.md` (+56/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/.claude/skills/run-src-items/driver.ts` (+89/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/__tests__/.claude/skills/run-src-items-tests/SKILL.md` (+28/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/chrome/.claude/skills/run-src-items-chrome/SKILL.md` (+61/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/chrome/.claude/skills/run-src-items-chrome/driver.ts` (+27/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/chrome/__tests__/.claude/skills/run-src-items-chrome-tests/SKILL.md` (+28/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/chrome/assets/.claude/skills/run-src-items-chrome-assets/SKILL.md` (+45/−0) — new — typecheck-only skill; finder: documents that set-favorites.swift is STALE vs the embedded constant
  - `src/items/chrome/assets/.claude/skills/run-src-items-chrome-assets/driver.ts` (+15/−0) — new — `swiftc -typecheck` + byte-equality with the embedded TS constant; never executes the helper (it mutates Chrome/Finder)
  - `src/items/claude-code/.claude/skills/run-src-items-claude-code/SKILL.md` (+59/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/claude-code/.claude/skills/run-src-items-claude-code/driver.ts` (+41/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/claude-code/__tests__/.claude/skills/run-src-items-claude-code-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/claude-code/assets/.claude/skills/run-src-items-claude-code-assets/SKILL.md` (+58/−0) — new — the shipped Claude Code scripts' stdin-JSON contracts; gotcha: format hook no-ops silently when Biome's config errors outside a git repo
  - `src/items/claude-code/assets/.claude/skills/run-src-items-claude-code-assets/driver.ts` (+109/−0) — new — feeds fixture payloads to statusline / subagent-statusline / format hook (scratch project), checks settings.template.json; notify hook not run (fires a real notification)
  - `src/items/defs/.claude/skills/run-src-items-defs/SKILL.md` (+73/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/defs/.claude/skills/run-src-items-defs/driver.ts` (+90/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/defs/__tests__/.claude/skills/run-src-items-defs-tests/SKILL.md` (+32/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/editors/.claude/skills/run-src-items-editors/SKILL.md` (+53/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/editors/.claude/skills/run-src-items-editors/driver.ts` (+17/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/editors/__tests__/.claude/skills/run-src-items-editors-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/factories/.claude/skills/run-src-items-factories/SKILL.md` (+50/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/factories/.claude/skills/run-src-items-factories/driver.ts` (+42/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/factories/__tests__/.claude/skills/run-src-items-factories-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/finder/.claude/skills/run-src-items-finder/SKILL.md` (+55/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/finder/.claude/skills/run-src-items-finder/driver.ts` (+33/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/finder/__tests__/.claude/skills/run-src-items-finder-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/finder/assets/.claude/skills/run-src-items-finder-assets/SKILL.md` (+46/−0) — new — typecheck-only skill; finder: documents that set-favorites.swift is STALE vs the embedded constant
  - `src/items/finder/assets/.claude/skills/run-src-items-finder-assets/driver.ts` (+25/−0) — new — `swiftc -typecheck` + byte-equality with the embedded TS constant; never executes the helper (it mutates Chrome/Finder)
  - `src/items/ghostty/.claude/skills/run-src-items-ghostty/SKILL.md` (+58/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/ghostty/.claude/skills/run-src-items-ghostty/driver.ts` (+26/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/ghostty/__tests__/.claude/skills/run-src-items-ghostty-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/quick-actions/.claude/skills/run-src-items-quick-actions/SKILL.md` (+52/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/quick-actions/.claude/skills/run-src-items-quick-actions/driver.ts` (+20/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/quick-actions/__tests__/.claude/skills/run-src-items-quick-actions-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/repos/.claude/skills/run-src-items-repos/SKILL.md` (+55/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/repos/.claude/skills/run-src-items-repos/driver.ts` (+41/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/items/repos/__tests__/.claude/skills/run-src-items-repos-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/items/typora/.claude/skills/run-src-items-typora/SKILL.md` (+46/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/items/typora/.claude/skills/run-src-items-typora/driver.ts` (+11/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/journal/.claude/skills/run-src-journal/SKILL.md` (+52/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/journal/.claude/skills/run-src-journal/driver.ts` (+43/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/journal/__tests__/.claude/skills/run-src-journal-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/manifest/.claude/skills/run-src-manifest/SKILL.md` (+46/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/manifest/.claude/skills/run-src-manifest/driver.ts` (+55/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/manifest/__tests__/.claude/skills/run-src-manifest-tests/SKILL.md` (+29/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/orchestrator/.claude/skills/run-src-orchestrator/SKILL.md` (+50/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/orchestrator/.claude/skills/run-src-orchestrator/driver.ts` (+98/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - `src/orchestrator/__tests__/.claude/skills/run-src-orchestrator-tests/SKILL.md` (+27/−0) — new — `bun test <dir>` with the real pass counts, per-file commands
  - `src/paths/.claude/skills/run-src-paths/SKILL.md` (+49/−0) — new — how to drive this module: driver command + real output, direct-invocation snippet, `bun test` count
  - `src/paths/.claude/skills/run-src-paths/driver.ts` (+45/−0) — new — direct invocation of this module's safe functions (mocked Runner / temp dirs / fixtures; detect() read-only; never install/configure/network)
  - … +9 more (`git show --stat ba38081`)
- Notes: Two forked agents built the per-module drivers in parallel. Drivers under `.claude/` are Biome-checked and executed but NOT typechecked (tsconfig `include: ["src"]` skips dot-dirs). Findings for follow-up: `src/items/finder/assets/set-favorites.swift` is stale vs the embedded `SET_FAVORITES_SWIFT` (the constant has `--list`; the file does not — runtime ships the constant); `hooks-format.ts` exits 0 silently when Biome's config errors (e.g. `vcs.useIgnoreFile` outside a git repo); and `sh install.sh …` re-run on this machine died with SIGKILL (exit 137) because it overwrites a previously-executed signed binary in place — fixed in the next PR.

### 2026-08-30 · fix(install): always download to a fresh file — an in-place overwrite of a previously executed binary can be SIGKILLed · 855bfd6

- Summary: `install.sh` removes the previous download before fetching so the binary always lands on a fresh inode; OVERVIEW Next-up 5 records the two findings the run-skill drivers surfaced.
- Why: While verifying the root run skill, `sh install.sh --help` re-run over the binary left by an earlier run was SIGKILLed (exit 137) right after the download; a fresh download of the same release ran fine.
- Files:
  - `docs/OVERVIEW.md` (+4/−0) — Next-up 5: stale `set-favorites.swift` asset; `hooks-format.ts` silent no-op on Biome config error
  - `install.sh` (+4/−0) — `rm -f \"$DEST\"` before `curl`, with the why
- Notes: Not reproduced deterministically — an immediate second in-place overwrite ran fine, and the unified log had no entry for the kill; the fix is cheap and removes the failure mode either way. The real fix is Next-up 3 (persist the binary to `~/.local/bin`).

### 2026-08-30 · docs(agents): nested CLAUDE.md where a directory has unwritten conventions; path rules; run skills pruned to real drivers (ADR-018) · 990820a

- Summary: 17 nested CLAUDE.md files where a directory has unwritten conventions (folding weak dirs into `src/` and `src/items/`), two path-scoped rules for drivers and tests, and the run skills pruned from 56 to the 28 with a real driver — decided in ADR-018, tracked in PLAN-002.
- Why: Peter: "evaluate all the nested .claude dirs and figure out where a nested CLAUDE.md would make more sense, and write it… take time to think… create tasks for yourself"; then chose option one plus docs subdirectories and asked to remove nested `.claude` where it makes sense.
- Files:
  - `.claude/rules/drivers.md` (+13/−0) — new — path rule for **/.claude/skills/**: safe calls only, not typechecked, blocks were run
  - `.claude/rules/tests.md` (+12/−0) — new — path rule for **/**tests**/**: temp dirs via XDG/ENVSETUP_SECRETS_FILE overrides, mock Runner, substring filter
  - `.github/CLAUDE.md` (+9/−0) — new — release only by tag, macos-14 checks job, gh pr checks lag
  - `.github/workflows/.claude/skills/run-github-workflows/SKILL.md` (+0/−50) — removed — a copy of the .github skill
  - `CLAUDE.md` (+5/−1) — one pointer paragraph naming the nested files and rules (ADR-018)
  - `docs/CLAUDE.md` (+8/−0) — new — README-first, naming, link checker after moves, OVERVIEW in the same step
  - `docs/OVERVIEW.md` (+4/−1) — doc-map rows for nested CLAUDE.md + rules and the pruned skill count; Status: unreleased line
  - `docs/analysis/.claude/skills/run-docs-analysis/SKILL.md` (+0/−18) — removed — the docs checker with an argument
  - `docs/analysis/CLAUDE.md` (+6/−0) — new — the directory's one invariant + pointer to its README
  - `docs/archive/.claude/skills/run-docs-archive/SKILL.md` (+0/−23) — removed — the docs checker with an argument
  - `docs/archive/CLAUDE.md` (+4/−0) — new — the directory's one invariant + pointer to its README
  - `docs/decisions/.claude/skills/run-docs-decisions/SKILL.md` (+0/−18) — removed — the docs checker with an argument
  - `docs/decisions/ADR-018-nested-claude-md-placement.md` (+72/−0) — new — cited load semantics, four criteria, path rules, the pruning rule, alternatives
  - `docs/decisions/CLAUDE.md` (+6/−0) — new — the directory's one invariant + pointer to its README
  - `docs/decisions/README.md` (+1/−0) — index row for ADR-018
  - `docs/plan/.claude/skills/run-docs-plan/SKILL.md` (+0/−18) — removed — the docs checker with an argument
  - `docs/plan/CLAUDE.md` (+6/−0) — new — the directory's one invariant + pointer to its README
  - `docs/plan/PLAN-002-nested-claude-md.md` (+75/−0) — new — the task list for this work (research → inventory → placement question → write → verify → record); status done
  - `docs/plan/README.md` (+1/−0) — index row for PLAN-002
  - `docs/sessions/.claude/skills/run-docs-sessions/SKILL.md` (+0/−28) — removed — the docs checker with an argument
  - `docs/sessions/CLAUDE.md` (+6/−0) — new — the directory's one invariant + pointer to its README
  - `scripts/CLAUDE.md` (+6/−0) — new — session.ts invariants and what a format change also touches
  - `src/CLAUDE.md` (+36/−0) — new — entry guards (0-width PTY pin, closePromptInput, citty root-run quirk) + one-liners for auth/ceremonies/journal/manifest/secrets/exec/paths
  - `src/auth/__tests__/.claude/skills/run-src-auth-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/ceremonies/__tests__/.claude/skills/run-src-ceremonies-tests/SKILL.md` (+0/−16) — removed — `bun test <dir>` in prose earned no slash command
  - `src/commands/CLAUDE.md` (+19/−0) — new — nothing before Proceed?, safe defaults for pre-confirm prompts, input threading, presentOption, spinner/deferred
  - `src/commands/__tests__/.claude/skills/run-src-commands-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/exec/__tests__/.claude/skills/run-src-exec-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/CLAUDE.md` (+36/−0) — new — blast radius, differs⇔installed:false, deps/registration, ask optional, install-method research; editors/factories/ghostty/repos/quick-actions/typora folded in
  - `src/items/__tests__/.claude/skills/run-src-items-tests/SKILL.md` (+0/−28) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/chrome/.claude/skills/run-src-items-chrome/SKILL.md` (+2/−0) — notes that the Swift asset is covered by this driver, typecheck only
  - `src/items/chrome/.claude/skills/run-src-items-chrome/driver.ts` (+9/−0) — runs `xcrun swiftc -typecheck` on install-web-app.swift (folded from the removed assets skill)
  - `src/items/chrome/CLAUDE.md` (+16/−0) — new — quit/reopen blast radius, filename-only rename, INSTALL_SWIFT constant, pins not HMAC-protected (re-verify)
  - `src/items/chrome/__tests__/.claude/skills/run-src-items-chrome-tests/SKILL.md` (+0/−28) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/chrome/assets/.claude/skills/run-src-items-chrome-assets/SKILL.md` (+0/−45) — removed — typecheck folded into the parent item's driver
  - `src/items/chrome/assets/.claude/skills/run-src-items-chrome-assets/driver.ts` (+0/−15) — removed — typecheck folded into the parent item's driver
  - `src/items/claude-code/CLAUDE.md` (+21/−0) — new — ASSET_PATHS only, generated settings, deep-compare detect; assets/ contracts and the notify/format gotchas
  - `src/items/claude-code/__tests__/.claude/skills/run-src-items-claude-code-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/defs/CLAUDE.md` (+18/−0) — new — largest blast radius, gpgsign ordering, hotkey takeover, blob compare, re-capture on upgrades, dotfiles factory
  - `src/items/defs/__tests__/.claude/skills/run-src-items-defs-tests/SKILL.md` (+0/−32) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/editors/__tests__/.claude/skills/run-src-items-editors-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/factories/__tests__/.claude/skills/run-src-items-factories-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/finder/.claude/skills/run-src-items-finder/SKILL.md` (+2/−0) — notes that the Swift asset is covered by this driver, typecheck only
  - `src/items/finder/.claude/skills/run-src-items-finder/driver.ts` (+16/−0) — typechecks set-favorites.swift AND the embedded constant (folded from the removed assets skill)
  - `src/items/finder/CLAUDE.md` (+12/−0) — new — stale asset vs constant, swiftc not swift, OpaquePointer sentinel
  - `src/items/finder/__tests__/.claude/skills/run-src-items-finder-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/finder/assets/.claude/skills/run-src-items-finder-assets/SKILL.md` (+0/−46) — removed — typecheck folded into the parent item's driver
  - `src/items/finder/assets/.claude/skills/run-src-items-finder-assets/driver.ts` (+0/−25) — removed — typecheck folded into the parent item's driver
  - `src/items/ghostty/__tests__/.claude/skills/run-src-items-ghostty-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/quick-actions/__tests__/.claude/skills/run-src-items-quick-actions-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/items/repos/__tests__/.claude/skills/run-src-items-repos-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/journal/__tests__/.claude/skills/run-src-journal-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/manifest/__tests__/.claude/skills/run-src-manifest-tests/SKILL.md` (+0/−29) — removed — `bun test <dir>` in prose earned no slash command
  - `src/orchestrator/CLAUDE.md` (+15/−0) — new — the encoded failure policy, UI-agnostic, deferred, transitiveDependents signature
  - `src/orchestrator/__tests__/.claude/skills/run-src-orchestrator-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/paths/__tests__/.claude/skills/run-src-paths-tests/SKILL.md` (+0/−27) — removed — `bun test <dir>` in prose earned no slash command
  - `src/secrets/__tests__/.claude/skills/run-src-secrets-tests/SKILL.md` (+0/−28) — removed — `bun test <dir>` in prose earned no slash command
  - `src/ui/CLAUDE.md` (+17/−0) — new — extend core prompts, input option, state-aware frames, schema-derived screens, PTY strong oracle
  - `src/ui/__tests__/.claude/skills/run-src-ui-tests/SKILL.md` (+0/−29) — removed — `bun test <dir>` in prose earned no slash command
- Notes: Research first (claude-code-guide agent, cited in ADR-018): nested files load lazily when Claude reads files under the directory and concatenate after the root; `AGENTS.md` is not read by Claude Code; `.claude/rules/*.md` with `paths:` load on read (v2.1.198+). Observed: the harness discovered `/run-docs-plan` the instant PLAN-002 was written under docs/plan — nested skills are picked up on touch. Two inventory forks scored all 56 directories (9 strong / 14 weak / 33 none). Verification: 18 CLAUDE.md files, largest nested 36 lines, 0 sentences shared between any two, 0 broken links, `bun run check` green, both folded drivers run. Unverified: whether `**/.claude/skills/**` matches dot-directories (fallback globs recorded in ADR-018).

### 2026-08-30 · docs(agents): docs/CLAUDE.md names OVERVIEW.md as the map and the subdirectory READMEs as the rules · b13ab9b

- Summary: `docs/CLAUDE.md` now names `OVERVIEW.md` as the map of docs/ and the subdirectory READMEs as the rules; no `docs/README.md` (it would duplicate OVERVIEW), and no sibling READMEs for the src/.github/scripts CLAUDE.md files (their human docs are the ADR/ANA/PRD/CONTRIBUTING they already link).
- Why: Peter: "does the docs directory need a README.md that docs/CLAUDE.md references?" and "do any of the other nested CLAUDE.md files need sibling README.md files?"
- Files:
  - `docs/CLAUDE.md` (+6/−2) — header names OVERVIEW.md as the map; subdirectory READMEs as rules/index/template

### 2026-08-30 · feat(glossary): CONTEXT.md — canonical vocabulary; doctor/bootstrap labels aligned (Satisfied/Missing/Drifted/Untracked, Picked/Wanted, Applied) · 2eb5648

- Summary: `CONTEXT.md` glossary seeded from the code and ADRs; three collisions settled with Peter (item states Satisfied/Missing/Drifted/Untracked; Picked vs Wanted; Applied vs Present) and the code, prompts, drivers and docs aligned to the words.
- Why: Peter invoked `/domain-modeling`; the same concepts wore different names in `doctor`, bootstrap, the code flags and the docs, and `doctor` was filing drifted items under "missing".
- Files:
  - `.claude/skills/run-envsetup/SKILL.md` (+2/−2) — expected outro shape and picker wording
  - `.claude/skills/run-envsetup/smoke.mjs` (+4/−4) — doctor needle 'satisfied' and outro regex with 'drifted'
  - `CLAUDE.md` (+6/−2) — rehydration step 4: use CONTEXT.md's words; settle terms with domain-modeling first
  - `CONTEXT.md` (+196/−0) — new — the glossary: machine/items, running, item states, configuration, secrets; Avoid lists; Open section
  - `README.md` (+1/−1) — picker hint text → "applied — settings differ"
  - `docs/OVERVIEW.md` (+5/−1) — doc-map row for CONTEXT.md; hint wording; Status: unreleased code change (doctor/labels)
  - `docs/decisions/ADR-010-reset-on-drift-config-model.md` (+1/−1) — decision text uses 'applied — settings differ'; Peter's quoted words left as spoken
  - `docs/plan/PRD-001-envsetup.md` (+3/−3) — doctor states named per CONTEXT.md; success criterion wording
  - `docs/sessions/SES-004-docs-rehydration.md` (+12/−0) — narrative of the domain-modeling conversation
  - `src/.claude/skills/run-src/driver.ts` (+1/−1) — doctor needle 'satisfied'
  - `src/commands/__tests__/bootstrap-presentation.test.ts` (+1/−1) — expects the 'applied — settings differ' hint
  - `src/commands/bootstrap.ts` (+4/−4) — hint 'applied — settings differ'; summary 'already applied (untouched — unchecking an applied item changes nothing)'; 'already applied' outcome; deferred message no longer says run connect
  - `src/commands/doctor.ts` (+27/−21) — missing / drifted / untracked arrays and notes; 'satisfied' count; 'every wanted item is satisfied'
  - `src/items/item.ts` (+2/−1) — DetectResult.installed documented as Applied; hint text in the differs doc
  - `src/orchestrator/orchestrator.ts` (+1/−1) — journal skip reason 'already applied'
- Notes: The on-disk manifest field stays `selected` (renaming is a migration) and `DetectResult.installed` stays as the flag name (~65 items); both are spoken of as Wanted / Applied. Terms asserted without a conversation (Ceremony, Connect phase, Finishing pass, Converge, Section, Kind) are listed as open to challenge. No ADR: vocabulary is cheap to reverse. The doctor/label changes are code and ship with v0.1.10.

### 2026-08-30 · docs: root files rewritten for the current way of working — CLAUDE.md reading order + working style, CONTRIBUTING workflow, README · edb9bba

- Summary: The four root files rewritten coherently for how agents now work here: CLAUDE.md (reading order, working style, recording, rules, essentials, safety), CONTRIBUTING (the full workflow incl. session start, drivers, merge commits), README (product + reading order); OVERVIEW's rules become a pointer.
- Why: Peter: "make sure all of the root project files … are as completely up to date as they need to be … make it clear how the agents should be working … including any references to other markdown documents that should be included in the initial reading".
- Files:
  - `CLAUDE.md` (+113/−106) — rewritten (148 lines): Rehydrating 1–5, Working with Peter, Recording, Hard rules (ADR refs), Architecture essentials, Commands, Safety
  - `CONTRIBUTING.md` (+67/−60) — rewritten: reading pointer, ground rules, setup, 8-step workflow (session start first; merge commits), release with step 6
  - `README.md` (+36/−27) — rewritten: commands in glossary words, drifted paragraph, Working on it reading order, development table with session + run skills
  - `docs/OVERVIEW.md` (+7/−16) — Hard rules section → pointer to CLAUDE.md; CLAUDE.md doc-map row
- Notes: Verified 0 duplicated sentences across the 23 root/README/OVERVIEW/CLAUDE files and 0 broken links; the blanket-replace lesson from the glossary commit applied (quotes are not labels).

### 2026-08-30 · docs(agents): every nested agent doc reviewed for shape, flow and the glossary — 17 CLAUDE.md, 6 READMEs, 2 rules, 28 SKILL.md · 7ac99ab

- Summary: Every nested agent-facing doc reviewed and reshaped in one pass — 17 nested CLAUDE.md, the 6 READMEs, the 2 path rules and all 28 SKILL.md — for a uniform shape, the glossary's words, no restatement of the root or a parent, and no stale facts from the day's earlier changes.
- Why: Peter: "do the same thing for all of the same files and nested variations … a comprehensive evaluation making sure they're structured and flow in ways that make sense and would be most helpful to the agent".
- Files:
  - `.claude/rules/drivers.md` (+5/−5) — prohibition rephrased as the positive boundary
  - `.claude/skills/run-envsetup/SKILL.md` (+13/−19) — picked/applied wording; tooling folded into Test; 'directories with a real driver'
  - `.github/.claude/skills/run-github/SKILL.md` (+3/−1) — adds `gh pr merge --merge --delete-branch` with the merge-commit rule
  - `.github/CLAUDE.md` (+8/−7) — framing + `/run-github` pointer; checks-lag and upload-flake now live in CONTRIBUTING (pointer)
  - `docs/.claude/skills/run-docs/SKILL.md` (+6/−7) — link-check and markdownlint outputs re-run; removed-skills paragraph replaced by 'scope with the argument'
  - `docs/CLAUDE.md` (+7/−9) — reframed: OVERVIEW is map + status, subdirectory READMEs are purpose/index/rules/template; `/run-docs` scopes by argument
  - `docs/OVERVIEW.md` (+24/−27) — glossary words in What it is / Architecture; unreleased status merged into one bullet; Next-up plan number PLAN-003; resume step 3 → pointer
  - `docs/analysis/CLAUDE.md` (+2/−4) — cut to the directory's one invariant + README pointer
  - `docs/analysis/README.md` (+2/−2) — index sorted ANA-001…008
  - `docs/archive/CLAUDE.md` (+3/−3) — cut to the directory's one invariant + README pointer
  - `docs/archive/README.md` (+16/−6) — Index and Rules headings; how to retire a doc
  - `docs/decisions/CLAUDE.md` (+3/−4) — cut to the directory's one invariant + README pointer
  - `docs/decisions/README.md` (+1/−1) — ADR-010 row says 'picking is the consent'
  - `docs/plan/CLAUDE.md` (+3/−4) — cut to the directory's one invariant + README pointer
  - `docs/plan/README.md` (+6/−9) — purpose as one paragraph; PLAN-NNN naming
  - `docs/sessions/CLAUDE.md` (+3/−4) — cut to the directory's one invariant + README pointer
  - `docs/sessions/README.md` (+4/−2) — Rules → Reading / Writing so all READMEs run purpose → Index → Rules → Template
  - `scripts/.claude/skills/run-scripts/SKILL.md` (+1/−1) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `scripts/CLAUDE.md` (+5/−4) — framing + `/run-scripts` pointer
  - `src/.claude/skills/run-src/SKILL.md` (+5/−7) — doctor outro block re-run (61 satisfied · 2 missing · 1 drifted …); glossary gotchas
  - `src/CLAUDE.md` (+24/−22) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `src/auth/.claude/skills/run-src-auth/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/ceremonies/.claude/skills/run-src-ceremonies/SKILL.md` (+7/−10) — connect-phase wording; removed the `bun test` block for the deleted **tests** dir
  - `src/commands/.claude/skills/run-src-commands/SKILL.md` (+5/−5) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/commands/CLAUDE.md` (+12/−13) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `src/exec/.claude/skills/run-src-exec/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/.claude/skills/run-src-items/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/CLAUDE.md` (+19/−21) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `src/items/chrome/.claude/skills/run-src-items-chrome/SKILL.md` (+7/−14) — driver re-run; expected output includes the folded-in swiftc typecheck lines; trailing paragraphs merged into the intro
  - `src/items/chrome/CLAUDE.md` (+8/−7) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `src/items/claude-code/.claude/skills/run-src-items-claude-code/SKILL.md` (+6/−13) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/claude-code/CLAUDE.md` (+16/−13) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `src/items/claude-code/assets/.claude/skills/run-src-items-claude-code-assets/SKILL.md` (+3/−9) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/defs/.claude/skills/run-src-items-defs/SKILL.md` (+4/−10) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/defs/CLAUDE.md` (+10/−9) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `src/items/editors/.claude/skills/run-src-items-editors/SKILL.md` (+3/−10) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/factories/.claude/skills/run-src-items-factories/SKILL.md` (+2/−9) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/finder/.claude/skills/run-src-items-finder/SKILL.md` (+6/−12) — driver re-run; expected output includes the folded-in swiftc typecheck lines; trailing paragraphs merged into the intro
  - `src/items/finder/CLAUDE.md` (+7/−6) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `src/items/ghostty/.claude/skills/run-src-items-ghostty/SKILL.md` (+5/−11) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/quick-actions/.claude/skills/run-src-items-quick-actions/SKILL.md` (+2/−9) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/repos/.claude/skills/run-src-items-repos/SKILL.md` (+2/−9) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/items/typora/.claude/skills/run-src-items-typora/SKILL.md` (+4/−10) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/journal/.claude/skills/run-src-journal/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/manifest/.claude/skills/run-src-manifest/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/orchestrator/.claude/skills/run-src-orchestrator/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/orchestrator/CLAUDE.md` (+10/−11) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `src/paths/.claude/skills/run-src-paths/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/secrets/.claude/skills/run-src-secrets/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/ui/.claude/skills/run-src-ui/SKILL.md` (+1/−2) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `src/ui/CLAUDE.md` (+9/−9) — reshaped: refs in the title, framing = invariant/blast radius + driver, bullets invariant → conventions → gotchas → pointers; glossary words; root/parent restatements removed
  - `vendor/.claude/skills/run-vendor/SKILL.md` (+1/−1) — uniform shape: one paths/PATH line, no per-block export, no generic Setup, section order Run (agent path) → Direct invocation → Build → Run (human) → Test → Gotchas → Troubleshooting; glossary words
  - `vendor/README.md` (+3/−2) — ADR-003 link and `/run-vendor` pointer; conversion step names the ADR supersession
- Notes: Three forks, disjoint file sets, one shape spec each; verified afterwards with a scanner (CONTEXT.md avoid-words in prose, duplicated sentences across all 55 agent-facing files, nested-CLAUDE.md shape) → 0 / 0 / clean, plus link check (0 broken), markdownlint, and the smoke driver. Commands whose output changed (doctor outro, link-check counts, chrome/finder drivers) were re-run before their blocks were edited.

### 2026-08-30 · feat(skills): /rehydrate (model-invoked) and /wrap-up (user-invoked) — the reading order and the closing check as executable procedures · b433789

- Summary: Two project skills: `/rehydrate` (model-invoked; the reading order as a procedure with a completion criterion, starts the conversation's session file, ends in a brief) and `/wrap-up` (user-invoked closing check). CLAUDE.md's Rehydrating section becomes a pointer so the procedure has one home.
- Why: Peter: "I'm wondering if there should be a Claude skill or Claude command for rehydrating context for the project in new conversations"; chose model-invoked + a wrap-up companion.
- Files:
  - `.claude/skills/rehydrate/SKILL.md` (+58/−0) — new — six steps, verify-tree block, 'Done when' brief + session file; description carries the triggers
  - `.claude/skills/wrap-up/SKILL.md` (+42/−0) — new — session complete, OVERVIEW current, tree clean, open PRs named; disable-model-invocation
  - `CLAUDE.md` (+10/−28) — Rehydrating → pointer to /rehydrate with the order in one sentence; /wrap-up named (130 lines)
  - `CONTRIBUTING.md` (+4/−3) — step 1 rehydrate-then-session; step 7 names /wrap-up
  - `README.md` (+1/−1) — 'agents: /rehydrate does it'
  - `docs/OVERVIEW.md` (+1/−0) — doc-map row for the two skills
  - `docs/sessions/README.md` (+1/−0) — index regenerated by the tool (SES-005 appeared)
  - `docs/sessions/SES-005-rehydration.md` (+12/−0) — NOT mine — created by a concurrent conversation in this checkout at 19:25 and swept into this commit by `git add -A`; left for that session to fill
- Notes: Invocation per writing-for-agents SKILL-MECHANICS (rehydrate must fire on its own; wrap-up by hand). Not exercised here. Two process lessons in one commit: never `git add -A` in a shared checkout (a concurrent session's file was swept in), and never pipe the `--check` gate through `tail` (it hid the failure and the PR merged with an unfilled entry; the entry was then moved here from SES-005).

### 2026-08-30 · feat(skills): /session start | record | end replaces /rehydrate and /wrap-up (skill-creator loop: validated, reviewed) · ea51e09

- Summary: One model-invoked `/session` skill (start | record | end) replaces /rehydrate and /wrap-up; written with the skill-creator loop: validator clean, skill-reviewer findings applied, evals drafted.
- Why: Peter: one session skill covering start, keeping the current session up to date, and end; then "use the skill-creator skill".
- Files:
  - `.claude/skills/rehydrate/SKILL.md` (+0/−65) — removed — folded into /session
  - `.claude/skills/session/SKILL.md` (+142/−0) — new — description to the four criteria (969 chars), gotchas up front, three branches with Done-when
  - `.claude/skills/session/evals/evals.json` (+46/−0) — new — three should-fire prompts, three hard negatives
  - `.claude/skills/wrap-up/SKILL.md` (+0/−42) — removed — folded into /session
  - `CLAUDE.md` (+18/−44) — Rehydrating/Recording point at /session start|record|end
  - `CONTRIBUTING.md` (+2/−2) — steps 1 and 7 name /session
  - `README.md` (+1/−1) — 'agents: /session start does it'
  - `docs/OVERVIEW.md` (+1/−1) — doc-map row for the session skill
  - `scripts/.claude/skills/run-scripts/SKILL.md` (+1/−1) — description narrowed to driving/testing the tool (reviewer's routing collision)
- Notes: plugin-kit validator needed `bun install` in plugin-kit to run. Reviewer verdict NEEDS WORK → all findings applied → valid, no collisions across 78 skills.

### 2026-08-30 · docs(analysis): ANA-009 — Anthropic's skill workflow best practices (arguments, conditional pattern, invocation, authoring); ADR-019 for /session; iteration-1 eval evidence · 4d3ad13

- Summary: ANA-009 records what Anthropic's own pages say about workflow skills (arguments, the conditional workflow pattern, checklists/validation loops, invocation control, dynamic context, authoring); ADR-019 records the /session shape decisions; iteration-1 eval evidence committed.
- Why: Peter: "research what Anthropic considers to be skills best practices specifically around creating workflows — conditional workflows and arguments"; the first research pass leaned on third-party sites and its verifier misread a preview, so every claim was re-checked against the Anthropic pages directly.
- Files:
  - `.claude/skills/session/evals/evals.json` (+23/−3) — eval file
  - `.claude/skills/session/evals/results/iteration-1/.started-at` (+1/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/benchmark.json` (+366/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/benchmark.md` (+13/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/eval_metadata.json` (+12/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/with_skill/grading.json` (+137/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/with_skill/outputs/git-state.txt` (+16/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/with_skill/outputs/overview.diff` (+20/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/with_skill/outputs/reply.md` (+4/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/with_skill/outputs/session-file.md` (+56/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/with_skill/outputs/transcript.md` (+108/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/with_skill/timing.json` (+1/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/without_skill/grading.json` (+143/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/without_skill/outputs/git-state.txt` (+16/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/without_skill/outputs/overview.diff` (+45/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/without_skill/outputs/reply.md` (+11/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/without_skill/outputs/session-file.md` (+86/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/without_skill/outputs/transcript.md` (+91/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/end-close/without_skill/timing.json` (+1/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/notes.json` (+25/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/eval_metadata.json` (+13/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/with_skill/grading.json` (+160/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/with_skill/outputs/commit.diff` (+196/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/with_skill/outputs/git-state.txt` (+13/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/with_skill/outputs/overview.diff` (+30/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/with_skill/outputs/reply.md` (+13/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/with_skill/outputs/session-file.md` (+37/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/with_skill/outputs/transcript.md` (+53/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/with_skill/timing.json` (+1/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/without_skill/grading.json` (+167/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/without_skill/outputs/commit.diff` (+214/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/without_skill/outputs/git-state.txt` (+12/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/without_skill/outputs/overview.diff` (+29/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/without_skill/outputs/reply.md` (+18/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/without_skill/outputs/session-file.md` (+84/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/without_skill/outputs/transcript.md` (+71/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/record-commit/without_skill/timing.json` (+1/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/eval_metadata.json` (+13/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/with_skill/grading.json` (+158/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/with_skill/outputs/brief.md` (+13/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/with_skill/outputs/git-state.txt` (+19/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/with_skill/outputs/session-file.md` (+11/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/with_skill/outputs/transcript.md` (+67/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/with_skill/timing.json` (+1/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/without_skill/grading.json` (+167/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/without_skill/outputs/brief.md` (+30/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/without_skill/outputs/git-state.txt` (+18/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/without_skill/outputs/session-file.md` (+30/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/without_skill/outputs/transcript.md` (+76/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/start-brief/without_skill/timing.json` (+1/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.markdownlint-cli2.jsonc` (+2/−1) — eval evidence under .claude/skills/*/evals/results excluded from linting
  - `docs/analysis/ANA-009-skill-workflow-best-practices.md` (+240/−0) — new — findings A/C/I/D/W/P with verbatim quotes, refuted claims, implications for /session
  - `docs/analysis/README.md` (+1/−0) — index row
  - `docs/decisions/ADR-019-session-skill-invocation-and-name.md` (+59/−0) — new — one model-invoked skill branching on its argument, named for the leading word, gate as side-effect guard
  - `docs/decisions/README.md` (+1/−0) — index row
- Notes: Benchmark: with skill 93% vs 81% pass rate, but the analyst notes show the delta rests on two line-count caps and that the aggregate's 'tokens' are output byte counts (real usage ~105k/run, +3% with the skill). 15 of 17 expectations identical across arms; the skill's real differences were unmeasured — hence iteration 2.

### 2026-08-30 · feat(skills): /session iteration 2 — injected state, named mode argument, checklists and templates; session tool gains --session and warns on other sessions' placeholders · 8ba5c97

- Summary: Iteration 2 of the skill: injected branch/tree/gate state, named `mode` argument, checklists and literal templates, precise other-conversation rule; the session tool gains `--session` and downgrades other sessions' placeholders to warnings; evals rewritten to measure what matters.
- Why: The iteration-1 graders' critiques plus ANA-009's implications; and the tool's 'newest file = current' rule blocked my own gate on another conversation's SES-005.
- Files:
  - `.claude/skills/session/SKILL.md` (+139/−106) — rewritten (175 lines): injection lines, `arguments: [mode]`, narrow allowed-tools, per-branch checklist, brief/closing-note templates, Input→Output per-file example
  - `.claude/skills/session/evals/evals.json` (+22/−19) — 20 expectations: char/word caps, HEAD unchanged, SES-005 untouched, named-file staging, claim verified, stale docs, no push/PR
  - `.claude/skills/session/evals/results/iteration-1/benchmark.json` (+53/−28) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-1/feedback.json` (+35/−0) — eval evidence (iteration-1 run outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/skill-snapshot/SKILL.md` (+142/−0) — iteration-1 skill snapshot — the old_skill baseline for iteration 2
  - `docs/sessions/README.md` (+1/−0) — 'Your own file, by name' rule
  - `scripts/.claude/skills/run-scripts/SKILL.md` (+1/−0) — adds the `--check --session` command
  - `scripts/CLAUDE.md` (+2/−1) — documents --session and the warning semantics
  - `scripts/session.ts` (+39/−4) — `--session SES-NNN` selects the append target and the gated file; other files' placeholders print warnings; `--new` prints the flag to use
- Notes: Verified: `bun run session -- --check --session SES-004` gates this file and warns about SES-005; `--session 5` gates SES-005. Injected `!` commands are not executed when a subagent merely reads SKILL.md, so the evals exercise the prose, not the injection — the injection is verified by the next real conversation.

### 2026-08-30 · feat(session-tool): --current lists the selected session's placeholders by line; skill makes the gate loop explicit; ANA-009 implications reconciled with what shipped · d347c9f

- Summary: The session tool gains `--current` (selected file, Goal, every placeholder with its line number); the skill's record step makes the gate loop explicit (`NOT ready` → fill what it names → gate again); ANA-009's implications list now says what actually shipped, including why `allowed-tools` stayed in.
- Why: Peter: "did we do everything suggested in ANA-009?" — two items were partial (scripts-solve-don't-defer; the validation loop) and one had silently deviated (allowed-tools).
- Files:
  - `.claude/skills/session/SKILL.md` (+5/−1) — record step names `--current`; after the gate block: NOT ready → fill → gate again → then stage
  - `docs/analysis/ANA-009-skill-workflow-best-practices.md` (+12/−7) — implication 5 reversed with the D1 reason; 9 marked done (--session/--current, validation loop); 10 stays unverified
  - `scripts/session.ts` (+22/−0) — `--current`: prints session, started/title, goal, placeholder lines with numbers
- Notes: Committed after the iteration-2 fixtures were cloned, so those runs exercised the skill without the `--current` mention and the loop line — a one-line difference from what ships; recorded in the iteration's metadata. Models tier sweep (ANA-009 P3) remains not done.

### 2026-08-30 · docs(evals): /session iteration-2 evidence — six runs vs the iteration-1 skill, gradings, timing, benchmark (95% vs 84%), analyst notes · c37d306

- Summary: Iteration-2 evidence: six runs of the new skill against the iteration-1 skill on the 20-expectation set, graded, aggregated (95% vs 84%), analysed.
- Why: The skill-creator loop's second iteration, measuring 'did the change help' rather than 'does a skill help at all'.
- Files:
  - `.claude/skills/session/evals/results/iteration-2/benchmark.json` (+406/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/benchmark.md` (+13/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/eval_metadata.json` (+15/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/old_skill/grading.json` (+120/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/old_skill/outputs/git-state.txt` (+32/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/old_skill/outputs/overview.diff` (+12/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/old_skill/outputs/reply.md` (+4/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/old_skill/outputs/session-file.md` (+19/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/old_skill/outputs/transcript.md` (+51/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/old_skill/timing.json` (+1/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/with_skill/grading.json` (+139/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/with_skill/outputs/git-state.txt` (+32/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/with_skill/outputs/overview.diff` (+22/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/with_skill/outputs/reply.md` (+2/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/with_skill/outputs/session-file.md` (+23/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/with_skill/outputs/transcript.md` (+28/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/end-close/with_skill/timing.json` (+1/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/notes.json` (+23/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/eval_metadata.json` (+16/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/old_skill/grading.json` (+143/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/old_skill/outputs/commit.diff` (+122/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/old_skill/outputs/git-state.txt` (+14/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/old_skill/outputs/overview.diff` (+29/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/old_skill/outputs/reply.md` (+18/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/old_skill/outputs/session-file.md` (+19/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/old_skill/outputs/transcript.md` (+68/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/old_skill/timing.json` (+1/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/with_skill/grading.json` (+142/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/with_skill/outputs/commit.diff` (+144/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/with_skill/outputs/git-state.txt` (+14/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/with_skill/outputs/overview.diff` (+28/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/with_skill/outputs/reply.md` (+19/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/with_skill/outputs/session-file.md` (+45/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/with_skill/outputs/transcript.md` (+103/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/record-commit/with_skill/timing.json` (+1/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/eval_metadata.json` (+16/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/old_skill/grading.json` (+152/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/old_skill/outputs/brief.md` (+11/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/old_skill/outputs/git-state.txt` (+29/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/old_skill/outputs/session-file.md` (+17/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/old_skill/outputs/transcript.md` (+84/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/old_skill/timing.json` (+1/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/with_skill/grading.json` (+130/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/with_skill/outputs/brief.md` (+10/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/with_skill/outputs/git-state.txt` (+29/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/with_skill/outputs/session-file.md` (+16/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/with_skill/outputs/transcript.md` (+67/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
  - `.claude/skills/session/evals/results/iteration-2/start-brief/with_skill/timing.json` (+1/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
- Notes: The delta comes from the two `end` expectations (60-word note; OVERVIEW grounded in real work); 18/20 outcomes identical; SES-005 untouched 6/6 thanks to the shared tool change; the brief overshot the 1,600-char cap in both arms.

### 2026-08-30 · feat(skills): /session brief capped at ~1,200 chars with a single Question line; iteration-2 feedback and fixture notes recorded · dacbdb8

- Summary: The brief template ends the reply (~1,200 chars, one optional `Question:` line); Peter's iteration-2 reviews and the fixture lessons recorded in evals.json.
- Why: Peter: the old-skill brief 'looks fairly bad' and the old-skill end at 67% is 'not great' — the new templates fix both, and the brief's remaining overshoot was a question paragraph outside the template.
- Files:
  - `.claude/skills/session/SKILL.md` (+3/−1) — start step 7: template is the whole reply, ~1,200 chars, `Question:` line
  - `.claude/skills/session/evals/evals.json` (+6/−0) — `fixture_notes`: invisible baseline swap, green seeded log, verify.txt/exit capture, hard negatives never swept
  - `.claude/skills/session/evals/results/iteration-2/feedback.json` (+15/−0) — eval evidence (iteration-2 outputs / grading / timing / benchmark / notes / feedback)
- Notes: Two reviews, both on the baseline arm; the with-skill runs drew no comment.

### 2026-08-30 · feat(skills): /session start | entry | end (record → entry) and typed-only aliases /session-start, /session-entry, /session-end · ac59b7b

- Summary: The middle mode is `entry` (start | entry | end) and three typed-only aliases `/session-start`, `/session-entry`, `/session-end` exist as `.claude/commands/*.md`; CONTEXT.md gains Entry and Record.
- Why: Peter: rename `record` to "session update" or "session entry", add slash commands for start/end/entry via the command-creator skill, and check the root CLAUDE.md/README — chose `entry` plus user-only wrappers.
- Files:
  - `.claude/commands/session-end.md` (+9/−0) — new — typed-only alias (`disable-model-invocation: true`): calls the Skill tool with `skill: session`, `args: <mode>`; ignores surplus text; description written for /help
  - `.claude/commands/session-entry.md` (+9/−0) — new — typed-only alias (`disable-model-invocation: true`): calls the Skill tool with `skill: session`, `args: <mode>`; ignores surplus text; description written for /help
  - `.claude/commands/session-start.md` (+9/−0) — new — typed-only alias (`disable-model-invocation: true`): calls the Skill tool with `skill: session`, `args: <mode>`; ignores surplus text; description written for /help
  - `.claude/skills/session/SKILL.md` (+8/−7) — mode `entry`; names the aliases
  - `CLAUDE.md` (+5/−4) — Rehydrating/Recording headings name `/session entry` and the aliases
  - `CONTEXT.md` (+10/−0) — Entry (the per-commit block) and Record (the act) with Avoid lists
  - `CONTRIBUTING.md` (+2/−2) — steps 1 and 7 name the aliases
  - `README.md` (+1/−1) — Working on it: entry / end
  - `docs/OVERVIEW.md` (+2/−2) — doc-map row and Status line: start · entry · end + aliases
  - `docs/analysis/ANA-009-skill-workflow-best-practices.md` (+1/−1) — question line notes the rename
  - `docs/decisions/ADR-019-session-skill-invocation-and-name.md` (+5/−2) — Status revised in place with a dated note (mode renamed, aliases added); older text says record
  - `docs/decisions/README.md` (+1/−1) — ADR-019 row
  - `scripts/.claude/skills/run-scripts/SKILL.md` (+1/−1) — exclusion reworded: starting, writing entries, ending
- Notes: command-creator: commands and skills are the same entry point, the skill wins on a name clash, and a flat command adds only a `/` menu name — so the aliases are `disable-model-invocation: true` (zero listing cost). Validator valid (fail-open warning only); command-reviewer PASS, two minors applied. Unverified until a real conversation types `/session-start`: that the Skill-tool hop adds no permission prompt (reviewer's render check).

### 2026-08-30 · docs: every place that describes the session tool now names /session start · entry · end as the procedure and the --session/--current flags · 6b6105c

- Summary: CLAUDE.md's Commands block and README's dev table describe the session tool as what `/session` drives, with `--session` and `--current`.
- Why: Peter: "was the project CLAUDE.md and README.md updated to include the session skill and when/how to use it? Perhaps files in the docs as well?" — the when/how was there; the raw tool descriptions lacked `--session`/`--current`, and docs/sessions never named the skill.
- Files:
  - `CLAUDE.md` (+4/−3) — Commands block: --new (what /session start runs), --session append, --current, --check --session
  - `README.md` (+1/−1) — dev table row: tool behind /session start · entry · end with all four forms

### 2026-08-30 · docs: CONTRIBUTING step 7, docs/sessions README + CLAUDE.md, scripts/CLAUDE.md name /session as the procedure and the --session/--current flags · f9c5ab0

- Summary: CONTRIBUTING step 7, docs/sessions README (Writing) and CLAUDE.md, and scripts/CLAUDE.md name `/session start · entry · end` as the procedure and the `--session`/`--current` flags.
- Why: Peter: "was the project CLAUDE.md and README.md updated to include the session skill and when/how to use it? Perhaps files in the docs as well?" — the when/how was there; the raw tool descriptions lacked `--session`/`--current`, and docs/sessions never named the skill.
- Files:
  - `CONTRIBUTING.md` (+4/−4) — step 7 uses --session and --current
  - `docs/sessions/CLAUDE.md` (+3/−0) — framing line: driven by /session
  - `docs/sessions/README.md` (+6/−1) — Writing section opens by naming the skill and its aliases; --current in the own-file rule
  - `scripts/CLAUDE.md` (+2/−1) — --current documented

### 2026-08-30 · eval(session): trigger/description loop and Haiku/Sonnet/Opus tier sweeps · 280d906

- Summary: Runs the two skill-creator loops that were still open for `/session`: the description/trigger loop (original description wins on held-out, unchanged) and the Haiku/Sonnet/Opus sweep for both triggering (9/9/6/2 of 10 should-fire; 12/13/13/13 hard negatives declined) and outcomes (14/20, 20/20, 19/20 vs Fable 19/20). Commits the evidence, the query set, the analyst notes, and regenerates iteration-1/2 benchmarks with the fixed aggregator.
- Why: Peter: "We should run those two optional loops" — ANA-009 implication 10 and the evals.json fixture note had both sweeps recorded as not done.
- Files:
  - `.claude/skills/session/evals/evals.json` (+1/−1) — fixture note 4 rewritten: hard negatives 101–103 swept (3/3 declined on every tier), pointers to results/trigger and results/tier-sweep
  - `.claude/skills/session/evals/results/iteration-1/benchmark.json` (+45/−70) — regenerated with the fixed plugin-kit aggregator — Tokens column now from timing.json, not output_chars; notes preserved
  - `.claude/skills/session/evals/results/iteration-1/benchmark.md` (+2/−2) — regenerated with the fixed plugin-kit aggregator — Tokens column now from timing.json, not output_chars; notes preserved
  - `.claude/skills/session/evals/results/iteration-2/benchmark.json` (+55/−79) — regenerated with the fixed plugin-kit aggregator — Tokens column now from timing.json, not output_chars; notes preserved
  - `.claude/skills/session/evals/results/iteration-2/benchmark.md` (+2/−2) — regenerated with the fixed plugin-kit aggregator — Tokens column now from timing.json, not output_chars; notes preserved
  - `.claude/skills/session/evals/results/tier-sweep/README.md` (+18/−0) — what the sweep is, the cross-tier table (Haiku 14/20, Sonnet 20/20, Opus 19/20, Fable 19/20), where each figure lives
  - `.claude/skills/session/evals/results/tier-sweep/haiku/benchmark.json` (+198/−0) — aggregate-results over the Haiku 4.5 runs (with_skill arm only; the baseline column is empty by design)
  - `.claude/skills/session/evals/results/tier-sweep/haiku/benchmark.md` (+13/−0) — aggregate-results over the Haiku 4.5 runs (with_skill arm only; the baseline column is empty by design)
  - `.claude/skills/session/evals/results/tier-sweep/haiku/end-close/eval_metadata.json` (+15/−0) — copy of iteration-2's end-close metadata (same prompt and expectations) for the Haiku 4.5 run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/end-close/with_skill/grading.json` (+118/−0) — Haiku 4.5 end-close grader verdict: 5/6 — failed: session-file.md has Outcome and Open at end written
  - `.claude/skills/session/evals/results/tier-sweep/haiku/end-close/with_skill/outputs/git-state.txt` (+27/−0) — Haiku 4.5 end-close output — HEAD, status, log and gate output at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/end-close/with_skill/outputs/overview.diff` (+1/−0) — Haiku 4.5 end-close output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/end-close/with_skill/outputs/reply.md` (+2/−0) — Haiku 4.5 end-close output — the run's verbatim reply
  - `.claude/skills/session/evals/results/tier-sweep/haiku/end-close/with_skill/outputs/session-file.md` (+11/−0) — Haiku 4.5 end-close output — the session file as the run left it
  - `.claude/skills/session/evals/results/tier-sweep/haiku/end-close/with_skill/outputs/transcript.md` (+214/−0) — Haiku 4.5 end-close output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/tier-sweep/haiku/end-close/with_skill/timing.json` (+1/−0) — Haiku 4.5 end-close: 62,923 tokens, 157.8 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/eval_metadata.json` (+16/−0) — copy of iteration-2's record-commit metadata (same prompt and expectations) for the Haiku 4.5 run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/with_skill/grading.json` (+121/−0) — Haiku 4.5 record-commit grader verdict: 5/7 — failed: session-file.md's entry Notes state how the fix's claim was ; commit.diff shows src/items/finder/CLAUDE.md and src/items/f
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/with_skill/outputs/commit.diff` (+19/−0) — Haiku 4.5 record-commit output — `git show HEAD` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/with_skill/outputs/git-state.txt` (+13/−0) — Haiku 4.5 record-commit output — HEAD, status, log and gate output at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/with_skill/outputs/overview.diff` (+16/−0) — Haiku 4.5 record-commit output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/with_skill/outputs/reply.md` (+29/−0) — Haiku 4.5 record-commit output — the run's verbatim reply
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/with_skill/outputs/session-file.md` (+19/−0) — Haiku 4.5 record-commit output — the session file as the run left it
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/with_skill/outputs/transcript.md` (+195/−0) — Haiku 4.5 record-commit output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/tier-sweep/haiku/record-commit/with_skill/timing.json` (+1/−0) — Haiku 4.5 record-commit: 70,429 tokens, 205.3 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/tier-sweep/haiku/start-brief/eval_metadata.json` (+16/−0) — copy of iteration-2's start-brief metadata (same prompt and expectations) for the Haiku 4.5 run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/start-brief/with_skill/grading.json` (+140/−0) — Haiku 4.5 start-brief grader verdict: 4/7 — failed: brief.md contains a line starting with 'read in full; session-file.md exists; git-state.txt shows HEAD unchanged from the fixture tip and
  - `.claude/skills/session/evals/results/tier-sweep/haiku/start-brief/with_skill/outputs/brief.md` (+8/−0) — Haiku 4.5 start-brief output — the brief the run posted (verbatim reply)
  - `.claude/skills/session/evals/results/tier-sweep/haiku/start-brief/with_skill/outputs/git-state.txt` (+23/−0) — Haiku 4.5 start-brief output — HEAD, status, log and gate output at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/haiku/start-brief/with_skill/outputs/session-file.md` (+11/−0) — Haiku 4.5 start-brief output — the session file as the run left it
  - `.claude/skills/session/evals/results/tier-sweep/haiku/start-brief/with_skill/outputs/transcript.md` (+72/−0) — Haiku 4.5 start-brief output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/tier-sweep/haiku/start-brief/with_skill/timing.json` (+1/−0) — Haiku 4.5 start-brief: 95,617 tokens, 126.8 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/tier-sweep/notes.json` (+14/−0) — analyst pass across tiers: Haiku's six failures, the two length-bound misses, verification and stale-doc coverage per tier, tokens/time
  - `.claude/skills/session/evals/results/tier-sweep/opus/benchmark.json` (+203/−0) — aggregate-results over the Opus 5 runs (with_skill arm only; the baseline column is empty by design)
  - `.claude/skills/session/evals/results/tier-sweep/opus/benchmark.md` (+13/−0) — aggregate-results over the Opus 5 runs (with_skill arm only; the baseline column is empty by design)
  - `.claude/skills/session/evals/results/tier-sweep/opus/end-close/eval_metadata.json` (+15/−0) — copy of iteration-2's end-close metadata (same prompt and expectations) for the Opus 5 run
  - `.claude/skills/session/evals/results/tier-sweep/opus/end-close/with_skill/grading.json` (+137/−0) — Opus 5 end-close grader verdict: 5/6 — failed: reply.md is at most 60 words and states what shipped in the
  - `.claude/skills/session/evals/results/tier-sweep/opus/end-close/with_skill/outputs/git-state.txt` (+29/−0) — Opus 5 end-close output — HEAD, status, log and gate output at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/opus/end-close/with_skill/outputs/overview.diff` (+1/−0) — Opus 5 end-close output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/opus/end-close/with_skill/outputs/reply.md` (+8/−0) — Opus 5 end-close output — the run's verbatim reply
  - `.claude/skills/session/evals/results/tier-sweep/opus/end-close/with_skill/outputs/session-file.md` (+34/−0) — Opus 5 end-close output — the session file as the run left it
  - `.claude/skills/session/evals/results/tier-sweep/opus/end-close/with_skill/outputs/transcript.md` (+120/−0) — Opus 5 end-close output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/tier-sweep/opus/end-close/with_skill/timing.json` (+1/−0) — Opus 5 end-close: 77,008 tokens, 184.2 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/eval_metadata.json` (+16/−0) — copy of iteration-2's record-commit metadata (same prompt and expectations) for the Opus 5 run
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/with_skill/grading.json` (+145/−0) — Opus 5 record-commit grader verdict: 7/7
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/with_skill/outputs/commit.diff` (+163/−0) — Opus 5 record-commit output — `git show HEAD` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/with_skill/outputs/git-state.txt` (+14/−0) — Opus 5 record-commit output — HEAD, status, log and gate output at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/with_skill/outputs/overview.diff` (+33/−0) — Opus 5 record-commit output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/with_skill/outputs/reply.md` (+32/−0) — Opus 5 record-commit output — the run's verbatim reply
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/with_skill/outputs/session-file.md` (+59/−0) — Opus 5 record-commit output — the session file as the run left it
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/with_skill/outputs/transcript.md` (+234/−0) — Opus 5 record-commit output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/tier-sweep/opus/record-commit/with_skill/timing.json` (+1/−0) — Opus 5 record-commit: 98,005 tokens, 324.7 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/tier-sweep/opus/start-brief/eval_metadata.json` (+16/−0) — copy of iteration-2's start-brief metadata (same prompt and expectations) for the Opus 5 run
  - `.claude/skills/session/evals/results/tier-sweep/opus/start-brief/with_skill/grading.json` (+147/−0) — Opus 5 start-brief grader verdict: 7/7
  - `.claude/skills/session/evals/results/tier-sweep/opus/start-brief/with_skill/outputs/brief.md` (+9/−0) — Opus 5 start-brief output — the brief the run posted (verbatim reply)
  - `.claude/skills/session/evals/results/tier-sweep/opus/start-brief/with_skill/outputs/git-state.txt` (+21/−0) — Opus 5 start-brief output — HEAD, status, log and gate output at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/opus/start-brief/with_skill/outputs/session-file.md` (+17/−0) — Opus 5 start-brief output — the session file as the run left it
  - `.claude/skills/session/evals/results/tier-sweep/opus/start-brief/with_skill/outputs/transcript.md` (+118/−0) — Opus 5 start-brief output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/tier-sweep/opus/start-brief/with_skill/timing.json` (+1/−0) — Opus 5 start-brief: 142,346 tokens, 240.4 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/benchmark.json` (+204/−0) — aggregate-results over the Sonnet 5 runs (with_skill arm only; the baseline column is empty by design)
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/benchmark.md` (+13/−0) — aggregate-results over the Sonnet 5 runs (with_skill arm only; the baseline column is empty by design)
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/end-close/eval_metadata.json` (+15/−0) — copy of iteration-2's end-close metadata (same prompt and expectations) for the Sonnet 5 run
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/end-close/with_skill/grading.json` (+110/−0) — Sonnet 5 end-close grader verdict: 6/6
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/end-close/with_skill/outputs/git-state.txt` (+31/−0) — Sonnet 5 end-close output — HEAD, status, log and gate output at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/end-close/with_skill/outputs/overview.diff` (+1/−0) — Sonnet 5 end-close output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/end-close/with_skill/outputs/reply.md` (+2/−0) — Sonnet 5 end-close output — the run's verbatim reply
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/end-close/with_skill/outputs/session-file.md` (+18/−0) — Sonnet 5 end-close output — the session file as the run left it
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/end-close/with_skill/outputs/transcript.md` (+181/−0) — Sonnet 5 end-close output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/end-close/with_skill/timing.json` (+1/−0) — Sonnet 5 end-close: 82,793 tokens, 153.2 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/eval_metadata.json` (+16/−0) — copy of iteration-2's record-commit metadata (same prompt and expectations) for the Sonnet 5 run
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/with_skill/grading.json` (+147/−0) — Sonnet 5 record-commit grader verdict: 7/7
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/with_skill/outputs/commit.diff` (+147/−0) — Sonnet 5 record-commit output — `git show HEAD` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/with_skill/outputs/git-state.txt` (+14/−0) — Sonnet 5 record-commit output — HEAD, status, log and gate output at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/with_skill/outputs/overview.diff` (+29/−0) — Sonnet 5 record-commit output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/with_skill/outputs/reply.md` (+17/−0) — Sonnet 5 record-commit output — the run's verbatim reply
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/with_skill/outputs/session-file.md` (+46/−0) — Sonnet 5 record-commit output — the session file as the run left it
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/with_skill/outputs/transcript.md` (+291/−0) — Sonnet 5 record-commit output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/record-commit/with_skill/timing.json` (+1/−0) — Sonnet 5 record-commit: 122,720 tokens, 380.9 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/start-brief/eval_metadata.json` (+16/−0) — copy of iteration-2's start-brief metadata (same prompt and expectations) for the Sonnet 5 run
  - `.claude/skills/session/evals/results/tier-sweep/sonnet/start-brief/with_skill/grading.json` (+151/−0) — Sonnet 5 start-brief grader verdict: 7/7
  - … +25 more (`git show --stat 280d906`)
- Notes: Verified: every tier grade was checked by a grader against the fixture clone, not the transcript (reflogs, `git status`, `wc -c`/`wc -w`, driver re-runs); the trigger figures are full-N (no early stop) except the description loop's own baseline. Not verified: one run per cell — the one-expectation gaps between Sonnet, Opus and Fable are inside run-to-run spread; Haiku's six are not. Decisions: description left as is (held-out 8/9 beats both candidates' 7/9); nothing in SKILL.md changed. Found on the way: three graders flagged that Outcome/Narrative/Shipped lines are tied to no transcript evidence (next eval iteration); Peter fixed the plugin-kit aggregator token bug the same day; `optimize-description.ts` imports its HTML report module from the wrong directory (report skipped, results unaffected); the routing measurement runs in a throwaway root with no repo present.

### 2026-08-30 · feat(session): sessions are streams of work with status; tool moves into the skill as a subcommand CLI · 66b083d

- Summary: ADR-020: a session is a stream of work with `Status: open | closed` and a `Plan:` line, spanning conversations; the tool moves into the skill (`.claude/skills/session/scripts/`, `scripts/` gone, `/run-scripts` → `/run-session-tool`) and becomes a subcommand CLI (list, new, append, check, close, current) with status-based selection and a pure, tested lib; the skill gains `close` and `end` becomes leave; every doc that stated the old model rewritten; SES-001–003 closed.
- Why: Peter: a session should not be the length of a conversation; sessions want a status and a link to plans. Then, same turn: the tool should live in the skill, and as a subcommand CLI rather than flags or six scripts.
- Files:
  - `.claude/commands/session-close.md` (+9/−0) — new typed-only alias for `/session close`
  - `.claude/commands/session-end.md` (+1/−1) — description says leave: handoff written, session stays open
  - `.claude/commands/session-start.md` (+1/−1) — description: join the open session, open one, or state none (was: create this conversation's file)
  - `.claude/skills/run-envsetup/SKILL.md` (+1/−1) — the session-log line names --session and /run-session-tool
  - `.claude/skills/run-session-tool/SKILL.md` (+58/−0) — renamed from scripts/.claude/skills/run-scripts; new paths, subcommand blocks re-run, the bun-test dot-directory gotcha
  - `.claude/skills/session/CLAUDE.md` (+15/−0) — new nested CLAUDE.md: the ritual, the tool, its invariants (replaces scripts/CLAUDE.md)
  - `.claude/skills/session/SKILL.md` (+115/−61) — four modes (start joins/opens/none; entry; end = leave with a handoff commit; close); injected `list` line with PATH; gotchas for the gate's header rule, the release marker and `new`-per-stream; allowed-tools gains git show + gh pr list; the five skill-reviewer majors applied
  - `.claude/skills/session/evals/evals.json` (+11/−10) — eval 1 expects Status: open and the two-open-sessions finding; eval 3's prompt states the Goal is met (close mode); fixture note for iteration 3; subcommand spelling
  - `.claude/skills/session/scripts/__tests__/session-lib.test.ts` (+132/−0) — 13 tests over the lib: header parsing, selection (named / one open / none / several), status edit, template counts, index row, slugify
  - `.claude/skills/session/scripts/session-lib.ts` (+131/−0) — new pure half: parseHeader (Status/Plan), template, placeholderCount(closing), withStatus, indexRow, selectSession (named > single open > error)
  - `.claude/skills/session/scripts/session.ts` (+339/−0) — moved from scripts/; subcommand dispatcher (list, new, append, check, close, current; legacy --flags accepted); status-based selection; close runs the gate counting Outcome/Open at end; docs path ../../../../docs/sessions/
  - `CLAUDE.md` (+22/−16) — Rehydrating: every open session, join/open/none before the first commit, ADR-020 pointer; Recording: end = leave, close added; Commands block in subcommand spelling (list, new, append, check, close)
  - `CONTEXT.md` (+28/−9) — new section "The session log": Session, Conversation, Open/Closed, Entry and Record (the last two moved out of Configuration)
  - `CONTRIBUTING.md` (+15/−9) — step 1 joins or opens a session (list / new --plan), step 7 names end = leave and close; subcommand spelling
  - `README.md` (+3/−3) — Working-on-it line names end (leave) and close; the `bun run session` table row lists the subcommands
  - `docs/OVERVIEW.md` (+15/−8) — doc map rows for the skill and sessions (four modes, status, ADR-020), nested CLAUDE.md list (scripts/ → .claude/skills/session/), Status bullet for the session model, resume step 2 joins or opens
  - `docs/decisions/ADR-018-nested-claude-md-placement.md` (+3/−1) — dated note: scripts/ retired, its CLAUDE.md content moved into the skill
  - `docs/decisions/ADR-019-session-skill-invocation-and-name.md` (+4/−1) — status note pointing at ADR-020 (end = leave, close added)
  - `docs/decisions/ADR-020-session-model.md` (+81/−0) — new ADR: session = stream of work with status, conversation = participant, tool selection by status, end/close split, plan↔session links; the same-day move of the tool into the skill
  - `docs/decisions/README.md` (+2/−1) — index row 020; row 019 names the four modes
  - `docs/plan/README.md` (+3/−0) — rule: plans and sessions point at each other (Plan: line; ticks cite entry shas)
  - `docs/sessions/CLAUDE.md` (+6/−4) — invariant covers the status line and never appending to a closed session
  - `docs/sessions/README.md` (+44/−23) — definition of a session (ADR-020), reading rule = every open session, join/open/leave/close rules, template with Status/Plan, release-marker rule, history note
  - `docs/sessions/SES-001-foundation.md` (+1/−0) — Status: closed (migration)
  - `docs/sessions/SES-002-curl-sh-interactivity-and-first-bootstrap-fixes.md` (+1/−0) — Status: closed (migration)
  - `docs/sessions/SES-003-real-bootstrap-runs-v0.1.5-to-v0.1.9.md` (+1/−0) — Status: closed (migration)
  - `docs/sessions/SES-004-docs-rehydration.md` (+2/−0) — Status: open, Plan: — (this docs-system stream); index rows carry status
  - `package.json` (+2/−2) — `session` script points at .claude/skills/session/scripts/session.ts; `test` also runs the skill's test file by path (bun test skips dot-directories)
  - `scripts/.claude/skills/run-scripts/SKILL.md` (+0/−36) — removed — renamed to .claude/skills/run-session-tool
  - `scripts/CLAUDE.md` (+0/−9) — removed — content moved to .claude/skills/session/CLAUDE.md
  - `scripts/session.ts` (+0/−294) — removed — moved into the skill (see above)
- Notes: Verified: 13 lib tests + the 111 src tests via `bun run test`; every subcommand run against the real log (list, check --session 4, legacy `-- --check`, close on a closed session, current, an unknown command, a bare check with two open sessions refusing); validators valid for both skills and four aliases; link-check 0 broken; skill-reviewer NEEDS WORK → its five majors applied (gate/header contradiction fixed in the tool, injected line hardened, release-marker gotcha, handoff commit in end, close step 1 = end 1–3). Not verified: the `!` injection in a real conversation; the evals on the changed skill (iteration 3 follows). Decisions on the spot: `Outcome`/`Open at end` are counted only by `close`; a file without a Status line reads as open; legacy `--flag` spellings still parse.

### 2026-08-30 · eval(session): iteration 3 — the ADR-020 skill vs main's, four evals · 4e7f673

- Summary: Iteration 3 of the skill-creator loop on the ADR-020 skill: four evals (end-leave new, end-close now measures `close`), with_skill 24/24 vs the SKILL.md shipped on main 22/24, one run per cell, graded against fixture clones; results, notes and Peter's review committed. Plus the tool's refusals as one clean line.
- Why: The skill changed shape (join/open/none, end = leave, close) and needed re-measuring before the PR; Peter approved the run in the ADR-020 plan.
- Files:
  - `.claude/skills/session/evals/evals.json` (+14/−2) — eval 4 `end-leave` added; eval 3 prompt states the Goal is met; eval 1 session expectation = none | opened | joined with the disk agreeing; subcommand spelling
  - `.claude/skills/session/evals/results/iteration-3/benchmark.json` (+468/−0) — aggregate: with_skill 100% vs old_skill 90%, +1.3 s, +5,664 tokens (tokens from timing.json)
  - `.claude/skills/session/evals/results/iteration-3/benchmark.md` (+13/−0) — aggregate: with_skill 100% vs old_skill 90%, +1.3 s, +5,664 tokens (tokens from timing.json)
  - `.claude/skills/session/evals/results/iteration-3/end-close/eval_metadata.json` (+13/−0) — eval end-close: prompt + expectations handed to the graders (eval 4 end-leave is new; eval 1's session expectation accepts none | opened | joined)
  - `.claude/skills/session/evals/results/iteration-3/end-close/old_skill/grading.json` (+125/−0) — main's SKILL.md (baseline), end-close: grader verdict 6/6
  - `.claude/skills/session/evals/results/iteration-3/end-close/old_skill/outputs/git-state.txt` (+46/−0) — main's SKILL.md (baseline), end-close output — HEAD, status, log, session list and gate output at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/end-close/old_skill/outputs/overview.diff` (+1/−0) — main's SKILL.md (baseline), end-close output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/end-close/old_skill/outputs/reply.md` (+2/−0) — main's SKILL.md (baseline), end-close output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-3/end-close/old_skill/outputs/session-file.md` (+13/−0) — main's SKILL.md (baseline), end-close output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-3/end-close/old_skill/outputs/transcript.md` (+17/−0) — main's SKILL.md (baseline), end-close output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/iteration-3/end-close/old_skill/timing.json` (+1/−0) — main's SKILL.md (baseline), end-close: 82,094 tokens, 137.1 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-3/end-close/with_skill/grading.json` (+125/−0) — ADR-020 skill, end-close: grader verdict 6/6
  - `.claude/skills/session/evals/results/iteration-3/end-close/with_skill/outputs/git-state.txt` (+56/−0) — ADR-020 skill, end-close output — HEAD, status, log, session list and gate output at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/end-close/with_skill/outputs/overview.diff` (+1/−0) — ADR-020 skill, end-close output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/end-close/with_skill/outputs/reply.md` (+2/−0) — ADR-020 skill, end-close output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-3/end-close/with_skill/outputs/session-file.md` (+65/−0) — ADR-020 skill, end-close output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-3/end-close/with_skill/outputs/transcript.md` (+82/−0) — ADR-020 skill, end-close output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/iteration-3/end-close/with_skill/timing.json` (+1/−0) — ADR-020 skill, end-close: 118,917 tokens, 206.5 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-3/end-leave/eval_metadata.json` (+11/−0) — eval end-leave: prompt + expectations handed to the graders (eval 4 end-leave is new; eval 1's session expectation accepts none | opened | joined)
  - `.claude/skills/session/evals/results/iteration-3/end-leave/old_skill/grading.json` (+138/−0) — main's SKILL.md (baseline), end-leave: grader verdict 3/4 — failed: reply.md is at most 60 words, states what shipped
  - `.claude/skills/session/evals/results/iteration-3/end-leave/old_skill/outputs/git-state.txt` (+49/−0) — main's SKILL.md (baseline), end-leave output — HEAD, status, log, session list and gate output at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/end-leave/old_skill/outputs/overview.diff` (+1/−0) — main's SKILL.md (baseline), end-leave output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/end-leave/old_skill/outputs/reply.md` (+2/−0) — main's SKILL.md (baseline), end-leave output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-3/end-leave/old_skill/outputs/session-file.md` (+13/−0) — main's SKILL.md (baseline), end-leave output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-3/end-leave/old_skill/outputs/transcript.md` (+87/−0) — main's SKILL.md (baseline), end-leave output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/iteration-3/end-leave/old_skill/timing.json` (+1/−0) — main's SKILL.md (baseline), end-leave: 89,228 tokens, 154.8 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-3/end-leave/with_skill/grading.json` (+129/−0) — ADR-020 skill, end-leave: grader verdict 4/4
  - `.claude/skills/session/evals/results/iteration-3/end-leave/with_skill/outputs/git-state.txt` (+47/−0) — ADR-020 skill, end-leave output — HEAD, status, log, session list and gate output at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/end-leave/with_skill/outputs/overview.diff` (+37/−0) — ADR-020 skill, end-leave output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/end-leave/with_skill/outputs/reply.md` (+2/−0) — ADR-020 skill, end-leave output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-3/end-leave/with_skill/outputs/session-file.md` (+27/−0) — ADR-020 skill, end-leave output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-3/end-leave/with_skill/outputs/transcript.md` (+19/−0) — ADR-020 skill, end-leave output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/iteration-3/end-leave/with_skill/timing.json` (+1/−0) — ADR-020 skill, end-leave: 86,229 tokens, 152.4 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-3/feedback.json` (+45/−0) — Peter's review: every run reviewed, no feedback ("looks good"); written in the viewer's submit shape because closing its done-dialog erases an all-empty submission (plugin-kit viewer bug)
  - `.claude/skills/session/evals/results/iteration-3/notes.json` (+13/−0) — analyst pass: the contaminated baseline, the two join/none and word-count misses, the harness variance between clones, the ungraded Outcome/Narrative gap flagged by five graders, token/time per eval
  - `.claude/skills/session/evals/results/iteration-3/record-commit/eval_metadata.json` (+14/−0) — eval record-commit: prompt + expectations handed to the graders (eval 4 end-leave is new; eval 1's session expectation accepts none | opened | joined)
  - `.claude/skills/session/evals/results/iteration-3/record-commit/old_skill/grading.json` (+142/−0) — main's SKILL.md (baseline), record-commit: grader verdict 7/7
  - `.claude/skills/session/evals/results/iteration-3/record-commit/old_skill/outputs/commit.diff` (+174/−0) — main's SKILL.md (baseline), record-commit output — `git show HEAD` at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/record-commit/old_skill/outputs/git-state.txt` (+14/−0) — main's SKILL.md (baseline), record-commit output — HEAD, status, log, session list and gate output at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/record-commit/old_skill/outputs/overview.diff` (+36/−0) — main's SKILL.md (baseline), record-commit output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/record-commit/old_skill/outputs/reply.md` (+13/−0) — main's SKILL.md (baseline), record-commit output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-3/record-commit/old_skill/outputs/session-file.md` (+63/−0) — main's SKILL.md (baseline), record-commit output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-3/record-commit/old_skill/outputs/transcript.md` (+71/−0) — main's SKILL.md (baseline), record-commit output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/iteration-3/record-commit/old_skill/timing.json` (+1/−0) — main's SKILL.md (baseline), record-commit: 132,538 tokens, 298 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-3/record-commit/with_skill/grading.json` (+142/−0) — ADR-020 skill, record-commit: grader verdict 7/7
  - `.claude/skills/session/evals/results/iteration-3/record-commit/with_skill/outputs/commit.diff` (+163/−0) — ADR-020 skill, record-commit output — `git show HEAD` at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/record-commit/with_skill/outputs/git-state.txt` (+13/−0) — ADR-020 skill, record-commit output — HEAD, status, log, session list and gate output at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/record-commit/with_skill/outputs/overview.diff` (+27/−0) — ADR-020 skill, record-commit output — `git diff HEAD~1 -- docs/OVERVIEW.md` at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/record-commit/with_skill/outputs/reply.md` (+11/−0) — ADR-020 skill, record-commit output — the run's verbatim reply
  - `.claude/skills/session/evals/results/iteration-3/record-commit/with_skill/outputs/session-file.md` (+67/−0) — ADR-020 skill, record-commit output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-3/record-commit/with_skill/outputs/transcript.md` (+92/−0) — ADR-020 skill, record-commit output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/iteration-3/record-commit/with_skill/timing.json` (+1/−0) — ADR-020 skill, record-commit: 139,565 tokens, 277 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-3/start-brief/eval_metadata.json` (+15/−0) — eval start-brief: prompt + expectations handed to the graders (eval 4 end-leave is new; eval 1's session expectation accepts none | opened | joined)
  - `.claude/skills/session/evals/results/iteration-3/start-brief/old_skill/grading.json` (+153/−0) — main's SKILL.md (baseline), start-brief: grader verdict 6/7 — failed: The brief's Session line states one of the three o
  - `.claude/skills/session/evals/results/iteration-3/start-brief/old_skill/outputs/brief.md` (+9/−0) — main's SKILL.md (baseline), start-brief output — the brief the run posted (verbatim reply)
  - `.claude/skills/session/evals/results/iteration-3/start-brief/old_skill/outputs/git-state.txt` (+28/−0) — main's SKILL.md (baseline), start-brief output — HEAD, status, log, session list and gate output at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/start-brief/old_skill/outputs/session-file.md` (+795/−0) — main's SKILL.md (baseline), start-brief output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-3/start-brief/old_skill/outputs/transcript.md` (+139/−0) — main's SKILL.md (baseline), start-brief output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/iteration-3/start-brief/old_skill/timing.json` (+1/−0) — main's SKILL.md (baseline), start-brief: 187,562 tokens, 244.6 s (from the subagent's completion notification)
  - `.claude/skills/session/evals/results/iteration-3/start-brief/with_skill/grading.json` (+150/−0) — ADR-020 skill, start-brief: grader verdict 7/7
  - `.claude/skills/session/evals/results/iteration-3/start-brief/with_skill/outputs/brief.md` (+9/−0) — ADR-020 skill, start-brief output — the brief the run posted (verbatim reply)
  - `.claude/skills/session/evals/results/iteration-3/start-brief/with_skill/outputs/git-state.txt` (+41/−0) — ADR-020 skill, start-brief output — HEAD, status, log, session list and gate output at the end of the run
  - `.claude/skills/session/evals/results/iteration-3/start-brief/with_skill/outputs/session-file.md` (+10/−0) — ADR-020 skill, start-brief output — the session file as the run left it
  - `.claude/skills/session/evals/results/iteration-3/start-brief/with_skill/outputs/transcript.md` (+106/−0) — ADR-020 skill, start-brief output — the run's own step-by-step account of reads and commands
  - `.claude/skills/session/evals/results/iteration-3/start-brief/with_skill/timing.json` (+1/−0) — ADR-020 skill, start-brief: 169,367 tokens, 203.7 s (from the subagent's completion notification)
  - `.claude/skills/session/scripts/session.ts` (+14/−3) — refuse(): an unknown command, a selection error or a read failure prints one `session: …` line and exits 1 instead of a stack trace
- Notes: Verified: every grade re-run against its fixture clone by the grader (reflogs, `git show`, `wc -w`, driver re-runs, `session check` re-run); aggregate via the fixed aggregator. Not verified / caveats: one run per cell; the baseline swapped only SKILL.md so three old-skill runs followed the new docs (the +0.10 measures the skill text inside the new system); fixtures for start-brief and record-commit were cloned before 66b083d's entry landed, so those four runs had a 31-file skeleton to fill (handled per the skill by both arms); the human review was recorded by hand after the viewer's done-dialog erased an all-empty submit twice (bug for plugin-kit: `closeDoneDialog()` re-saves as in_progress with only non-empty feedback). Open: five graders flagged that Outcome/Narrative/Shipped claims are tied to no transcript evidence — the next eval iteration's expectation to add.

### 2026-08-30 · docs(skill): literal-injection gotcha (verified under claude -p); transcript-evidence expectations · a8f44b2

- Summary: The skill gains a gotcha for the case where the three injected `!` lines arrive unrendered (run them once yourself), and evals 1, 3 and 4 gain the transcript-evidence expectation five graders asked for.
- Why: Peter: fix what is still open. A `claude -p` probe in a fresh clone of main showed the Skill tool delivering SKILL.md with the `!` lines literal (the model ran them by hand); interactive rendering stays unverified, so the skill now works either way. The Outcome/Narrative-vs-transcript gap had gone ungraded through iterations 2–3.
- Files:
  - `.claude/skills/session/SKILL.md` (+3/−0) — new first gotcha: literal `!` lines mean the injection did not run — run the three commands once and treat their output as the injected state
  - `.claude/skills/session/evals/evals.json` (+8/−4) — eval 1: the brief's facts checked against the fixture (release sha, branch location, read-in-full ranges vs wc -l); evals 3 and 4: every claimed read/review/verification has a transcript step, counts and shas hold at the end of the run; fixture note says iteration 4 would be the first run with them
- Notes: Verified: the probe transcripts (`claude -p --max-turns 2 --allowedTools Skill,… "/session-start"` → Skill{skill: session, args: start} → the file with `!`…`` lines literal; the `/session start` form expanded inline with no Skill call). Not verified: rendering in an interactive session. The new expectations are unmeasured until an iteration 4 runs.
