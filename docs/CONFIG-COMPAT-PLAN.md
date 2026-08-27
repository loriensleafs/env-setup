# Config reset-on-drift — plan (SIMPLIFIED 2026-08-27)

**Status:** decided by Peter 2026-08-27, replacing the earlier conflict-consent design in full.
**Branch:** `feat/config-conflict-consent`. **Blocks:** v0.1.0.

## The whole model

1. An item is left OFF the install list only when BOTH hold:
   - it is installed at the version we would install, AND
   - if we define configuration defaults for it, its current values EXACTLY match our defaults.
2. Anything installed whose configuration has drifted STAYS in the list, marked
   **"installed — settings differ"**, default UNCHECKED. Selecting it is the user's opt-in to
   reset the configuration to our defaults (or a variation, via the existing config screen).
3. **No conflict checking.** Dropped entirely: `superRefine` compatibility rules,
   `deriveDisabled`, blocking `validate` gates, the unified group-select, and the reactive
   config screen. The existing UI (`group-multi-select`, `radio-group`, `config-screens`)
   stays as-is.

Selection IS the consent. An unselected drifted item is untouched. There is nothing else.

## What changes (small)

- **`DetectResult` gains `differs?: boolean`** — set by a drift-aware `detect()` when config is
  PRESENT but does not match the effective defaults (vs plain `installed:false` when nothing was
  ever configured).
- **Bootstrap selection screen** — an item with `!installed && differs` renders with the hint
  `installed — settings differ (select to reset)` and `initialSelected: false` (opt-in). Fresh
  installs keep today's behavior. Nothing else in the flow changes: a selected drifted item is
  already in `toInstall`, and its idempotent `configure()` re-applies the agreed values.
- **Drift-aware `detect()` on every item with defaults** — compare the actual current values to
  the effective config (manifest config, else schema defaults). Done earlier: delta,
  superwhisper, git-identity, typora, ghostty. Remaining: editor-config (all EDITOR_SETTINGS
  keys), claude-settings (settings.json + hook assets), cleanshot (settings + shortcut blobs),
  acmelabs-marketplace (regenerated file), chrome-pwas (bundle URL host), podman-machine
  (DOCKER_HOST env file).
- **`sync` unchanged** — its contract stays "apply the manifest": drift-aware detects simply make
  `doctor` report honestly; sync re-applies what the manifest says.

## Build order

1. `DetectResult.differs` + bootstrap marker/unchecked default (+ test for the selection shaping).
2. Set `differs` in the five existing drift-aware detects (present-but-mismatched vs absent).
3. Finish the remaining drift-aware detects (list above), each setting `differs`.
4. Docs sync (PLAN.md pointer).

Out of scope by decision: everything in the appendix's "couplings" list — kept only as a record.
The four DEFECTS below are ordinary bugs, independent of this feature; fix separately (pending
Peter's go).

---

## Appendix — verified compatibility research (2026-08-27, kept for the record)

Four doc-research passes (every Claude settings key vs code.claude.com docs; Ghostty via
ghostty.org/Config.zig; BetterDisplay via waydabber's tracker; hotkeys via Apple/community
sources; all 81 Chrome flags vs Chromium flag-metadata.json; git failure modes tested
empirically). Conflict CHECKING is out of scope by decision — these findings remain true.

### Defects in shipped defaults (fix separately, as plain bugs)

1. **CleanShot ⇧⌘3/4/5 takeover incomplete** — macOS symbolic hotkeys 28–31 (+ the ⇧⌘5 entry)
   are never disabled; the system wins and CleanShot's shortcuts are silently dead (Kap #868
   precedent; CleanShot onboarding has you uncheck them). Fix mirrors raycast's hotkey-64 disable.
2. **Editor theme self-conflict** — `window.autoDetectColorScheme: true` REWRITES
   `workbench.colorTheme` on OS scheme flips (vscode #196119), erasing One Dark Pro and tripping
   our drift detect. Fix: set `workbench.preferredDark/LightColorTheme`.
3. **git signing ordering** — `commit.gpgsign=true` (Stage A) + signing key created in Stage C ⇒
   between stages EVERY `git commit` fails (empirical: `fatal: failed to write commit object`,
   exit 128). Fix: write `gpgsign` only once the key exists.
4. **BetterDisplay license ceremony** — default `dockVisibility:"never"` removes the Edit menu
   ("copy/paste shortcut keys not working", waydabber #2228); the ceremony is paste-based.
   v2.0.10+ auto-shows the dock icon while Settings is open — ceremony text should say so.

### Verified couplings (NOT being encoded; recorded only)

claude-settings: `BASH_MAX_TIMEOUT_MS ≥ BASH_DEFAULT_TIMEOUT_MS`; `teammateMode` ⟹
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1"` (documented); `autoMemoryAgentsEnabled ⟹
autoMemoryEnabled`, `dreamAgentsEnabled ⟹ autoDreamEnabled` (logical, undocumented);
custom-marketplace plugins ⟹ marketplace entry; `browser-use`/`chrome-devtools-mcp` ⟹ Chrome.
editor: formatOnSave ⟹ prettier extension (present). cleanshot:
`popupAskForDestinationWhenSaving=false` ⟹ exportPath dir (mkdir is load-bearing). raycast:
`Command-49` ⟹ Spotlight 64 disabled (mandatory ordering). git: pager=delta ⟹ delta binary
(hard-fatal otherwise); ssh signing needs git ≥ 2.34, zdiff3 ≥ 2.35. ghostty: global ⌘`
collides with macOS window-cycling (upstream-acknowledged, #3610; alternatives `ctrl+grave`,
`cmd+esc`); global keybinds need an Accessibility grant that can go stale after updates (#7183);
`macos-option-as-alt=true` breaks Option-key Unicode input (documented; values
true/false/left/right). macos-defaults: `swipescrolldirection` needs logout; `PfLo` (only)
requires `NewWindowTargetPath`.

### Refuted claims (recorded so they don't come back)

- `defaultMode:"auto"` requiring `CLAUDE_CODE_ENABLE_AUTO_MODE` — obsolete since v2.1.207.
- BetterDisplay hideMenuIcon+dockIcon=never "lock-out" — three documented recovery paths (#5440).
- ghostty "shell-integration list is absolute, not additive" — wrong; comment fixed in code.
- "delta absent degrades gracefully" — hard fatal on tty.
- `prerender2` flag pair conflict — complementary.
- "CleanShot seizes ⇧⌘3/4/5 automatically" — it cannot; system shortcuts must be disabled.
- "Stale Chrome flags are dangerous" — Chromium sanitizes unknown flags (5/81 already gone from
  main; harmless).

### Unverifiable (machine-captured truth; re-capture on app upgrades)

BetterDisplay `menuLevel*`/`dockIcon` enum/`dockInsertRecents…`; CleanShot `LAVA*` blob format +
`afterScreenshotActions`/`afterVideoActions` enums + the exact ⇧⌘5 hotkey ID; superwhisper's
`mouseButtonNumbers`; Ghostty global-keybind precedence vs the system shortcut; superwhisper
right-⌥ hold vs `macos-option-as-alt` (likely benign — focus-local vs global).

Key sources: code.claude.com/docs · ghostty.org/docs + Config.zig + #3610/#7183/#9511 ·
waydabber/BetterDisplay #2228/#5440/#2223 · sparkle-project.org · Apple 102650 ·
macos-defaults.com · wulkano/Kap #868 · git config docs (+ empirical tests) · delta get-started ·
vscode #196119 · prettier-vscode README · Chromium flag-metadata.json + flags_state.h ·
sindresorhus/KeyboardShortcuts · superwhisper docs · Open VSX API.
