# src/items — every installable/configurable thing (loaded for all item work)

Blast radius: `install()`, `configure()` and `verify()` run installers, `defaults write`, `killall`,
`chsh` and AppleScript on the real machine. While developing, call `detect()` only — the drivers do
exactly that (`bun src/items/.claude/skills/run-src-items/driver.ts` prints the real registry
order; each subdirectory has its own).

## Writing an item

- `differs: true` is always paired with `installed: false`; `installed: true, differs: true`
  silently drops the item from the picker.
- `deps` are ordered only against deps in the same run, and the picker's safety hint comes from the
  same list (ADR-006) — a missing dep breaks both.
- Register in `all.ts` (an unregistered dep is `UnknownDependencyError` at runtime); `kind` decides
  the picker section.
- `ctx.ask` is optional: fail with a clear message when it is undefined (headless).
- The install method is researched per tool with its transitive prerequisites declared as `deps`
  (ADR-011, ANA-002); per-app mechanics are captured in ANA-003 — re-capture machine-captured keys
  on app upgrades.
- Shell lines live in the item's `zsh()`; per-machine values (Podman `DOCKER_HOST`) in a sourced file
  under `~/.config/envsetup/`, not in the block (ADR-012).

## Directories without their own CLAUDE.md

- `editors/` — pin `workbench.preferredDarkColorTheme`/`preferredLightColorTheme`, never
  `workbench.colorTheme` (vscode #196119 rewrites it → perpetual drift, ANA-007). Cursor model
  gating is app state → ceremony.
- `factories/` — `brewCask` needs `app` for the `.app` fallback (manually installed apps);
  `fontZip` honours pinned URLs; pass a mock `run` in tests.
- `ghostty/` — `detect()` compares the whole rendered file: extend `renderGhosttyConfig`, never
  patch the file. The icon is the OS's own `Terminal.icns`, wiped by cask upgrades → detect + reapply.
- `repos/` — `renderMarketplace` lists only cloned repos that have a `plugin.json`; private repos
  clone through `gh` behind `github-auth`.
- `quick-actions/`, `typora/` — the file comments carry it (nested theme zip → `find vercel.css`;
  license = clipboard ceremony).
- `chrome/`, `claude-code/`, `defs/`, `finder/` — own CLAUDE.md.
