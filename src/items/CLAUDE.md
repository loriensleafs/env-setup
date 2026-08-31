# src/items — every Item (ADR-007, ADR-010, ADR-011)

Blast radius: `install()`, `configure()` and `verify()` run installers, `defaults write`,
`killall`, `chsh` and AppleScript on the real machine. While developing, call `detect()` only —
`bun src/items/.claude/skills/run-src-items/driver.ts` prints the real registry order, and each
subdirectory has its own driver.

## Writing an item

- `installed: true` together with `differs: true` silently drops the item from the picker —
  Drifted is always `installed: false`.
- `deps` are ordered only against deps in the same run, and the picker's cascade hint comes from
  the same list (ADR-006) — a missing dep breaks both.
- Register in `all.ts` (an unregistered dep is `UnknownDependencyError` at runtime); `kind`
  decides the section.
- `ctx.ask` is optional: fail with a clear message when it is undefined (headless).
- The install method is researched per tool and its transitive prerequisites declared as `deps`
  (ANA-002); per-app mechanics live in ANA-003 — re-capture machine-captured keys on app upgrades.

## Directories without their own CLAUDE.md

- `editors/` — pin `workbench.preferredDarkColorTheme` / `preferredLightColorTheme`, never
  `workbench.colorTheme` (vscode #196119 rewrites it → the item reports Drifted forever,
  ANA-007). Cursor model gating is app state → a Ceremony.
- `factories/` — `brewCask` needs `app` for the `.app` fallback (manually installed apps);
  `fontZip` honours pinned URLs; pass a mock `run` in tests.
- `ghostty/` — `detect()` compares the whole rendered file: extend `renderGhosttyConfig`, never
  patch the file. The icon is the OS's own `Terminal.icns`, wiped by cask upgrades → detect +
  reapply.
- `repos/` — `renderMarketplace` lists only cloned repos that have a `plugin.json`; private repos
  clone through `gh` behind `github-auth`.
- `quick-actions/`, `typora/` — the file comments carry it (nested theme zip → `find vercel.css`;
  license = clipboard Ceremony).
- `chrome/`, `claude-code/`, `defs/`, `finder/` — own CLAUDE.md.
