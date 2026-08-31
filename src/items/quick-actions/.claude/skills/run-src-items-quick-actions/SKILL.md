---
name: run-src-items-quick-actions
description: Run, drive, smoke and test src/items/quick-actions — the Finder right-click Quick Actions (Automator services wrapping pure-Bun payloads). Use when asked to render workflowXml, list ACTIONS, invoke quick-actions detect(), or test quick-actions.
---

`src/items/quick-actions/quick-actions.ts` writes three Automator `.workflow` services
(Copy Path, Open in Ghostty, Open in Cursor) into `~/Library/Services`, each exec-ing a Bun payload
in `~/.config/envsetup/scripts/`. Drive it with
`.claude/skills/run-src-items-quick-actions/driver.ts`: lists `ACTIONS`, renders `workflowXml()`
into scratch and lints it with `plutil`, and runs `detect()` (checks the bundles exist —
read-only). `configure()` writes the services and runs `pbs -update`; never called here.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

## Run (agent path)

```bash
SCRATCH=/tmp/envsetup-quick-actions bun src/items/quick-actions/.claude/skills/run-src-items-quick-actions/driver.ts
```

```text
ACTIONS: Copy Path (copy-path.ts) · Open in Ghostty (open-ghostty.ts) · Open in Cursor (open-cursor.ts)
workflowXml → 2614 bytes, plutil -lint: /tmp/envsetup-quick-actions/document.wflow: OK
quick-actions.detect (deps bun,ghostty,cursor) → installed=true
OK
```

## Direct invocation

```bash
bun -e 'import {workflowXml} from "./src/items/quick-actions/quick-actions.ts"; console.log(workflowXml("/tmp/x.ts").split("\n").length, "lines")'
```

## Test

```bash
bun test src/items/quick-actions/__tests__    # 2 pass, 0 fail
```

## Gotchas

- The payloads (`PAYLOADS`) call `open -a Ghostty|Cursor` when invoked from Finder — the driver
  never executes them, it only validates the workflow plist.
- `plutil -lint` needs an absolute path; the driver writes to `$SCRATCH` (default
  `/tmp/envsetup-quick-actions-driver`).
