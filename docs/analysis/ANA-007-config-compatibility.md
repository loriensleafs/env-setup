# Config compatibility — verified research

> **Analysis** · 2026-08-27 · status: current (conflict *checking* is out of scope by
> [ADR-010](../decisions/ADR-010-reset-on-drift-config-model.md); the findings remain true and the
> four defects were fixed as ordinary bugs in v0.1.4–v0.1.9). Moved from
> `docs/decisions/ADR-010-reset-on-drift-config-model.md`'s appendix on 2026-08-30.

## Question

Do envsetup's shipped defaults conflict with each other or with macOS, such that a config model
would need conflict checking? (Asked after an earlier note claimed "zero real incompatibility",
which Peter challenged; that claim had scanned only the four items with Zod schemas and ignored
the far larger schemaless default surface.)

## Sources

Four doc-research passes: every Claude Code settings key vs code.claude.com/docs; Ghostty via
ghostty.org docs + `Config.zig` + issues #3610/#7183/#9511; BetterDisplay via waydabber's tracker
(#2228/#5440/#2223); hotkeys via Apple 102650 + sindresorhus/KeyboardShortcuts + wulkano/Kap #868;
all 81 Chrome flags vs Chromium `flag-metadata.json` + `flags_state.h`; git failure modes tested
empirically; delta get-started; vscode #196119; prettier-vscode README; superwhisper docs; Open VSX
API; macos-defaults.com; sparkle-project.org.

## Findings — defects in shipped defaults (all fixed)

1. **CleanShot ⇧⌘3/4/5 takeover incomplete** — macOS symbolic hotkeys 28/30/184 beat the app's
   registration; CleanShot's shortcuts were silently dead (Kap #868 precedent; CleanShot's own
   onboarding has you uncheck them). Fixed: `cleanshot-config` disables the ids and runs
   `activateSettings -u`.
2. **Editor theme self-conflict** — `window.autoDetectColorScheme: true` rewrites
   `workbench.colorTheme` on OS scheme flips (vscode #196119), erasing One Dark Pro and tripping
   drift detection. Fixed: `workbench.preferredDarkColorTheme` / `preferredLightColorTheme`, no
   `colorTheme`.
3. **git signing ordering** — `commit.gpgsign=true` written before the signing key exists makes
   every `git commit` fail (`fatal: failed to write commit object`, exit 128, empirical). Fixed:
   gpgsign written only once `~/.ssh/id_ed25519_sign.pub` exists.
4. **BetterDisplay license ceremony** — `dockVisibility: never` removes the Edit menu, so paste
   shortcuts fail (waydabber #2228); v2.0.10+ shows the dock icon while Settings is open. Fixed in
   the ceremony text.

## Findings — verified couplings (recorded, not encoded)

- claude-settings: `BASH_MAX_TIMEOUT_MS ≥ BASH_DEFAULT_TIMEOUT_MS`; `teammateMode` ⟹
  `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1"` (documented); `autoMemoryAgentsEnabled ⟹
  autoMemoryEnabled`, `dreamAgentsEnabled ⟹ autoDreamEnabled` (logical, undocumented);
  custom-marketplace plugins ⟹ marketplace entry; `browser-use` / `chrome-devtools-mcp` ⟹ Chrome.
- editor: formatOnSave ⟹ prettier extension present.
- cleanshot: `popupAskForDestinationWhenSaving=false` ⟹ `exportPath` dir must exist (mkdir is
  load-bearing).
- raycast: `Command-49` ⟹ Spotlight hotkey 64 disabled (mandatory ordering; welded in one
  `configure()`).
- git: `pager=delta` ⟹ delta binary (hard-fatal on a tty otherwise); SSH signing needs git ≥ 2.34,
  `zdiff3` ≥ 2.35.
- ghostty: global ⌘` collides with macOS window cycling (upstream-acknowledged #3610; alternatives
  `ctrl+grave`,`cmd+esc`); global keybinds need an Accessibility grant that can go stale after
  updates (#7183);`macos-option-as-alt=true` breaks Option-key Unicode input (documented).
- macos-defaults: `swipescrolldirection` needs logout; `PfLo` requires `NewWindowTargetPath`.

## Refuted

- `defaultMode: "auto"` requiring `CLAUDE_CODE_ENABLE_AUTO_MODE` — obsolete since Claude Code
  v2.1.207.
- BetterDisplay `hideMenuIcon` + `dockIcon=never` "lock-out" — three documented recovery paths
  (#5440).
- Ghostty "shell-integration list is absolute, not additive" — wrong; code comment fixed.
- "delta absent degrades gracefully" — hard fatal on a tty.
- `prerender2` flag pair "conflict" — complementary.
- "CleanShot seizes ⇧⌘3/4/5 automatically" — it cannot; system shortcuts must be disabled.
- "Stale Chrome flags are dangerous" — Chromium sanitizes unknown flags (5/81 already gone from
  main; harmless).

## Unverifiable

Machine-captured truth to re-capture on app upgrades: BetterDisplay `menuLevel*` / `dockIcon`
enum / `dockInsertRecentsOnStartupWhenHidden`; CleanShot `LAVA*` blob format,
`afterScreenshotActions` / `afterVideoActions` enums, the exact ⇧⌘5 hotkey id; superwhisper's
`mouseButtonNumbers`; Ghostty global-keybind precedence vs the system shortcut; superwhisper
right-⌥ hold vs `macos-option-as-alt` (likely benign — focus-local vs global).

## Implications

- [ADR-010](../decisions/ADR-010-reset-on-drift-config-model.md): conflict checking dropped;
  selection is the consent.
- The four defects became fixes (sessions `2026-08-27-…` and `2026-08-30-real-bootstrap-…`).
