---
name: run-src-journal
description: Run, invoke and smoke-test src/journal — the append-only JSONL run journal and computeResume — against a temp file. Use when asked to run, test or drive the journal/resume logic.
---

`src/journal/journal.ts`: Zod-validated JSONL events (`appendEvent`, torn-line-tolerant
`readEvents`) and `computeResume` (latest run's completed/failed steps, `RUN_END_STEP`
finished marker) that drive "resume?" and "failed last run — retry". Drive it with
`src/journal/.claude/skills/run-src-journal/driver.ts` — it writes to a **temp** journal,
never `~/.local/state/envsetup/journal.jsonl`.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun src/journal/.claude/skills/run-src-journal/driver.ts
```

Expected:

```text
src/journal driver — /var/folders/…/envsetup-journal-XXXX/journal.jsonl

  ✓ unfinished run detected
  ✓ homebrew is completed
  ✓ jq is in failedSteps
  ✓ RUN_END_STEP marks the run finished
  ✓ readEvents returns the 5 complete events, drops the torn line
  ✓ empty journal → no run

PASS
```

## Direct invocation (read the REAL journal, read-only)

```bash
bun -e 'import {readEvents, computeResume} from "./src/journal/journal.ts"; const r = computeResume(await readEvents()); console.log(r.runId, r.finished, [...r.failedSteps])'
```

## Test

```bash
bun test src/journal/__tests__     # 5 pass, 0 fail
```

## Gotchas

- `appendEvent` appends `\n`-terminated lines; if the file ends in a torn fragment (no
  newline), the next event lands on that same line and is dropped by the reader — the driver
  had to write its torn-line test last for that reason.
