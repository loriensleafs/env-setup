# Ledger — what has been done, in order

The append-only record of every change that reached `main`, oldest first, newest last. It is the
**rehydration mechanism** for a new session: `docs/OVERVIEW.md` says where the project *is*
("Status") and what is *next* ("Next up"); this file says exactly what was *done*, in what order,
and which files each change touched — so an agent can open the listed files or `git show <sha>`
instead of re-deriving history from the code.

## How to read it

1. Read OVERVIEW "Status" and "Next up" first — they are the summary; this is the detail.
2. Then read the **last section** here ("Since v<latest>"): everything that happened after the
   latest release — what is on `main` but not yet shipped. Those entries are the evidence behind
   "Status".
3. When taking a "Next up" item, search this file for the item's files or keywords to find the
   commits that shaped them, then `git show <sha>` for the exact diff and full commit message.
4. Headings are release boundaries: "## Since vX.Y.Z" holds the commits made **after** the vX.Y.Z
   tag. The section under the newest heading is the unreleased work.

## How to keep it up to date

- **Every PR appends its entries before merge** — a PR is not done without them. Commit, then run
  `bun run ledger` (`scripts/ledger.ts`): it appends one entry per commit not yet listed, with the
  files touched. Then fill in the `Why` line, and `Notes` when a future reader must know something
  (a gotcha, a follow-up, what was verified and how, a decision made on the spot). Commit that as
  `docs(ledger): …` in the same PR — such commits are skipped by the script, so they never need an
  entry of their own.
- A release (`chore(release): vX.Y.Z` commit + tag) gets a new "## Since vX.Y.Z" heading; the
  script inserts it automatically after the tagged commit, so run it once more after tagging.
- Never rewrite or reorder old entries; correct a mistake with a new entry. Merge PRs with merge
  commits (not squash) so the shas here stay valid.
- Touch OVERVIEW "Status" / "Next up" in the same PR whenever the picture changed.

## Entry template

```markdown
### YYYY-MM-DD · type(scope): subject · sha

- Files: `path/a.ts`, `path/b.ts`
- Why: one line — the problem or request that caused the change (name who asked if it was Peter)
- Notes: optional — gotchas, follow-ups, what was verified and how
```

Entries up to 2026-08-30 were generated from `git log` and carry only `Files`; their commit
messages (`git show -s <sha>`) hold the why.

## Up to v0.0.1

### 2026-08-26 · Scaffold envsetup: bun + clack + citty + zod foundation · 4d67d0a

- Files: `.github/workflows/release.yml`, `.gitignore`, `README.md`, `bun.lock`, `docs/PLAN.md`, `docs/RESEARCH-clack-citty-bun.md`, `docs/assets/ghostty-custom.icns`, `install.sh`, `package.json`, `spikes/cli.ts`, `spikes/cli2.ts`, `spikes/drive.exp`, `spikes/spike.ts`, `src/commands/bootstrap.ts`, `src/commands/doctor.ts`, `src/commands/secrets.ts`, `src/commands/sync.ts`, `src/index.ts`, `templates/claude/hooks-notify.ts`, `templates/claude/hooks-subagent-statusline.ts`, `templates/claude/settings.template.json`, `templates/claude/statusline.sh`, `tsconfig.json`

### 2026-08-26 · Restructure: feature-first layout per research · f323c06

- Files: `docs/PLAN.md`, `src/items/claude-code/assets/hooks-notify.ts`, `src/items/claude-code/assets/hooks-subagent-statusline.ts`, `src/items/claude-code/assets/settings.template.json`, `src/items/claude-code/assets/statusline.sh`, `src/items/ghostty/assets/ghostty-custom.icns`, `test/spikes/README.md`, `test/spikes/cli.ts`, `test/spikes/cli2.ts`, `test/spikes/drive.exp`, `test/spikes/spike.ts`

### 2026-08-26 · Record sibling-\_\_tests\_\_ testing convention · ce02c1b

- Files: `docs/PLAN.md`

### 2026-08-26 · Core spine: paths, manifest, journal, item framework · bbe66aa

- Files: `bun.lock`, `docs/PLAN.md`, `package.json`, `src/items/__tests__/registry.test.ts`, `src/items/__tests__/toposort.test.ts`, `src/items/item.ts`, `src/items/registry.ts`, `src/items/toposort.ts`, `src/journal/__tests__/journal.test.ts`, `src/journal/journal.ts`, `src/manifest/__tests__/migrations.test.ts`, `src/manifest/__tests__/schema.test.ts`, `src/manifest/__tests__/store.test.ts`, `src/manifest/migrations.ts`, `src/manifest/schema.ts`, `src/manifest/store.ts`, `src/paths/__tests__/paths.test.ts`, `src/paths/paths.ts`, `tsconfig.json`

### 2026-08-26 · Convert Claude statusline to pure Bun · b31f9d2

- Files: `docs/PLAN.md`, `src/items/claude-code/assets/settings.template.json`, `src/items/claude-code/assets/statusline.sh`, `src/items/claude-code/assets/statusline.ts`

### 2026-08-26 · Drop bundled ghostty icns; Terminal icon is read from the OS at runtime · 013fbda

- Files: `docs/PLAN.md`, `src/items/ghostty/assets/ghostty-custom.icns`

### 2026-08-26 · Stage A UI: unified selection prompt + horizontal radio · bea943b

- Files: `bun.lock`, `docs/PLAN.md`, `package.json`, `src/ui/__tests__/horizontal-radio.test.ts`, `src/ui/__tests__/unified-select-state.test.ts`, `src/ui/demo.ts`, `src/ui/horizontal-radio.ts`, `src/ui/theme.ts`, `src/ui/unified-select-state.ts`, `src/ui/unified-select.ts`, `test/spikes/ui-demo.exp`

### 2026-08-26 · First items + live doctor detection · 6db521f

- Files: `docs/PLAN.md`, `src/commands/doctor.ts`, `src/exec/__tests__/run.test.ts`, `src/exec/run.ts`, `src/index.ts`, `src/items/all.ts`, `src/items/defs/__tests__/xcode-clt.test.ts`, `src/items/defs/bun-runtime.ts`, `src/items/defs/homebrew.ts`, `src/items/defs/node-lts.ts`, `src/items/defs/uv.ts`, `src/items/defs/xcode-clt.ts`, `src/items/factories/__tests__/brew.test.ts`, `src/items/factories/brew.ts`, `src/items/item.ts`

### 2026-08-26 · Register Group 2 apps + fonts; .app fallback detection; font-zip factory · 5320da6

- Files: `docs/PLAN.md`, `src/items/all.ts`, `src/items/factories/__tests__/brew.test.ts`, `src/items/factories/brew.ts`, `src/items/factories/font-zip.ts`

### 2026-08-26 · Stage B orchestrator: journaled, resumable, policy-encoded engine · 006aee9

- Files: `docs/PLAN.md`, `src/orchestrator/__tests__/orchestrator.test.ts`, `src/orchestrator/orchestrator.ts`

### 2026-08-26 · Wire bootstrap: scan → select → confirm → manifest → orchestrate · 8bac397

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/index.ts`, `test/spikes/bootstrap-dry.exp`

### 2026-08-26 · Address dry-run feedback: path prompt, navigable viewport, zod validation · 3cbb7ec

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/ui/__tests__/unified-select-state.test.ts`, `src/ui/unified-select-state.ts`, `src/ui/unified-select.ts`

### 2026-08-26 · Rebuild unified select on clack's dynamic-group-multiselect pattern · 7a62d24

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/ui/__tests__/unified-select-state.test.ts`, `src/ui/demo.ts`, `src/ui/horizontal-radio.ts`, `src/ui/theme.ts`, `src/ui/unified-select-state.ts`, `src/ui/unified-select.ts`

### 2026-08-26 · UI fixes: real tab path completion, installed items excluded, stock styling · db68fd2

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/ui/demo.ts`, `src/ui/path-prompt.ts`, `src/ui/unified-select.ts`

### 2026-08-26 · Vendor clack from main; faithful example-based group multiselect; stock path prompt · 068c5c7

- Files: `bun.lock`, `docs/PLAN.md`, `package.json`, `src/commands/bootstrap.ts`, `src/ui/__tests__/group-multi-select.test.ts`, `src/ui/demo.ts`, `src/ui/group-multi-select.ts`, `src/ui/path-prompt.ts`, `src/ui/unified-select-state.ts`, `src/ui/unified-select.ts`, `vendor/clack-core-1.4.3-main-20260815.tgz`, `vendor/clack-prompts-1.7.0-main-20260815.tgz`

### 2026-08-26 · Everything toggleable: drop locked-on, cascade safety from registry deps · 29721d0

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/ui/__tests__/group-multi-select.test.ts`, `src/ui/demo.ts`, `src/ui/group-multi-select.ts`

### 2026-08-26 · Progress UX: per-section scan spinners, taskLog-group execution, --show-installed · 9c37ac6

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/index.ts`

### 2026-08-26 · Scan via parallel stream.step per section · f11c668

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`

### 2026-08-26 · Scan: single taskLog group with transient parallel messages · d3275cc

- Files: `bun.lock`, `docs/PLAN.md`, `package.json`, `src/commands/bootstrap.ts`

### 2026-08-26 · Scan: announce-then-evaluate messages, collapse to 'Ready in Xs' · e977297

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`

### 2026-08-26 · Config-only items: defaults, ghostty config+icon, git identity, dock, quick actions · 03015d4

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/items/all.ts`, `src/items/defs/__tests__/dock.test.ts`, `src/items/defs/__tests__/macos-defaults.test.ts`, `src/items/defs/dock.ts`, `src/items/defs/git-identity.ts`, `src/items/defs/macos-defaults.ts`, `src/items/ghostty/__tests__/ghostty-config.test.ts`, `src/items/ghostty/ghostty-config.ts`, `src/items/ghostty/ghostty-icon.ts`, `src/items/quick-actions/__tests__/quick-actions.test.ts`, `src/items/quick-actions/quick-actions.ts`

### 2026-08-26 · Rename horizontal-radio to radio-group · 63b4858

- Files: `src/ui/__tests__/radio-group.test.ts`, `src/ui/demo.ts`, `src/ui/radio-group.ts`

### 2026-08-26 · Chrome items + PLAN.md restructure (zero-loss, containment-verified) · d8c49e1

- Files: `docs/PLAN.md`, `src/items/all.ts`, `src/items/chrome/__tests__/chrome-defaults.test.ts`, `src/items/chrome/chrome-config.ts`, `src/items/chrome/chrome-defaults.ts`, `src/items/chrome/chrome-pwas.ts`

### 2026-08-26 · Per-app config appliers: typora, superwhisper, cleanshot, editors, podman, raycast · 43d9474

- Files: `docs/PLAN.md`, `src/items/all.ts`, `src/items/defs/cleanshot-config.ts`, `src/items/defs/podman-machine.ts`, `src/items/defs/raycast-config.ts`, `src/items/defs/superwhisper-config.ts`, `src/items/editors/__tests__/editor-config.test.ts`, `src/items/editors/editor-config.ts`, `src/items/typora/typora-config.ts`, `src/secrets/__tests__/secrets.test.ts`, `src/secrets/secrets.ts`

### 2026-08-26 · Repos, generated ACMElabs marketplace, flagship claude-settings applier · 9d4ed0d

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/items/all.ts`, `src/items/claude-code/__tests__/claude-settings.test.ts`, `src/items/claude-code/claude-settings.ts`, `src/items/defs/github-auth.ts`, `src/items/repos/__tests__/acmelabs-marketplace.test.ts`, `src/items/repos/acmelabs-marketplace.ts`, `src/items/repos/repo-factory.ts`, `src/secrets/__tests__/secrets.test.ts`

### 2026-08-26 · GitHub device flow under envsetup's app identity + SSH keys + noreply email · 6c9d2f0

- Files: `secrets.json.age`, `src/auth/__tests__/github-device-flow.test.ts`, `src/auth/auth-ceremony.ts`, `src/auth/github-device-flow.ts`, `src/commands/auth.ts`, `src/commands/secrets.ts`, `src/index.ts`, `src/items/all.ts`, `src/items/defs/git-email.ts`, `src/items/defs/github-auth.ts`, `src/items/defs/ssh-keys.ts`, `src/secrets/__tests__/age-store.test.ts`, `src/secrets/age-store.ts`

### 2026-08-26 · Commit re-encrypted secrets store; record auth+secrets as live-validated · aba1993

- Files: `docs/PLAN.md`, `secrets.json.age`

### 2026-08-26 · Personal fonts, dotfiles block, connect ceremony runner, doctor diffing, real sync · 879eb74

- Files: `docs/PLAN.md`, `src/ceremonies/handlers.ts`, `src/commands/bootstrap.ts`, `src/commands/connect.ts`, `src/commands/doctor.ts`, `src/commands/sync.ts`, `src/index.ts`, `src/items/all.ts`, `src/items/chrome/chrome-config.ts`, `src/items/defs/__tests__/dotfiles.test.ts`, `src/items/defs/dotfiles.ts`, `src/items/defs/personal-fonts.ts`, `src/items/editors/editor-config.ts`

### 2026-08-26 · Schema-driven per-app config screens + --defaults flag · c738ec9

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/index.ts`, `src/ui/__tests__/config-screens.test.ts`, `src/ui/config-screens.ts`, `test/spikes/bootstrap-dry.exp`

## Since v0.0.1 (tagged 2026-08-26)

### 2026-08-26 · Record v0.0.1 release + verified curl bootstrap · ce333cb

- Files: `docs/PLAN.md`

### 2026-08-26 · Bump actions: checkout v7, gh-release v3 (Node 24 runtimes) · 6021675

- Files: `.github/workflows/release.yml`

### 2026-08-26 · Add workflow scope to device flow; auth --force re-authentication · 339207f

- Files: `src/auth/auth-ceremony.ts`, `src/auth/github-device-flow.ts`, `src/commands/auth.ts`

## Since v0.0.2 (tagged 2026-08-26)

### 2026-08-26 · Open-items sweep: Google Sans item, real CleanShot applier from captured defaults · ec73a78

- Files: `docs/PLAN.md`, `src/ceremonies/handlers.ts`, `src/items/all.ts`, `src/items/defs/cleanshot-config.ts`, `src/items/defs/google-sans.ts`

### 2026-08-26 · Web apps: ceremony + verified rename design; drop force-install policy · 6401e80

- Files: `docs/PLAN.md`, `src/ceremonies/handlers.ts`, `src/items/chrome/__tests__/chrome-pwas.test.ts`, `src/items/chrome/chrome-pwas.ts`

### 2026-08-26 · Web apps: AX-driven install + filename rename (no policy, no managed badge) · 5e499d4

- Files: `docs/PLAN.md`, `src/ceremonies/handlers.ts`, `src/items/chrome/__tests__/chrome-pwas.test.ts`, `src/items/chrome/assets/install-web-app.swift`, `src/items/chrome/chrome-pwas.ts`

### 2026-08-26 · Add BetterDisplay, Finder favorites, comprehensive dotfiles, secrets reveal · 75cde92

- Files: `docs/PLAN.md`, `src/ceremonies/handlers.ts`, `src/commands/secrets.ts`, `src/items/all.ts`, `src/items/defs/__tests__/better-display.test.ts`, `src/items/defs/__tests__/dotfiles.test.ts`, `src/items/defs/better-display.ts`, `src/items/defs/dotfiles.ts`, `src/items/finder/__tests__/finder-favorites.test.ts`, `src/items/finder/assets/set-favorites.swift`, `src/items/finder/finder-favorites.ts`, `src/secrets/secrets.ts`

### 2026-08-26 · Remove dry-run; delete scratch test/spikes; document vendored clack · 5469d02

- Files: `docs/PLAN.md`, `src/commands/bootstrap.ts`, `src/commands/sync.ts`, `src/index.ts`, `test/spikes/README.md`, `test/spikes/bootstrap-dry.exp`, `test/spikes/cli.ts`, `test/spikes/cli2.ts`, `test/spikes/drive.exp`, `test/spikes/spike.ts`, `test/spikes/ui-demo.exp`, `vendor/README.md`

### 2026-08-26 · Finder favorites: fix the segfault (OpaquePointer sentinel), compile-then-run · efe2d41

- Files: `src/items/finder/__tests__/finder-favorites.test.ts`, `src/items/finder/assets/set-favorites.swift`, `src/items/finder/finder-favorites.ts`

### 2026-08-26 · Record Finder favorites fix + lesson in plan · e446d74

- Files: `docs/PLAN.md`

### 2026-08-26 · Dep audit fixes (prebuilt betterdisplaycli, corepack, git dep) + permission reality · 92d716c

- Files: `docs/PLAN.md`, `src/ceremonies/handlers.ts`, `src/items/defs/better-display.ts`, `src/items/defs/git-identity.ts`, `src/items/defs/node-lts.ts`

### 2026-08-26 · Consolidate permission ceremony: all Accessibility + Screen Recording in one pass · 6bff2b6

- Files: `src/items/defs/better-display.ts`

### 2026-08-26 · Actually consolidate the accessibility/screen-recording ceremony (prior edit no-op'd) · c777bcc

- Files: `src/ceremonies/handlers.ts`

### 2026-08-26 · BetterDisplay license: precise clipboard+paste ceremony (no scriptable path) · dcb9469

- Files: `docs/PLAN.md`, `src/ceremonies/handlers.ts`

### 2026-08-26 · secrets: list (names) + copy <key> to clipboard; confirm CleanShot auto-licenses · 264fdac

- Files: `docs/PLAN.md`, `src/commands/secrets.ts`

### 2026-08-26 · Scrub partial key fragment; add 'secrets set' to store one secret · f3e37bf

- Files: `docs/PLAN.md`, `src/commands/secrets.ts`

### 2026-08-26 · Add BetterDisplay license to the encrypted secret store · 44895a6

- Files: `secrets.json.age`

### 2026-08-26 · build: add Biome, markdownlint, lefthook, git-cliff, CI + gitignore hardening · 42fc91e

- Files: `.github/workflows/ci.yml`, `.gitignore`, `.markdownlint-cli2.jsonc`, `CHANGELOG.md`, `biome.json`, `bun.lock`, `cliff.toml`, `lefthook.yml`, `package.json`, `tsconfig.json`

### 2026-08-26 · feat: per-item zshrc, delta/DOCKER\_HOST, cursor/code CLI, FileChanged format hook, drift-aware detects · e5388ff

- Files: `src/auth/__tests__/github-device-flow.test.ts`, `src/auth/auth-ceremony.ts`, `src/ceremonies/handlers.ts`, `src/commands/auth.ts`, `src/commands/bootstrap.ts`, `src/commands/connect.ts`, `src/commands/doctor.ts`, `src/commands/secrets.ts`, `src/index.ts`, `src/items/__tests__/toposort.test.ts`, `src/items/all.ts`, `src/items/chrome/__tests__/chrome-pwas.test.ts`, `src/items/chrome/chrome-defaults.ts`, `src/items/chrome/chrome-pwas.ts`, `src/items/claude-code/__tests__/claude-settings.test.ts`, `src/items/claude-code/assets/hooks-format.ts`, `src/items/claude-code/assets/hooks-notify.ts`, `src/items/claude-code/assets/hooks-subagent-statusline.ts`, `src/items/claude-code/assets/settings.template.json`, `src/items/claude-code/assets/statusline.ts`, `src/items/claude-code/claude-settings.ts`, `src/items/defs/__tests__/better-display.test.ts`, `src/items/defs/__tests__/dock.test.ts`, `src/items/defs/__tests__/dotfiles.test.ts`, `src/items/defs/__tests__/macos-defaults.test.ts`, `src/items/defs/__tests__/superwhisper-config.test.ts`, `src/items/defs/__tests__/xcode-clt.test.ts`, `src/items/defs/better-display.ts`, `src/items/defs/bun-runtime.ts`, `src/items/defs/cleanshot-config.ts`, `src/items/defs/delta-config.ts`, `src/items/defs/dock.ts`, `src/items/defs/dotfiles.ts`, `src/items/defs/git-email.ts`, `src/items/defs/git-identity.ts`, `src/items/defs/github-auth.ts`, `src/items/defs/homebrew.ts`, `src/items/defs/macos-defaults.ts`, `src/items/defs/node-lts.ts`, `src/items/defs/podman-machine.ts`, `src/items/defs/raycast-config.ts`, `src/items/defs/shell-block.ts`, `src/items/defs/ssh-keys.ts`, `src/items/defs/superwhisper-config.ts`, `src/items/defs/uv.ts`, `src/items/defs/xcode-clt.ts`, `src/items/editors/editor-config.ts`, `src/items/factories/__tests__/brew.test.ts`, `src/items/factories/brew.ts`, `src/items/finder/__tests__/finder-favorites.test.ts`, `src/items/finder/finder-favorites.ts`, `src/items/ghostty/ghostty-config.ts`, `src/items/ghostty/ghostty-icon.ts`, `src/items/item.ts`, `src/items/quick-actions/quick-actions.ts`, `src/items/registry.ts`, `src/items/repos/repo-factory.ts`, `src/items/toposort.ts`, `src/items/typora/typora-config.ts`, `src/journal/journal.ts`, … +6 more (`git show --stat e5388ff`)

### 2026-08-26 · docs: add CLAUDE.md/AGENTS.md/CONTRIBUTING.md, refresh README + PLAN · 4bc4163

- Files: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `README.md`, `docs/PLAN.md`, `docs/RESEARCH-clack-citty-bun.md`

### 2026-08-26 · chore: add run-envsetup skill (safe smoke driver) · 8760264

- Files: `.claude/skills/run-envsetup/SKILL.md`, `.claude/skills/run-envsetup/smoke.mjs`

### 2026-08-27 · feat: reset-on-drift — drifted config re-enters the list as an opt-in reset · 8df81bd

- Files: `src/commands/__tests__/bootstrap-presentation.test.ts`, `src/commands/bootstrap.ts`, `src/commands/doctor.ts`, `src/items/chrome/chrome-pwas.ts`, `src/items/claude-code/claude-settings.ts`, `src/items/defs/better-display.ts`, `src/items/defs/delta-config.ts`, `src/items/defs/podman-machine.ts`, `src/items/defs/superwhisper-config.ts`, `src/items/ghostty/ghostty-config.ts`, `src/items/item.ts`, `src/items/repos/acmelabs-marketplace.ts`, `src/items/typora/typora-config.ts`

### 2026-08-27 · fix: four defects found by the doc-verified compatibility research · 6488ea5

- Files: `src/ceremonies/handlers.ts`, `src/items/defs/cleanshot-config.ts`, `src/items/defs/git-identity.ts`, `src/items/defs/ssh-keys.ts`, `src/items/editors/__tests__/editor-config.test.ts`, `src/items/editors/editor-config.ts`

### 2026-08-27 · docs: reset-on-drift plan + verified compatibility research appendix · e940f8a

- Files: `docs/CONFIG-COMPAT-PLAN.md`, `docs/PLAN.md`

### 2026-08-27 · chore(release): v0.1.0 · 582e7bb

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.0 (tagged 2026-08-27)

### 2026-08-27 · docs: reset-on-drift in CLAUDE/README/CONTRIBUTING, post-v0.1.0 release example · 5248192

- Files: `CLAUDE.md`, `CONTRIBUTING.md`, `README.md`

### 2026-08-27 · fix: curl|sh left stdin at the exhausted pipe — prompts EOF-cancelled instantly · c9d133b

- Files: `install.sh`, `src/commands/bootstrap.ts`

### 2026-08-27 · chore(release): v0.1.1 · 73c2992

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.1 (tagged 2026-08-27)

### 2026-08-27 · fix: piped-install prompts froze (dead /dev/tty reads) + 0-width-terminal OOM · 0a7257a

- Files: `install.sh`, `src/commands/bootstrap.ts`, `src/index.ts`

### 2026-08-27 · chore(release): v0.1.2 · ce54038

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.2 (tagged 2026-08-27)

### 2026-08-27 · fix: thread an explicitly-opened /dev/tty into every prompt (curl|sh input) · 8c9a1e7

- Files: `docs/PLAN.md`, `src/ceremonies/handlers.ts`, `src/commands/bootstrap.ts`, `src/commands/secrets.ts`, `src/index.ts`, `src/ui/config-screens.ts`, `src/ui/group-multi-select.ts`, `src/ui/radio-group.ts`, `src/ui/terminal.ts`

### 2026-08-27 · chore(release): v0.1.3 · 6529cdc

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.3 (tagged 2026-08-27)

### 2026-08-27 · fix: four defects from the first real end-to-end bootstrap run · 03fe76b

- Files: `src/commands/bootstrap.ts`, `src/items/claude-code/assets-embed.ts`, `src/items/claude-code/claude-settings.ts`, `src/items/defs/github-auth.ts`, `src/items/defs/ssh-keys.ts`, `src/items/typora/typora-config.ts`

### 2026-08-27 · chore(release): v0.1.4 · 27e0023

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.4 (tagged 2026-08-27)

### 2026-08-30 · feat: chrome-config asks to quit Chrome, then edits and reopens it · 1eb01fd

- Files: `src/commands/bootstrap.ts`, `src/items/chrome/chrome-config.ts`, `src/items/item.ts`, `src/orchestrator/orchestrator.ts`

### 2026-08-30 · chore(release): v0.1.5 · 1bdb147

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.5 (tagged 2026-08-30)

### 2026-08-30 · fix: label ceremony-only items as attended steps, not 'installed' · 04ea640

- Files: `src/commands/bootstrap.ts`, `src/orchestrator/orchestrator.ts`

### 2026-08-30 · chore(release): v0.1.6 · eab7d36

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.6 (tagged 2026-08-30)

### 2026-08-30 · feat: the one command finishes the job — auto connect phase, journal-driven retry · 2f79bb9

- Files: `README.md`, `src/ceremonies/connect-phase.ts`, `src/commands/__tests__/bootstrap-presentation.test.ts`, `src/commands/bootstrap.ts`, `src/commands/connect.ts`

### 2026-08-30 · chore(release): v0.1.7 · 7e100c5

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.7 (tagged 2026-08-30)

### 2026-08-30 · feat: render each item's config screen as one clack group · 361771b

- Files: `src/ui/config-screens.ts`

### 2026-08-30 · chore(release): v0.1.8 · 8f923db

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.8 (tagged 2026-08-30)

### 2026-08-30 · fix: radio prompt flows inside a clack group (state-aware frame) · 9c6446e

- Files: `src/ui/radio-group.ts`

### 2026-08-30 · chore(release): v0.1.9 · 2384b88

- Files: `CHANGELOG.md`, `package.json`, `src/index.ts`

## Since v0.1.9 (tagged 2026-08-30)

### 2026-08-30 · docs: OVERVIEW.md — project map, status, and handoff for new sessions · bb46dcb

- Files: `CLAUDE.md`, `docs/OVERVIEW.md`
- Why: Peter asked (2026-08-30, at 99% context) for an overview/PRD-style handoff that points to the other docs so a fresh session can resume without re-deriving the project.
- Notes: OVERVIEW carries the empirical facts (curl|sh + /dev/tty, 0-width PTY OOM, CPU spin) and the visual-grouping design.

### 2026-08-30 · docs: add LEDGER.md and the update discipline; record docs-restructure plan · 7439bec

- Files: `CLAUDE.md`, `CONTRIBUTING.md`, `docs/LEDGER.md`, `docs/OVERVIEW.md`
- Why: Peter asked for a continuously updated ledger of everything done, and whether PLAN.md / CONFIG-COMPAT-PLAN.md should be reworked into a PRD — the restructure plan (PRD / DECISIONS / LEDGER / research; retire PLAN) is recorded as OVERVIEW Next-up 2 rather than done.

### 2026-08-30 · docs: ledger with files touched + bun run ledger; startup pointers for agents · ee5e336

- Files: `CLAUDE.md`, `CONTRIBUTING.md`, `README.md`, `docs/LEDGER.md`, `docs/OVERVIEW.md`, `package.json`, `scripts/ledger.ts`
- Why: Peter: the one-line ledger was not complete enough to rehydrate a session — it needs a template, maintenance instructions, how to read it against OVERVIEW Status/Next up, the files touched per change, and CLAUDE.md/README must point agents at it on startup.
- Notes: the body is generated (append-only) by `scripts/ledger.ts`; underscores in subjects are escaped (`__tests__` rendered as bold). The visual-grouping patch found uncommitted in the working tree was parked on local branch `wip/visual-grouping`, unverified.
