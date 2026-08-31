---
name: run-src-items-defs
description: Run, drive, smoke and test src/items/defs — the core envsetup items (Xcode CLT, Homebrew, bun, uv, Node, fonts, git identity/email, dotfiles + managed zsh block, macOS defaults, Dock, Raycast, CleanShot, superwhisper, Podman, BetterDisplay, GitHub auth, SSH keys). Use when asked to invoke an item's detect(), inspect config schemas/defaults, render the zsh block, or test defs.
---

`src/items/defs` is the bulk of the item registry. Drive it with
`.claude/skills/run-src-items-defs/driver.ts`: it exercises the pure helpers (BetterDisplay menu
profiles, the Zod config schemas' defaults, macOS `DEFAULTS`, `DOCK_APPS`, the assembled managed
`~/.zshrc` block + `zshGaps` against a scratch file) and then runs **every item's `detect()`**
with the real runner — exactly what `envsetup doctor` does, read-only. It never calls
`install()`/`configure()`, and skips `github-auth` / `ssh-keys` whose `detect()` calls the GitHub
API.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

## Run (agent path)

```bash
SCRATCH=/tmp/envsetup-defs-driver bun src/items/defs/.claude/skills/run-src-items-defs/driver.ts
```

Output on this machine (detect results are machine state, yours will differ):

```text
menuLevels(default): top=9 submenu=17 hidden=7 of 33
menuLevels(minimal): top=4 submenu=0 hidden=29 of 33
menuLevels(everything): top=26 submenu=0 hidden=7 of 33
betterDisplaySchema defaults: {"menuProfile":"default","startAtLogin":true,"menuBarIcon":true,"dockVisibility":"never","briefDockIconOnStartup":false,"autoUpdate":true,"sendUsageInfo":false}
podmanMachineSchema defaults: {"cpus":4,"memoryMb":8192,"diskGb":100}
superwhisperConfigSchema defaults: {"pushToTalk":"right-option","alwaysShowMiniRecorder":true,"showInDock":false,"showExperimentalModels":true,"recordingView":false,"autoUpdate":true}
macos DEFAULTS: 10 keys · DOCK_APPS: Apps · System Settings · Ghostty · Cursor · Typora · Claude · Chrome · Mail · Calendar · Drive · Notes
managed zsh block: 28 lines, # >>> envsetup managed >>> … # <<< envsetup managed <<<; gaps vs fixture: 0
  xcode-clt            installed=true v26.6.0.0.1781586589
  homebrew             installed=true v6.0.19
  bun                  installed=true v1.4.0
  …
  better-display       installed=false v4.3.6 differs
  dotfiles             installed=false
skipped detect(): github-auth, ssh-keys (GitHub API calls)
OK
```

`installed=false differs` = present but configured differently from our defaults (reset-on-drift).
Takes ~3 s (each detect shells out: `brew list`, `defaults read`, `git config`, …).

## Direct invocation

```bash
bun -e 'import {menuLevels} from "./src/items/defs/better-display.ts"; console.log(menuLevels("minimal"))'
bun -e 'import {buildRegistry} from "./src/items/all.ts"; import {assembleManagedBlock} from "./src/items/defs/shell-block.ts"; console.log(assembleManagedBlock(buildRegistry().all()))'
```

## Test

```bash
bun test src/items/defs/__tests__     # 22 pass, 0 fail (6 files)
```

## Gotchas

- `detect()` is safe; `install()`/`configure()` run `defaults write`, `killall Dock/Finder`,
  installers and `curl`. Never call them from a driver.
- `github-auth.detect()` and `ssh-keys.detect()` hit `api.github.com` with the Keychain token —
  excluded from the driver on purpose.
- `dotfiles` is a factory (`makeDotfiles(allItems)`); its `detect()` compares the real `~/.zshrc`
  block to the assembled one, so it reads `differs`/`false` whenever any item's `zsh()` changed.
