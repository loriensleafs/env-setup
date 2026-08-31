---
name: run-src-exec
description: Run, invoke and smoke-test src/exec — the injectable command Runner every item uses. Use when asked to run, test or drive the exec/run module.
---

`src/exec/run.ts` exports `run(cmd[], {env, cwd})` → `{exitCode, stdout, stderr}` (a
`Bun.spawn` wrapper) and the `Runner` type items receive via `ItemContext` so tests can mock
it. Drive it with `src/exec/.claude/skills/run-src-exec/driver.ts`, which runs harmless
commands (`echo`, `sh -c exit 3`, `pwd`) through the real `run`.

All paths are relative to the repo root.

## Run (agent path)

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun src/exec/.claude/skills/run-src-exec/driver.ts
```

Expected:

```text
src/exec driver — run() over harmless commands

  ✓ echo → stdout captured, exit 0
  ✓ sh -c exit 3 → exitCode 3, stderr captured
  ✓ opts.env is merged into the child env
  ✓ opts.cwd sets the working directory — /private/tmp

PASS
```

## Direct invocation

```bash
bun -e 'import {run} from "./src/exec/run.ts"; console.log(await run(["uname","-s"]))'
# { exitCode: 0, stdout: "Darwin\n", stderr: "" }
```

## Test

```bash
bun test src/exec/__tests__        # 3 pass, 0 fail
```

## Gotchas

- `cwd: "/tmp"` reports `/private/tmp` on macOS (`/tmp` is a symlink) — compare with
  `endsWith`, not equality.
