---
name: run-src-items-claude-code-assets
description: Run, drive and smoke src/items/claude-code/assets — the Claude Code statusline, subagent-statusline, format and notify hook scripts envsetup installs into ~/.claude. Use when asked to run, test or invoke statusline.ts / hooks-*.ts with a payload.
---

These are the scripts envsetup deploys to `~/.claude` (stdin-JSON contracts per the Claude Code
hook docs). Drive them with `.claude/skills/run-src-items-claude-code-assets/driver.ts`, which
pipes fixture payloads into each script and asserts the contract: `statusline.ts` → one line;
`hooks-subagent-statusline.ts` → one JSON row per task; `hooks-format.ts` → formats a file inside a
scratch project; `settings.template.json` → references all four scripts. `hooks-notify.ts` is
**not** run: it has no dry-run path and fires a real macOS notification + raises Ghostty.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install      # hooks-format.ts uses the repo's node_modules/.bin/biome for the fixture
```

## Run (agent path)

```bash
SCRATCH=/tmp/envsetup-assets-driver bun src/items/claude-code/assets/.claude/skills/run-src-items-claude-code-assets/driver.ts
```

```text
statusline.ts →  main ●    Fable 5
hooks-subagent-statusline.ts → 2 rows: ● reviewer · running · opus · high · ctx 12% · 2m14s | ✓ explorer · done · sonnet
hooks-format.ts → formatted /tmp/envsetup-assets-driver/project/ugly.ts: "const x = { a: 1, b: 2 };\nexport default x;"
settings.template.json hooks: Notification, Stop, FileChanged + statusLine + subagentStatusLine ✓
hooks-notify.ts: skipped (no dry-run path; fires a real notification)
OK
```

## Direct invocation

```bash
echo '{"cwd":"'$PWD'","model":{"display_name":"Fable 5"},"context_window":{"used_percentage":42}}' | bun src/items/claude-code/assets/statusline.ts; echo
echo '{"columns":100,"tasks":[{"id":"t1","name":"reviewer","status":"running","model":"claude-opus-5"}]}' | bun src/items/claude-code/assets/hooks-subagent-statusline.ts
```

## Test

No tests in this directory (the scripts are payloads, excluded from the project typecheck).
The installer around them: `bun test src/items/claude-code/__tests__` (4 pass).

## Gotchas

- **`hooks-format.ts` silently does nothing when Biome's config errors.** The repo's own
  `biome.json` has `vcs.useIgnoreFile: true`, which makes `biome check` fail with "configuration
  resulted in errors" in a directory that is not a git repo — and the hook always exits 0. The
  driver's fixture therefore uses a minimal `{"formatter":{...}}` config. If a real project's
  formatting "doesn't happen", run `biome check --write <file>` by hand in that project to see why.
- `hooks-format.ts` resolves the project via `$CLAUDE_PROJECT_DIR` (never cwd) and only formats
  files under it; a `change_type` starting with `delete` is a no-op.
- The statusline output is ANSI-coloured and has no trailing newline (by contract).
