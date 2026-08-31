---
name: run-src-items-editors
description: Run, drive, smoke and test src/items/editors — the shared Cursor/VS Code settings + extensions item factory. Use when asked to invoke cursor-config / vscode-config detect(), list EDITOR_SETTINGS or EXTENSIONS, or test editors.
---

`src/items/editors/editor-config.ts` is one factory (`editorConfigItem`) producing `cursor-config`
and `vscode-config`: merged `settings.json` keys, 12 extensions via `--install-extension`, and the
`cursor`/`code` CLI symlinked into `~/.local/bin`. Drive it with
`.claude/skills/run-src-items-editors/driver.ts` — lists the spec and runs both `detect()`s
(reads each editor's `settings.json`, installed extensions and CLI; read-only). `configure()`
writes settings and installs extensions — never called here.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

## Run (agent path)

```bash
bun src/items/editors/.claude/skills/run-src-items-editors/driver.ts
```

```text
extensions (12): zhuangtongfa.material-theme, pkief.material-icon-theme, oven.bun-vscode, golang.go, usernamehw.errorlens, yoavbls.pretty-ts-errors, dbaeumer.vscode-eslint, esbenp.prettier-vscode, eamodio.gitlens, christian-kohler.path-intellisense, mikestead.dotenv, anthropic.claude-code
settings keys (11): workbench.preferredDarkColorTheme, workbench.preferredLightColorTheme, workbench.iconTheme, editor.fontFamily, editor.fontSize, editor.formatOnSave, editor.defaultFormatter, prettier.requireConfig, prettier.useEditorConfig, eslint.workingDirectories, window.autoDetectColorScheme
cursor-config (deps cursor,font-jetbrains-nf) detect → installed=false differs
vscode-config (deps vscode,font-jetbrains-nf) detect → installed=true
OK
```

## Direct invocation

```bash
bun -e 'import {EDITOR_SETTINGS} from "./src/items/editors/editor-config.ts"; console.log(EDITOR_SETTINGS["workbench.preferredDarkColorTheme"])'
```

## Test

```bash
bun test src/items/editors/__tests__    # 3 pass, 0 fail
```

## Gotchas

- Theme is set via `workbench.preferredDark/LightColorTheme`, not `workbench.colorTheme` — the
  latter gets rewritten by `window.autoDetectColorScheme` and would read as drift forever.
- `detect()` requires the editor's CLI to resolve from the app bundle; a missing app reads as
  `installed=false` without `differs`.
