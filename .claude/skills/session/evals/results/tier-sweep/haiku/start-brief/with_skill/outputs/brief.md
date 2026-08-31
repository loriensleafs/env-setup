Released: v0.1.9 (2026-08-30, bb46dcb)
Unreleased on main: docs system (OVERVIEW, sessions, PLAN/ADRs/ANAs, 28 run skills with drivers, nested CLAUDE.md files, vocabulary alignment); session skill (start|entry|end with injected state); code: doctor labels (Satisfied/Missing/Drifted/Untracked, Applied/Wanted); context.md; root files rewritten.
Parked: visual grouping + progress tracker patch on wip/visual-grouping (unverified, never run under PTY).
Findings: clean — branch main, tree clean, gate NOT ready (SES-005 has 2 unfilled placeholders from a concurrent session, left for that conversation to complete).
Open / unverified: /session skill's `!` injection verified only by real conversation (not in eval fixture); trigger sweep and model-tier sweep never run.
Next: Start from PLAN-001 on wip/visual-grouping — review the patch, decide on connect-phase step numbering, verify under PTY with the expect harness, PR, merge, release v0.1.10.
Session file: docs/sessions/SES-007-picking-back-up.md
read in full: OVERVIEW.md; sessions README.md, SES-004 (full), SES-005 (header only); CONTEXT.md; PLAN-001.
