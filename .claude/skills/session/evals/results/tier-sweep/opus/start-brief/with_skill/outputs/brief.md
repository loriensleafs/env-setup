Released: v0.1.9 (2026-08-30, 2384b88)
Unreleased on main: the whole SES-004 docs system + the /session skill, plus code — doctor reports Drifted on its own, picker/summary say "applied", install.sh downloads to a fresh file — ships as v0.1.10.
Parked: origin/wip/visual-grouping — 10f1e24, the PLAN-001 patch, never run under a PTY, based on a33c510 so it trails main.
Findings: main, tree clean at 3e84241; gate NOT ready — 2 placeholders in SES-005, another conversation's file, left untouched; OVERVIEW calls wip/visual-grouping local, it is on origin.
Open / unverified: connect phase never exercised end to end; compiled idle-CPU spin; /session ! injection and the trigger/tier sweeps unrun.
Next: PLAN-001 (visual grouping) — first step: feat/visual-grouping off main, replay 10f1e24, then bun run check + bun test.
Question: rebase 10f1e24 onto main, or re-apply the patch by hand?
Session file: docs/sessions/SES-006-visual-grouping.md
read in full: OVERVIEW, sessions/README, SES-005, SES-004, CONTEXT.md, PLAN-001, PRD-001, ADR-003, ADR-005, and the docs/, docs/sessions/, docs/plan/, src/ui/, src/commands/ CLAUDE.md files
