# 2026-08-30 18:00 · Docs for rehydration — OVERVIEW, ledger → granular entries → sessions, continuous upkeep

- Goal: Make a fresh session able to pick up exactly where the last one stopped: a handoff overview, a complete record of what was done (with files), and a discipline that keeps it all current.
- Outcome: OVERVIEW.md; a git-derived change record that evolved (one line per commit → files touched → Summary/Why + a note per file → per-session files); `bun run session` tooling with `--check`; CLAUDE.md rehydration reading order; continuous-upkeep hard rule; then the whole docs system — `plan/` (PRD-001, PLAN-001), `analysis/` (ANA-001…008), `decisions/` (ADR-001…017), `archive/` — with one naming convention `<TYPE>-<NNN>-<kebab-title>.md`, the living plan retired.
- Open at end: Next-up 1 (visual grouping, PLAN-001) from `wip/visual-grouping`; first real connect-phase run.

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
