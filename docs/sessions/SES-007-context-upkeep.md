# 2026-08-31 02:56 · CONTEXT.md upkeep — ANA-010's four implications

- Goal: act on ANA-010's four implications for envsetup: a judgment-free retired-word check, the two glossary sections the reference's own file grew, the domain.md question, and the success test — so the glossary stays current without a human noticing "ledger" by eye.
- Status: closed
- Plan: —
- Outcome: all four implications done in `afc9dca`: the retired-word check runs green (`10 files, 1 former names, 0 hits`), the two glossary sections exist, the success test is written down, no domain.md is needed. Not built: a frequency-based undefined-term detector (ANA-010 finding D3 says advisory at most).
- Open at end: nothing — `avoid-check.ts` is not in `bun run check` or CI on purpose (it reads the glossary, a docs concern; run it from `/run-docs`); wire it into the `check` script if a retired word slips past again.

## Narrative

Opened after SES-006 closed (PR #45): its handoff named ANA-010's implications as unaddressed. A prototype over every unqualified `_Avoid_` item (93 of 130) showed the lists are sense restrictions (check, status, done, update, log, step) that would flood a word-level check, so the check enforces only items the glossary marks `(former name, …)`; the historical "ledger" lines in SES-004 and SES-006 stay because records are not checked, and the one live hit (the sessions README) now names the file `docs/LEDGER.md` instead. Verified: avoid-check 0 hits (1 hit before the README fix), link-check 145/0 broken, markdownlint 0 issues, Biome clean, the gate.

## Changes (one entry per commit, in order)

### 2026-08-31 · docs(context): retired-word check, Relationships and Flagged ambiguities — ANA-010's implications · afc9dca

- Summary: ANA-010's four implications land: `avoid-check.ts` refuses a glossary-marked former name in the live prose, `CONTEXT.md` gains Relationships and Flagged ambiguities, the success test sits in CLAUDE.md Recording, and the domain.md question is closed as already covered.
- Why: SES-006's handoff left the implications open; "ledger" had crept back once (`2dd1455`) with nobody noticing, and the reference gives no mechanism to copy (ANA-010).
- Files:
  - `CLAUDE.md` (+3/−1) — Recording: the success test (glossary changes during the conversation, shrinks as often as it grows) and the avoid-check command
  - `CONTEXT.md` (+24/−1) — ledger marked `(former name, retired by ADR-017)`; new `## Relationships` (Machine/Manifest/Item, Run/Step/Ceremony, Session/Plan part/Entry/Gate) and `## Flagged ambiguities` (ledger, Open status vs move, check, session vs conversation, Step vs Plan part)
  - `docs/.claude/skills/run-docs/SKILL.md` (+21/−2) — a "retired words" run section: command, expected line, scope, how to retire a word; description names the check
  - `docs/.claude/skills/run-docs/avoid-check.ts` (+66/−0) — new — reads `_Avoid_` items marked `former name`, scans the live prose (index region, code spans and fences skipped), exit 1 per hit
  - `docs/OVERVIEW.md` (+4/−0) — Status: CONTEXT.md upkeep bullet (SES-007)
  - `docs/analysis/ANA-010-context-md-maintenance-in-the-reference-skills.md` (+16/−1) — "Acted on — 2026-08-31": what each implication became, and why the check enforces former names only (93 of 130 items are sense restrictions)
  - `docs/sessions/README.md` (+2/−1) — history line names `docs/LEDGER.md` instead of the retired word — the one live hit the check found
