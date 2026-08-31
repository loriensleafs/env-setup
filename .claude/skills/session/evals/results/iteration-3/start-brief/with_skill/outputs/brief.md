Released: v0.1.9 (2026-08-30, 2384b88)
Unreleased on main: SES-004 — docs system, run skills, nested CLAUDE.md, CONTEXT.md, /session skill, doctor/label code (bb46dcb…0d2c6ad); ships in v0.1.10
Parked: wip/visual-grouping — PLAN-001 patch, unverified (never run under a PTY); origin only, no local branch
Findings: on feat/session-model, 1 ahead of origin/main (66b083d, ADR-020, no PR); tree clean; 66b083d has no entry — gate NOT ready for SES-004/SES-005; SES-005 is another conversation's (no Status line) — left alone
Open / unverified: `!` injection and /session-* aliases in a real conversation; connect phase never run end-to-end; idle-CPU spin; stale set-favorites.swift
Next: record 66b083d into SES-004 (/session entry), PR + merge feat/session-model — then PLAN-001 from wip/visual-grouping, PTY-verify (strong oracle), PR, release v0.1.10
Question: land feat/session-model before PLAN-001? — recommended: yes, it unblocks every gate
Session: none — nothing to record yet (66b083d's entry joins SES-004 on go)
read in full: OVERVIEW, sessions/README, SES-004, SES-005, CONTEXT.md, plan/README, PLAN-001, PRD-001, decisions/README, ADR-003, ADR-005, ADR-020, ANA-008, docs/CLAUDE.md + 4 subdir CLAUDE.md, skills/session/CLAUDE.md
