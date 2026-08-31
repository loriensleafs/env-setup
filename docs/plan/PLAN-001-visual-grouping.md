# Plan: visual grouping of the config flow + overall progress tracker

> Status: planned · patch parked on local branch `wip/visual-grouping` (unverified) · Peter,
> 2026-08-30 · PRD UX requirement 4

## Overview

In the config screens the last field of one item runs straight into the next item's first field
(Peter: "visual grouping between item config groups" + "an overall progress tracker"). Give each
item a boxed header and show where the user is in the whole bootstrap.

## Decisions it relies on

- ADR-003 (stock-clack fidelity — headers use `p.note`, phase markers use `p.log.step`).
- ADR-005 (the phases are: scan, identity, pick, configure, review; connect runs after install).
- No new ADR needed.

## Parts

### Part 1: implement (patch exists)

> Status: planned

- [ ] Task 1: `git checkout -b feat/visual-grouping wip/visual-grouping`; review the WIP commit:
  `promptItemConfig(item, stored, position?: { index; total })` renders `p.note(item.title,
  \`Configure ${index} of ${total}\`)` instead of `p.log.step(item.title)`
  (`src/ui/config-screens.ts`);`phase(n, title)` = `p.log.step(bold(\`Step ${n} of 5 · …\`))`
  before scan / identity / picker / configs (only when there are configurable items) / review
  (`src/commands/bootstrap.ts`). Acceptance:`bun run check` + `bun test` green.
- [ ] Task 2: decide whether the connect phase counts as step 6 (recommend: yes when the run has
  ceremonies; the marker is cheap) and add it in `executePlan` before `runConnectPhase`.

- [ ] Checkpoint — verified under a PTY: drive `bun src/index.ts --defaults`-free run under the expect harness pattern in
  `.claude/skills/run-envsetup/` with a strong oracle: strip ANSI, assert the "Step 4 of 5"
  marker and the boxed "Configure 1 of N" frame precede the first field, and that the frame
  closes before the next item's header.

### Part 2: ship

> Status: planned

- [ ] Task 3: session entry, PRD requirement 4 marked done, OVERVIEW Next-up 1 removed; PR; merge;
  release v0.1.10 per CONTRIBUTING.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `p.note` box wider than narrow terminals | Low | clack wraps; verify at 80 cols in the PTY test |
| Step count wrong when no configurable items | Low | skip marker 4 and keep numbering (documented) |

## Open questions

- None; Peter has approved the design.
