# PRD: envsetup

> Status: current as of v0.1.9 · 2026-08-30 · extracted from the retired living plan
> (`../archive/ARC-001-living-plan.md`); keep current in the same PR as any change to
> what envsetup does. Decisions with alternatives live in [../decisions/](../decisions/README.md);
> facts in [../analysis/](../analysis/README.md).

## Objective

A Bun + TypeScript interactive CLI that sets up a brand-new Mac from **one command** — apps,
runtimes, fonts, repos, macOS settings and per-app configuration — and keeps it in shape
afterwards. It replaces ad-hoc setup after Peter lost a fully configured work machine to a remote
wipe. User: Peter (github `loriensleafs`), and by construction anyone who forks it with their own
catalog and secrets. Success: a fresh Mac reaches Peter's complete working environment with two
attended moments (start and end) and the same command re-run reports nothing to do.

## The promise

1. `curl -fsSL https://raw.githubusercontent.com/loriensleafs/env-setup/main/install.sh | sh` on a
   fresh Mac needs **no prerequisites** (ADR-002).
2. **Nothing touches the system until the summary is confirmed** (ADR-005).
3. Every choice has a sensible default; every multiselect is default-selected; inputs are
   validated and clamped.
4. **Re-running the same command converges the machine**: it re-detects, pre-checks what failed
   last run, asks only about what is missing, and never silently overwrites a deliberate
   customization (ADR-010).
5. Automate everything automatable; the user's manual steps are limited to true auth ceremonies
   (a browser authorize click) and OS permission dialogs (ADR-009, [TCC](../analysis/ANA-005-macos-permissions-tcc.md)).

## Commands

| Command | Does |
| --- | --- |
| `envsetup` | The one command: scan → pick → configure → confirm → install → attended finishing steps → finishing pass. `--show-installed` exposes installed items for cascade inspection; `--defaults` skips config screens. |
| `envsetup doctor` | Read-only diff of the machine against its manifest: satisfied / missing / drifted (`≠`) / untracked; per-item zsh gaps. States are defined in `CONTEXT.md`. |
| `envsetup sync` | Apply the saved manifest non-interactively (no picker). |
| `envsetup auth` | GitHub sign-in (device flow). |
| `envsetup connect` | Re-run attended finishing steps that were skipped. |
| `envsetup secrets` | `init` · `list` · `show` (masked) · `reveal` · `copy <key>` · `set <key>` · `unlock` on the age-encrypted store. |

## UX requirements

1. **Scan first**: every candidate item is detected (parallel per section) before any prompt; one
   task log collapses to "Ready in Xs".
2. **Identity + locations**: name, GitHub user, Dev directory (`~/Dev` default; path prompt with
   Tab completion), prefilled from the prior manifest; Zod-validated in-prompt.
3. **Picker**: one grouped multiselect over Required / Optional apps / Repos / Fonts / System &
   config sections. Installed-and-matching items are absent (`--show-installed` shows them).
   Everything shown is toggleable; dependents disable in place with a "needs X" hint
   (ADR-006). A drifted item shows "applied — settings differ (select to reset)", unchecked
   (ADR-010). An item that failed last run shows "failed last run — retry", checked.
4. **Per-item config screens**: for each selected item with a schema, one clack group: boolean →
   yes/no radio, bounded number → validated text, enum ≤ 4 → radio, string → text; labels
   humanized from the schema; answers stored in the manifest. Required (planned): a boxed header
   per item and an overall step tracker ([PLAN-001-visual-grouping.md](PLAN-001-visual-grouping.md)).
5. **Summary + confirm**: what will be installed, what is already there; Enter confirms; manifest
   written only then.
6. **Install**: dependency order; one append-only spinner line per step with ✓/✗/↷ outcomes;
   mid-step yes/no questions pause the spinner (e.g. "Chrome is running … quit now?"); concise
   triage of failures; required-item failure aborts.
7. **Attended finishing steps run automatically** after install (license pastes via clipboard,
   sign-ins, permission grants deep-linked to the exact pane, Chrome web-app installs), deduped;
   then a finishing pass re-executes what they unblocked; ceremony-only items are labelled
   "attended step", never "installed".
8. **Resume**: an unfinished run offers to resume with the same run id.
9. **Terminal**: works under `curl | sh` (ADR-014); prompts frame like stock clack (ADR-003).

## Item catalog (chosen defaults)

**Runtimes & CLI tools** (ADR-011): Xcode CLT (headless) · Homebrew (`NONINTERACTIVE`) · bun
(official installer, newest) · uv (installer) · Go (brew) · fnm + Node LTS (+ corepack) · gh (brew)
· jq, delta (git pager: `core.pager`, `diffFilter`, navigate, line-numbers, `zdiff3`), lazygit,
dust · dockutil · terminal-notifier · betterdisplaycli (prebuilt binary). Not: Rust, Rosetta 2,
ripgrep/fd/fzf/eza/bat/zoxide/yq/wget/btop/tldr/hyperfine, tmux/starship/httpie.

**Apps** (brew casks unless noted): Ghostty · Cursor · VS Code · Chrome (stable only; default
browser via system dialog) · superwhisper · Raycast · CleanShot X · Zoom · Discord · Typora ·
Claude desktop · Podman · BetterDisplay. Not: Slack, Postman, Spotify/VLC/notes apps, OrbStack
(Podman chosen with full context), 1Password (Google Password Manager via Chrome sign-in).

**Chrome web apps** (ADR-015): Gmail → "Mail", Google Calendar, Google Drive, Google Keep →
"Notes"; in the Dock.

**Repos** (into `{devDir}/ACMElabs/` from github.com/acmelabs-15): skills, ask-user-question,
plugin-kit, code-review, code-simplifier — plus a generated `.claude-plugin/marketplace.json`
listing the *actually cloned* plugins. Reference clones into `{devDir}/reference/` with
owner-prefixed names: basic-memory, addy-osmani-agent-skills, matt-pocock-skills,
rj-murillo-ai-agents. Unchecking a repo omits its plugin from Claude settings.

**Fonts**: JetBrains Mono NF, Fira Code NF, Geist, Inter (brew); Google Sans (official download
manifest, 18 TTFs); Google Sans Code / Noto / Roboto Mono (Nerd Fonts v3.5.1 pinned zips);
DankMono, Hack, LigaHack from `loriensleafs/fonts` (API, family-filtered).

**macOS settings**: Finder — hidden files, all extensions, path bar, status bar, folders on top,
new windows → home, search current folder, no extension-change warning, show `~/Library`, column
view. Dock — bottom, recents off, only: Finder · Apps · System Settings · Ghostty (with the native
Terminal icon) · Cursor · Typora · Claude · Chrome · Mail · Calendar · Drive · Notes. Keyboard —
natural scrolling off; nothing else. Finder favorites — Applications · Home · Desktop ·
Documents · Downloads · Dev · .claude. Quick Actions (Automator services, silent; pure-Bun
payloads) — copy path, open in Ghostty, open in Cursor. Screenshots — owned by CleanShot;
symbolic hotkeys 28/30/184 disabled. Declined: hot corners, battery %, night shift, sounds, key
repeat, tap-to-click and all other input tweaks.

**App configuration** (user-adjustable where a Zod schema exists; [mechanics](../analysis/ANA-003-app-config-mechanics.md)):

- Ghostty: JetBrains Mono NF 13, theme One Dark Two, shell integration, quick terminal with
  default keybind, copy-on-select + paste protection, padding, remember size, option-as-alt;
  existing config values preserved; Dock icon = macOS Terminal icon (reapplied after cask upgrades).
- Cursor & VS Code (identical): One Dark Pro via `preferredDark/LightColorTheme`, Material Icon
  Theme, JetBrains Mono NF, format-on-save with project config first; extensions Bun, Go, Error
  Lens, Pretty TS Errors, ESLint, Prettier, GitLens, Path Intellisense, DotENV, Claude Code;
  `cursor` / `code` CLIs on PATH; Cursor model gating (Haiku 4.5 / Opus 5 / Sonnet 5 / Fable 5,
  default Opus 5) is a guided step.
- superwhisper: push-to-talk hold right-⌥, mini recorder, no dock icon, experimental models,
  recording view off, auto-update on; license + mic/accessibility guided.
- Typora: Vercel theme, autosave off, license via clipboard.
- CleanShot X: license written from the store; ⇧⌘3/4/5 takeover; `~/Screenshots`; PNG; overlay
  after capture; no shadows; freeze on area select; no auto-copy; launch at login.
- Raycast: ⌘Space (Spotlight off), clipboard history ⌥V, starter extensions Brew / GitHub / Kill
  Process.
- Podman: 4 CPU / 8 GB / 100 GB, docker compat (`DOCKER_HOST` + `docker=podman`), start on demand,
  no Desktop GUI.
- BetterDisplay: menu profile (default / minimal / everything), dock icon never, menu-bar icon
  shown, no startup dock flash, auto-update on, start at login; license via clipboard.
- Chrome: 81 captured flags, native toolbar pins in Peter's order, `tab_search.pinned_to_tabstrip`,
  extension pin Claude only; sign-in is a ceremony (sync brings bookmarks/extensions).
- Claude Code: settings template with model/effort/permissions/env flags exposed; marketplace path
  templated to the Dev dir; plugins filtered by selected repos; hooks (notify, subagent statusline,
  FileChanged formatter) + pure-Bun statusline installed (ADR-013).
- git: identity from the manifest, noreply email, SSH signing with two per-machine keys
  (ADR-009), `init.defaultBranch main`.
- Shell: one managed `~/.zshrc` block assembled from items (ADR-012); zsh ensured.

**Secrets** (ADR-008): Anthropic API key → Keychain; Typora, superwhisper, CleanShot, BetterDisplay
licenses applied or pasted.

## Tech stack

Bun 1.4 (runtime + `bun build --compile`), TypeScript, vendored `@clack/prompts` + `@clack/core`
(ADR-003), citty, Zod 4 (schemas double as prompt validators and manifest versions),
`age-encryption`, picocolors/sisteransi. No Node runtime anywhere (ADR-001).

## Project structure

`src/index.ts` (citty entry, TTY guards) · `src/commands/` · `src/items/<item>/` + `src/items/all.ts`
· `src/ui/` (terminal input, custom prompts, config screens) · `src/orchestrator/` ·
`src/manifest/` · `src/journal/` · `src/secrets/` · `src/ceremonies/` · `src/exec/` ·
`docs/` (this system) · `vendor/` (clack tarballs) ·
`.claude/skills/run-envsetup/` (safe smoke driver). Tests beside their subject in `__tests__/`.

## Code style

Biome-formatted (2 spaces, double quotes, semicolons, trailing commas, 100 cols). An item:

```ts
export const delta = defineItem({
  id: "delta",
  title: "delta (git pager)",
  section: "cli",
  deps: ["homebrew"],
  detect: async (ctx) => ({ installed: await ctx.run.exists("delta") }),
  install: async (ctx) => ctx.run.brew("install", "git-delta"),
});
```

Drift-aware `detect()` returns `{ installed: false, differs: true }` for present-but-mismatched
config. Every prompt passes `input: promptInput()`.

## Testing strategy

`bun:test`, unit tests per module with an injectable `Runner` for commands; pure state machines
for prompt logic; PTY smoke tests with a **strong oracle** (submit → next prompt appears) for
interactive changes; `envsetup doctor` on Peter's machine as the live read-only check. Gates:
`bun run check` + `bun test` (lefthook, CI).

## Boundaries

- **Always**: pure Bun; research the official install method; declare transitive deps; drift-aware
  detect; thread `input`; `bun run check` green; update docs in the same step; one question at a
  time with a recommendation.
- **Ask first**: anything outward-facing (push, PR, merge, release), changing an agreed decision,
  adding a dependency, changing CI, anything that mutates Peter's machine outside a real run.
- **Never**: a secret (even partial) in a tracked file or commit message; swap vendored clack to
  npm; run bare `envsetup`/`sync` "to test"; claim verification that did not happen.

## Success criteria

- Fresh-Mac run: the one-liner completes with 0 failed and two attended moments; a second run
  reports nothing to do; `doctor` shows every wanted item satisfied.
- Peter's actual machine: converged with 0 failed (achieved v0.1.5+); connect phase exercised
  end-to-end in one pass (pending).
- Every item with defaults detects drift; no silent overwrite.
- Release assets for arm64 and x64 attached for every tag.

## Non-goals

Windows/Linux; managed/MDM deployment; cloud sync of app settings (Raycast `.rayconfig` etc.);
notarization (until needed); a plugin system for third-party catalogs.

## Plans

| Plan | Implements | Status |
| --- | --- | --- |
| [PLAN-001-visual-grouping.md](PLAN-001-visual-grouping.md) | UX requirement 4 | planned — patch parked on `wip/visual-grouping` |
| [PLAN-002-nested-claude-md.md](PLAN-002-nested-claude-md.md) | agent guidance placement (ADR-018) | done — merged 2026-08-30 (session SES-004) |

## Open questions

- Persist the binary to `~/.local/bin/envsetup` so re-runs don't re-download (OVERVIEW Next up).
- Compiled-binary idle CPU spin at prompts (upstream bun-compile quirk).
- Per-display BetterDisplay settings remain a guided capture; is a captured profile worth
  templating?
