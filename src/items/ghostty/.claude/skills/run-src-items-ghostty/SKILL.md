---
name: run-src-items-ghostty
description: Run, drive, smoke and test src/items/ghostty — the Ghostty config renderer and the Terminal-icon item. Use when asked to render the Ghostty config, invoke ghostty-config / ghostty-icon detect(), or test ghostty.
---

`src/items/ghostty` = `ghostty-config` (Zod schema → `renderGhosttyConfig()` → managed
`config.ghostty`) and `ghostty-icon` (swaps the Dock icon for macOS Terminal's via
`NSWorkspace.setIcon`). Drive it with `src/items/ghostty/.claude/skills/run-src-items-ghostty/driver.ts`: renders the
config from schema defaults and runs both `detect()`s (file compare / `Icon\r` presence —
read-only). `configure()` writes the config file and restarts the Dock; never called here.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun src/items/ghostty/.claude/skills/run-src-items-ghostty/driver.ts
```

```text
defaults: {"fontFamily":"JetBrainsMono Nerd Font","fontSize":13,"theme":"One Dark Two","quickTerminal":true}
renderGhosttyConfig → 24 lines:
  # managed by envsetup
  theme = One Dark Two
  font-family = JetBrainsMono Nerd Font
  font-size = 13
  …
ghostty-config.detect → installed=true
ghostty-icon.detect → installed=false
OK
```

`ghostty-icon installed=false` = Missing: the icon is absent (cask upgrades wipe it; a re-run or
`sync` re-applies it).

## Direct invocation

```bash
bun -e 'import {renderGhosttyConfig, ghosttyConfigSchema} from "./src/items/ghostty/ghostty-config.ts"; console.log(renderGhosttyConfig(ghosttyConfigSchema.parse({fontSize:14})))'
```

## Test

```bash
bun test src/items/ghostty/__tests__    # 4 pass, 0 fail
```

## Gotchas

- `ghostty-config.detect()` compares the whole rendered file to the one on disk; any hand edit
  reads as Drifted (`differs`) — extend `renderGhosttyConfig`, never patch the file.
- `ghostty-icon` needs `swift` from the Xcode CLT at configure time; detect only runs `ls`.
