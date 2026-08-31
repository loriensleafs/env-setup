---
name: run-src-items-repos
description: Run, drive, smoke and test src/items/repos — the repo-clone item factory (ACMElabs + reference clones) and the generated ACMElabs plugin marketplace. Use when asked to list the decided repos, render marketplace.json from a fixture, invoke repo/marketplace detect(), or test repos.
---

`src/items/repos` = `repoItem()` (clones into `{devDir}/ACMElabs/` or `{devDir}/reference/`,
private ones through `gh`) and `acmelabs-marketplace` (generates
`.claude-plugin/marketplace.json` over the repos actually cloned). Drive it with
`.claude/skills/run-src-items-repos/driver.ts`: lists the specs, renders the marketplace from a
**scratch** fixture (no clones, no network), and runs `detect()` for one repo item and the
marketplace item (directory / file comparison — read-only). `install()` clones; `configure()`
writes the real marketplace file — never called here.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

## Run (agent path)

```bash
SCRATCH=/tmp/envsetup-repos bun src/items/repos/.claude/skills/run-src-items-repos/driver.ts
```

```text
ACMELABS_REPOS: repo-skills, repo-ask-user-question, repo-plugin-kit, repo-code-review, repo-code-simplifier
REFERENCE_REPOS: basic-memory, addy-osmani-agent-skills, matt-pocock-skills, rj-murillo-ai-agents
expandHome("~/Dev") → /Users/peterkloss/Dev
renderMarketplace(fixture with skills only) → included=skills · 18 lines
repo-skills.detect → {"installed":true}
acmelabs-marketplace.detect → installed=true
OK
```

## Direct invocation

```bash
bun -e 'import {renderMarketplace} from "./src/items/repos/acmelabs-marketplace.ts"; console.log((await renderMarketplace("/nonexistent")).content)'   # valid marketplace with plugins: []
```

## Test

```bash
bun test src/items/repos/__tests__    # 1 pass, 0 fail
```

## Gotchas

- `renderMarketplace(dir)` only includes repos whose `<dir>/<repo>/.claude-plugin/plugin.json`
  exists — selection-aware by construction; `plugin-kit` is cloned but is not a plugin.
- `detect()` on a repo item is a directory-exists check; it does not verify the remote.
