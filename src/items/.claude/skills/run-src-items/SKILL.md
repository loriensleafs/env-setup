---
name: run-src-items
description: Run, invoke and smoke-test the src/items framework — defineItem, ItemRegistry, toposort and the real registry (buildRegistry) — read-only. Use when asked to run, test, list or drive the items registry.
---

`src/items/` (this level) is the item framework: `item.ts` (the `Item` interface +
`defineItem`), `registry.ts` (`ItemRegistry.executionOrder`), `toposort.ts`, and `all.ts`
(`buildRegistry()` — the real catalog; items live in the subdirectories). Drive it with
`src/items/.claude/skills/run-src-items/driver.ts`: toposort + its errors, a fake registry's
execution order, then the real registry inspected read-only (counts by kind, which items have
ceremonies / config schemas). It never calls `install`/`configure`/`verify`.

All paths are relative to the repo root.

## Run (agent path)

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun src/items/.claude/skills/run-src-items/driver.ts
```

Expected:

```text
toposort:
  ✓ orders base → mid → leaf — base → mid → leaf
  ✓ cycle throws DependencyCycleError
  ✓ unknown dep throws UnknownDependencyError

ItemRegistry with fake items:
  ✓ executionOrder respects deps — brew → delta → delta-config → jq
  ✓ executionOrder ignores deps outside the run
  ✓ duplicate id throws DuplicateItemError

the real registry (buildRegistry, read-only):
  ✓ 68 items registered
    kinds: system=8, installer-script=3, brew-formula=10, config-only=17, brew-cask=16, font=5, repo=9
  ✓ full execution order is a valid toposort
    items with ceremonies: chrome-config, chrome-pwas, better-display, typora-config, superwhisper-config, cleanshot-config, cursor-config, raycast-config, github-auth, claude-settings
    items with configSchema: ghostty-config, better-display, superwhisper-config, podman-machine

PASS
```

## Direct invocation

```bash
bun -e 'import {buildRegistry} from "./src/items/all.ts"; console.log(buildRegistry().executionOrder().join(" → "))'
```

## Test

```bash
bun test src/items/__tests__       # 7 pass, 0 fail (registry + toposort)
bun test src/items                 # every item subdirectory too: Ran 56 tests across 17 files
```
