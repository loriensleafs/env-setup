---
name: run-src-orchestrator
description: Run, invoke and smoke-test src/orchestrator — the dependency-ordered, journaled install engine — over fake in-memory items. Use when asked to run, test or drive the orchestrator/failure policy.
---

`src/orchestrator/orchestrator.ts`: `orchestrate({registry, manifest, selection, journalPath,
runner, events, ask})` runs items in toposorted order, skips satisfied ones, retries once,
skips dependents of a failure, aborts on a required failure, defers ceremony-only items, and
journals every step. Drive it with
`src/orchestrator/.claude/skills/run-src-orchestrator/driver.ts` — six **fake** items with a
mocked `Runner` and a temp journal, so the whole policy runs without touching the machine.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun src/orchestrator/.claude/skills/run-src-orchestrator/driver.ts
```

Expected:

```text
  outcomes: already=skipped-installed, attended=deferred, base=succeeded, broken=failed, dependent=skipped-dependency, flaky=succeeded
  ✓ base installed before flaky (dependency order) — base → flaky
  ✓ already-installed item skipped
  ✓ one auto-retry rescues flaky
  ✓ broken fails after 2 attempts
  ✓ dependent skipped because its dep failed
  ✓ ceremony-only item is deferred
  ✓ run finished (no required item failed)
  ✓ transitiveDependents(broken) = dependent

PASS
```

Use the driver as the template for driving any new item through the engine: register a fake
(or the real item with a mocked `runner`), pick a temp `journalPath`, read `report`.

## Test

```bash
bun test src/orchestrator/__tests__   # 9 pass, 0 fail
```

## Gotchas

- `transitiveDependents(registry, selection, id)` — selection comes **before** id, and it
  returns a `Set`, not an array.
