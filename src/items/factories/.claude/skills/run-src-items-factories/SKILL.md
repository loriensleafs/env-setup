---
name: run-src-items-factories
description: Run, drive, smoke and test src/items/factories — the brewFormula / brewCask / fontZip item factories. Use when asked to construct a factory item, run its detect() with a mocked runner, or test factories.
---

`src/items/factories` builds items from specs: `brewFormula`/`brewCask` (Homebrew, with `.app`
fallback detection and custom brew names) and `fontZip` (pinned zip → `~/Library/Fonts`). Drive it
with `.claude/skills/run-src-items-factories/driver.ts`, which constructs one of each and runs
`detect()` through a **mocked** `Runner` (no `brew` is executed) — the same pattern as
`__tests__/brew.test.ts`. `fontZip.detect()` only probes a file in `~/Library/Fonts`.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

## Run (agent path)

```bash
bun src/items/factories/.claude/skills/run-src-items-factories/driver.ts
```

```text
brewFormula(jq): kind=brew-formula deps=homebrew detect={"installed":true,"version":"1.7.1"} via brew list --versions jq
brewCask(ghostty): kind=brew-cask detect(not brew-managed) → {"installed":false}
fontZip(font-demo): kind=font detect → {"installed":false} (probes ~/Library/Fonts, no download)
OK
```

## Direct invocation

```bash
bun -e 'import {brewFormula} from "./src/items/factories/brew.ts"; const i=brewFormula({id:"jq",title:"jq"}); console.log(i.id, i.kind, i.deps)'
```

## Test

```bash
bun test src/items/factories/__tests__    # 7 pass, 0 fail
```

## Gotchas

- The runner is injected via `ItemContext.run`; pass a mock to keep drivers hermetic — with the
  real `run` these `detect()`s execute `/opt/homebrew/bin/brew list --versions <name>`.
- `install()` on both factories shells out to `brew install` / `curl` + `unzip` — never in a driver.
