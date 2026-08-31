# App configuration and licensing mechanics — analysis

> **Analysis** · 2026-08-26 (captures) · status: current; **re-capture on app upgrades** — most of
> this is machine-captured truth, not documented API. Sources per app below.

## Question

For each app envsetup configures, how can its settings — and its license — be applied
programmatically before or without launching the GUI?

## Findings

### CleanShot X (`pl.maketheweb.cleanshotx` defaults domain) — captured by pre/post diff

- `activationKey` is a **plain defaults key**: licensing is scriptable pre-launch (written from the
  secret store by `cleanshot-config`; no paste ceremony).
- The app persists only settings changed from default. Shortcut takeover is stored as JSON `-data`
  blobs (⇧⌘ = 768; keys 20/21/23 = 3/4/5). `defaults read` truncates `-data`; compare via
  `defaults export` XML base64. macOS symbolic hotkeys 28/30/184 must be disabled or the system
  wins ([config-compatibility](ANA-007-config-compatibility.md) #1).
- Remaining ceremony: the Screen Recording TCC grant ([macos-permissions-tcc](ANA-005-macos-permissions-tcc.md)).

### BetterDisplay — captured by toggle-and-diff (keys are not grep-able from the binary)

- The bulk of config is 33 `menuLevel*` keys (string enum `less` = top menu / `more` = submenu /
  `hide`), exposed as a 3-way `menuProfile`. Global keys: `dockIcon` (string enum
  `never`/`auto`/`always`), `hideMenuIcon` (bool, **inverted**), `dockInsertRecentsOnStartupWhenHidden`
  (bool = "briefly show Dock icon on startup"). Sparkle keys `SUEnableAutomaticChecks` /
  `SUAutomaticallyUpdate` / `SUSendProfileInfo` are real (framework present). Start-at-login is
  `SMAppService` (no defaults key) → registered as a classic login item via System Events.
- Phantom keys that were no-ops and got removed: `showMenuBarItem`, `startAtLogin`.
- Per-display settings (brightness/HiDPI/resolution) are not presettable → guided capture ceremony.
- **Licensing: no scriptable path.** Paddle online licensing; `betterdisplaycli` only does display
  control; no license key in the defaults domain (only `showProLicenseError`); no URL-scheme
  activation. Ceiling: clipboard + guided paste in Settings → license.

### Typora

- Theme: **Vercel** (theme.typora.io, by tecladochen); the release zip is **nested** (find
  `vercel.css` + sibling `vercel/` dir inside). Font deps Geist + Inter → fonts group.
- License is online-validated → clipboard ceremony. License blobs verified machine-bound.

### superwhisper

- Settings live in defaults (`pushToTalk` = `carbonKeyCode` 61 / modifiers 2048 for right-⌥;
  `alwaysShowMiniRecorder`, `showApplicationInDock`, `showExperimentalModels`,
  `recordingViewEnabled`, Sparkle auto-update keys); modes/custom vocabulary live in sqlite (not
  templated). License online → clipboard ceremony. Mic/Accessibility grants via deep links.

### Raycast

- Raycast takes ⌘Space: disable Spotlight symbolic hotkey 64 via PlistBuddy, set
  `raycastGlobalHotkey` = `Command-49`, `activateSettings -u` reload — mandatory ordering, done in
  one `configure()`. Clipboard history ⌥V. Starter extensions via deeplinks. No cloud sync /
  `.rayconfig` for now.

### Podman

- `podman machine init` 4 CPU / 8 GB / 100 GB (Zod-clamped; existing machine untouched; start on
  demand). The socket path is per-machine (known only after init) → `configure()` runs
  `podman machine inspect` once and writes `export DOCKER_HOST=unix://<sock>` to
  `~/.config/envsetup/podman-env.zsh`, sourced by the shell block (no per-shell subprocess).
  Docker-API tools then just work; `docker=podman` alias covers the CLI.

### Editors (Cursor / VS Code)

- CLI resolved from the app bundle (deterministic; no `code`-shim confusion) and symlinked into
  `~/.local/bin` so `cursor` / `code <path>` work. Model gating in Cursor is app state, not
  `settings.json` → guided ceremony. `anthropic.claude-code` extension id verified via the
  marketplace gallery API.

### Ghostty

- Config file at `~/Library/Application Support/com.mitchellh.ghostty/config.ghostty`; option names
  verified against the local binary. Dock icon: `NSWorkspace.setIcon` with the OS's own
  `Terminal.icns` read at runtime (cask upgrades wipe it; detect + reapply).

### Claude Code

- `settings.json` contains machine-specific absolute paths → generated from the Dev-dir answer,
  never copied verbatim; marketplace path templated to `{devDir}/ACMElabs/.claude-plugin/marketplace.json`;
  plugins filtered by the repos actually selected. Hook scripts (notify, subagent statusline,
  format) and the pure-Bun statusline are part of the install. Assets are embedded in the compiled
  binary with `with { type: "file" }` — `import.meta.dir` does not exist under `bun build --compile`.

## Refuted

- "BetterDisplay `menuBarIcon=false` + `dockVisibility=never` locks you out" — documented recovery
  paths (waydabber #5440).

## Unverifiable

See [config-compatibility](ANA-007-config-compatibility.md) "Unverifiable".

## Implications

- Which items need a ceremony vs. are fully automatic: CleanShot automatic; BetterDisplay, Typora,
  superwhisper paste ceremonies; TCC grants always guided.
