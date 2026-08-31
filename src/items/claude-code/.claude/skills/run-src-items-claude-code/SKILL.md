---
name: run-src-items-claude-code
description: Run, drive, smoke and test src/items/claude-code — the claude-settings item that generates ~/.claude/settings.json and installs the hooks/statusline. Use when asked to invoke buildSettings, detect drift, or test the Claude Code item without writing to ~/.claude.
---

`src/items/claude-code` = the `claude-settings` item: `buildSettings()` templates
`assets/settings.template.json` onto this machine (marketplace path under the Dev dir, ACMElabs
plugins filtered to the selected repos, statusline → the pure-Bun port), and `configure()` writes
`~/.claude/settings.json` + four asset scripts. Drive it with
`.claude/skills/run-src-items-claude-code/driver.ts`: it resolves the embedded asset paths, builds
settings into memory from a fixture selection, and runs `detect()` (deep-compares the real
`~/.claude/settings.json` + assets — read-only). It never calls `configure()`.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

## Run (agent path)

```bash
bun src/items/claude-code/.claude/skills/run-src-items-claude-code/driver.ts
```

```text
assets resolve: settings.template.json, hooks-notify.ts, hooks-subagent-statusline.ts, hooks-format.ts, statusline.ts ✓
marketplace path → /Users/peterkloss/Dev/ACMElabs/.claude-plugin/marketplace.json
ACMElabs plugins kept for selection {repo-skills, repo-code-review}: code-review@ACMElabs, skills@ACMElabs
statusLine.command → bun ~/.claude/statusline.ts
claude-settings.detect → installed=false differs
OK
```

`installed=false differs` = this machine's `~/.claude/settings.json` (or a deployed asset) is
not byte-equivalent to what the current template would produce — the reset-on-drift signal
`envsetup doctor` shows as `≠`.

## Direct invocation

```bash
bun -e 'import {buildSettings} from "./src/items/claude-code/claude-settings.ts"; import {ASSET_PATHS} from "./src/items/claude-code/assets-embed.ts"; const t=await Bun.file(ASSET_PATHS["settings.template.json"]).json(); console.log(Object.keys(buildSettings({template:t,devDir:"~/Dev",selection:new Set()}).enabledPlugins))'
```

## Test

```bash
bun test src/items/claude-code/__tests__    # 4 pass, 0 fail
```

## Gotchas

- `ASSET_PATHS` come from `with { type: "file" }` imports — under `bun run` they are paths into
  `src/items/claude-code/assets/`, under the compiled binary they are `/$bunfs/…` paths. Always
  read assets through `ASSET_PATHS`, never `import.meta.dir`.
- The shipped scripts themselves are driven by the `run-src-items-claude-code-assets` skill.
