---
name: run-src-paths
description: Run, invoke and smoke-test src/paths — envsetup's XDG-style config/state locations. Use when asked to run, test or check where the manifest and journal live.
---

`src/paths/paths.ts`: `configDir()` (`~/.config/envsetup`), `stateDir()`
(`~/.local/state/envsetup`), `manifestPath()`, `journalPath()`, honouring `XDG_CONFIG_HOME` /
`XDG_STATE_HOME`. Drive it with `src/paths/.claude/skills/run-src-paths/driver.ts` (nothing is
created; overrides point at a temp dir).

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun src/paths/.claude/skills/run-src-paths/driver.ts
```

Expected:

```text
  ✓ configDir defaults to ~/.config/envsetup — /Users/<you>/.config/envsetup
  ✓ stateDir defaults to ~/.local/state/envsetup — /Users/<you>/.local/state/envsetup
  ✓ manifestPath under configDir
  ✓ journalPath under stateDir
  ✓ XDG_CONFIG_HOME override honoured — …/envsetup-paths-XXXX/cfg/envsetup
  ✓ XDG_STATE_HOME override honoured — …/envsetup-paths-XXXX/state/envsetup/journal.jsonl

PASS
```

## Direct invocation

```bash
bun -e 'import {manifestPath, journalPath} from "./src/paths/paths.ts"; console.log(manifestPath(), journalPath())'
```

Point every envsetup command at a sandbox instead of the real machine state:

```bash
XDG_CONFIG_HOME=/tmp/x/cfg XDG_STATE_HOME=/tmp/x/state bun src/index.ts doctor   # "no manifest yet — raw detection"
```

## Test

```bash
bun test src/paths/__tests__       # 3 pass, 0 fail
```
