# 2026-08-26 04:41 · Foundation — spine, UI, items, orchestrator, first releases

- Goal: Stand up the pure-Bun CLI from scratch: item framework, manifest/journal, clack UI, orchestrator, first item groups, secrets, release pipeline; ship v0.0.1–v0.0.2.
- Outcome: v0.0.1 + v0.0.2 released; `curl … | sh` bootstrap works on Peter's machine; ~40-item registry; dev tooling (Biome, markdownlint, lefthook, git-cliff, CI + gitleaks); config screens; reset-on-drift designed.
- Open at end: Reset-on-drift (config-conflict consent) built but not released — blocks v0.1.0.

## Narrative

The whole first day, in many conversations. The narrative for this period lives in
the archived living plan [ARC-001](../archive/ARC-001-living-plan.md): "Build log (chronological)", "UI iteration history", "Session log", and
the dated decision sections (detect+lock killed → everything toggleable; vendored clack from
main for `completeOnTab`; secrets age-encrypted in-repo; per-item `zsh()` contributions; the
Claude Code auto-format hook installed by the CLI, not committed as project hooks; the
reset-on-drift config model collapsed from a much larger conflict-consent design — see
[ADR-010](../decisions/ADR-010-reset-on-drift-config-model.md)). Peter's collaboration rules were set here
(one question at a time, research first, best way not easiest, transitive prereqs installed
automatically) and are in ARC-001's banner, OVERVIEW.md and the PRD's Boundaries.

## Changes (one entry per commit, in order)

### 2026-08-26 · Scaffold envsetup: bun + clack + citty + zod foundation · 4d67d0a

- Files:
  - `.github/workflows/release.yml` (+24/−0)
  - `.gitignore` (+5/−0)
  - `README.md` (+15/−0)
  - `bun.lock` (+108/−0)
  - `docs/archive/ARC-001-living-plan.md` (+529/−0)
  - `docs/RESEARCH-ANA-001-clack-citty-bun.md` (+186/−0)
  - `docs/assets/ghostty-custom.icns` (binary)
  - `install.sh` (+17/−0)
  - `package.json` (+25/−0)
  - `spikes/cli.ts` (+8/−0)
  - `spikes/cli2.ts` (+11/−0)
  - `spikes/drive.exp` (+13/−0)
  - `spikes/spike.ts` (+58/−0)
  - `src/commands/bootstrap.ts` (+9/−0)
  - `src/commands/doctor.ts` (+8/−0)
  - `src/commands/secrets.ts` (+8/−0)
  - `src/commands/sync.ts` (+8/−0)
  - `src/index.ts` (+20/−0)
  - `templates/claude/hooks-notify.ts` (+167/−0)
  - `templates/claude/hooks-subagent-statusline.ts` (+145/−0)
  - `templates/claude/settings.template.json` (+191/−0)
  - `templates/claude/statusline.sh` (+113/−0)
  - `tsconfig.json` (+17/−0)

### 2026-08-26 · Restructure: feature-first layout per research · f323c06

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+11/−0)
  - `{templates/claude => src/items/claude-code/assets}/hooks-notify.ts` (+0/−0)
  - `{templates/claude => src/items/claude-code/assets}/hooks-subagent-statusline.ts` (+0/−0)
  - `{templates/claude => src/items/claude-code/assets}/settings.template.json` (+0/−0)
  - `{templates/claude => src/items/claude-code/assets}/statusline.sh` (+0/−0)
  - `{docs => src/items/ghostty}/assets/ghostty-custom.icns` (binary)
  - `test/spikes/README.md` (+5/−0)
  - `{spikes => test/spikes}/cli.ts` (+0/−0)
  - `{spikes => test/spikes}/cli2.ts` (+0/−0)
  - `{spikes => test/spikes}/drive.exp` (+0/−0)
  - `{spikes => test/spikes}/spike.ts` (+0/−0)

### 2026-08-26 · Record sibling-\_\_tests\_\_ testing convention · ce02c1b

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+6/−0)

### 2026-08-26 · Core spine: paths, manifest, journal, item framework · bbe66aa

- Files:
  - `bun.lock` (+0/−5)
  - `docs/archive/ARC-001-living-plan.md` (+16/−0)
  - `package.json` (+0/−1)
  - `src/items/__tests__/registry.test.ts` (+48/−0)
  - `src/items/__tests__/toposort.test.ts` (+30/−0)
  - `src/items/item.ts` (+52/−0)
  - `src/items/registry.ts` (+39/−0)
  - `src/items/toposort.ts` (+50/−0)
  - `src/journal/__tests__/journal.test.ts` (+66/−0)
  - `src/journal/journal.ts` (+75/−0)
  - `src/manifest/__tests__/migrations.test.ts` (+35/−0)
  - `src/manifest/__tests__/schema.test.ts` (+33/−0)
  - `src/manifest/__tests__/store.test.ts` (+26/−0)
  - `src/manifest/migrations.ts` (+42/−0)
  - `src/manifest/schema.ts` (+38/−0)
  - `src/manifest/store.ts` (+17/−0)
  - `src/paths/__tests__/paths.test.ts` (+33/−0)
  - `src/paths/paths.ts` (+26/−0)
  - `tsconfig.json` (+3/−0)

### 2026-08-26 · Convert Claude statusline to pure Bun · b31f9d2

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+8/−0)
  - `src/items/claude-code/assets/settings.template.json` (+6/−6)
  - `src/items/claude-code/assets/statusline.sh` (+0/−113)
  - `src/items/claude-code/assets/statusline.ts` (+95/−0)

### 2026-08-26 · Drop bundled ghostty icns; Terminal icon is read from the OS at runtime · 013fbda

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+3/−1)
  - `src/items/ghostty/assets/ghostty-custom.icns` (binary)

### 2026-08-26 · Stage A UI: unified selection prompt + horizontal radio · bea943b

- Files:
  - `bun.lock` (+3/−0)
  - `docs/archive/ARC-001-living-plan.md` (+13/−0)
  - `package.json` (+1/−0)
  - `src/ui/__tests__/horizontal-radio.test.ts` (+11/−0)
  - `src/ui/__tests__/unified-select-state.test.ts` (+118/−0)
  - `src/ui/demo.ts` (+52/−0)
  - `src/ui/horizontal-radio.ts` (+55/−0)
  - `src/ui/theme.ts` (+18/−0)
  - `src/ui/unified-select-state.ts` (+115/−0)
  - `src/ui/unified-select.ts` (+82/−0)
  - `test/spikes/ui-demo.exp` (+22/−0)

### 2026-08-26 · First items + live doctor detection · 6db521f

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+15/−0)
  - `src/commands/doctor.ts` (+36/−3)
  - `src/exec/__tests__/run.test.ts` (+21/−0)
  - `src/exec/run.ts` (+28/−0)
  - `src/index.ts` (+5/−1)
  - `src/items/all.ts` (+27/−0)
  - `src/items/defs/__tests__/xcode-clt.test.ts` (+58/−0)
  - `src/items/defs/bun-runtime.ts` (+27/−0)
  - `src/items/defs/homebrew.ts` (+24/−0)
  - `src/items/defs/node-lts.ts` (+27/−0)
  - `src/items/defs/uv.ts` (+25/−0)
  - `src/items/defs/xcode-clt.ts` (+38/−0)
  - `src/items/factories/__tests__/brew.test.ts` (+57/−0)
  - `src/items/factories/brew.ts` (+60/−0)
  - `src/items/item.ts` (+2/−0)

### 2026-08-26 · Register Group 2 apps + fonts; .app fallback detection; font-zip factory · 5320da6

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+13/−0)
  - `src/items/all.ts` (+50/−1)
  - `src/items/factories/__tests__/brew.test.ts` (+26/−0)
  - `src/items/factories/brew.ts` (+19/−1)
  - `src/items/factories/font-zip.ts` (+39/−0)

### 2026-08-26 · Stage B orchestrator: journaled, resumable, policy-encoded engine · 006aee9

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+12/−0)
  - `src/orchestrator/__tests__/orchestrator.test.ts` (+221/−0)
  - `src/orchestrator/orchestrator.ts` (+174/−0)

### 2026-08-26 · Wire bootstrap: scan → select → confirm → manifest → orchestrate · 8bac397

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+14/−0)
  - `src/commands/bootstrap.ts` (+205/−6)
  - `src/index.ts` (+5/−2)
  - `test/spikes/bootstrap-dry.exp` (+17/−0)

### 2026-08-26 · Address dry-run feedback: path prompt, navigable viewport, zod validation · 3cbb7ec

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+12/−0)
  - `src/commands/bootstrap.ts` (+42/−7)
  - `src/ui/__tests__/unified-select-state.test.ts` (+15/−12)
  - `src/ui/unified-select-state.ts` (+4/−2)
  - `src/ui/unified-select.ts` (+12/−2)

### 2026-08-26 · Rebuild unified select on clack's dynamic-group-multiselect pattern · 7a62d24

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+19/−0)
  - `src/commands/bootstrap.ts` (+8/−12)
  - `src/ui/__tests__/unified-select-state.test.ts` (+73/−97)
  - `src/ui/demo.ts` (+27/−23)
  - `src/ui/horizontal-radio.ts` (+2/−3)
  - `src/ui/theme.ts` (+0/−18)
  - `src/ui/unified-select-state.ts` (+57/−85)
  - `src/ui/unified-select.ts` (+172/−71)

### 2026-08-26 · UI fixes: real tab path completion, installed items excluded, stock styling · db68fd2

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+16/−0)
  - `src/commands/bootstrap.ts` (+10/−5)
  - `src/ui/demo.ts` (+1/−2)
  - `src/ui/path-prompt.ts` (+117/−0)
  - `src/ui/unified-select.ts` (+9/−2)

### 2026-08-26 · Vendor clack from main; faithful example-based group multiselect; stock path prompt · 068c5c7

- Files:
  - `bun.lock` (+7/−4)
  - `docs/archive/ARC-001-living-plan.md` (+18/−0)
  - `package.json` (+7/−4)
  - `src/commands/bootstrap.ts` (+18/−10)
  - `src/ui/__tests__/{unified-select-state.test.ts => group-multi-select.test.ts}` (+4/−4)
  - `src/ui/demo.ts` (+2/−2)
  - `src/ui/group-multi-select.ts` (+306/−0)
  - `src/ui/path-prompt.ts` (+0/−117)
  - `src/ui/unified-select-state.ts` (+0/−89)
  - `src/ui/unified-select.ts` (+0/−200)
  - `vendor/clack-core-1.4.3-main-20260815.tgz` (binary)
  - `vendor/clack-prompts-1.7.0-main-20260815.tgz` (binary)

### 2026-08-26 · Everything toggleable: drop locked-on, cascade safety from registry deps · 29721d0

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+14/−0)
  - `src/commands/bootstrap.ts` (+22/−4)
  - `src/ui/__tests__/group-multi-select.test.ts` (+8/−8)
  - `src/ui/demo.ts` (+2/−2)
  - `src/ui/group-multi-select.ts` (+11/−28)

### 2026-08-26 · Progress UX: per-section scan spinners, taskLog-group execution, --show-installed · 9c37ac6

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+12/−0)
  - `src/commands/bootstrap.ts` (+47/−27)
  - `src/index.ts` (+5/−1)

### 2026-08-26 · Scan via parallel stream.step per section · f11c668

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+5/−4)
  - `src/commands/bootstrap.ts` (+22/−13)

### 2026-08-26 · Scan: single taskLog group with transient parallel messages · d3275cc

- Files:
  - `bun.lock` (+6/−1)
  - `docs/archive/ARC-001-living-plan.md` (+7/−1)
  - `package.json` (+2/−1)
  - `src/commands/bootstrap.ts` (+18/−25)

### 2026-08-26 · Scan: announce-then-evaluate messages, collapse to 'Ready in Xs' · e977297

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+7/−1)
  - `src/commands/bootstrap.ts` (+17/−19)

### 2026-08-26 · Config-only items: defaults, ghostty config+icon, git identity, dock, quick actions · 03015d4

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+20/−0)
  - `src/commands/bootstrap.ts` (+2/−1)
  - `src/items/all.ts` (+14/−0)
  - `src/items/defs/__tests__/dock.test.ts` (+43/−0)
  - `src/items/defs/__tests__/macos-defaults.test.ts` (+43/−0)
  - `src/items/defs/dock.ts` (+60/−0)
  - `src/items/defs/git-identity.ts` (+37/−0)
  - `src/items/defs/macos-defaults.ts` (+62/−0)
  - `src/items/ghostty/__tests__/ghostty-config.test.ts` (+41/−0)
  - `src/items/ghostty/ghostty-config.ts` (+74/−0)
  - `src/items/ghostty/ghostty-icon.ts` (+41/−0)
  - `src/items/quick-actions/__tests__/quick-actions.test.ts` (+18/−0)
  - `src/items/quick-actions/quick-actions.ts` (+162/−0)

### 2026-08-26 · Rename horizontal-radio to radio-group · 63b4858

- Files:
  - `src/ui/__tests__/{horizontal-radio.test.ts => radio-group.test.ts}` (+1/−1)
  - `src/ui/demo.ts` (+2/−2)
  - `src/ui/{horizontal-radio.ts => radio-group.ts}` (+4/−4)

### 2026-08-26 · Chrome items + PLAN.md restructure (zero-loss, containment-verified) · d8c49e1

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+274/−267)
  - `src/items/all.ts` (+4/−0)
  - `src/items/chrome/__tests__/chrome-defaults.test.ts` (+18/−0)
  - `src/items/chrome/chrome-config.ts` (+88/−0)
  - `src/items/chrome/chrome-defaults.ts` (+107/−0)
  - `src/items/chrome/chrome-pwas.ts` (+55/−0)

### 2026-08-26 · Per-app config appliers: typora, superwhisper, cleanshot, editors, podman, raycast · 43d9474

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+21/−6)
  - `src/items/all.ts` (+13/−0)
  - `src/items/defs/cleanshot-config.ts` (+32/−0)
  - `src/items/defs/podman-machine.ts` (+41/−0)
  - `src/items/defs/raycast-config.ts` (+50/−0)
  - `src/items/defs/superwhisper-config.ts` (+41/−0)
  - `src/items/editors/__tests__/editor-config.test.ts` (+23/−0)
  - `src/items/editors/editor-config.ts` (+125/−0)
  - `src/items/typora/typora-config.ts` (+50/−0)
  - `src/secrets/__tests__/secrets.test.ts` (+27/−0)
  - `src/secrets/secrets.ts` (+44/−0)

### 2026-08-26 · Repos, generated ACMElabs marketplace, flagship claude-settings applier · 9d4ed0d

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+20/−7)
  - `src/commands/bootstrap.ts` (+2/−1)
  - `src/items/all.ts` (+10/−0)
  - `src/items/claude-code/__tests__/claude-settings.test.ts` (+53/−0)
  - `src/items/claude-code/claude-settings.ts` (+110/−0)
  - `src/items/defs/github-auth.ts` (+24/−0)
  - `src/items/repos/__tests__/acmelabs-marketplace.test.ts` (+33/−0)
  - `src/items/repos/acmelabs-marketplace.ts` (+73/−0)
  - `src/items/repos/repo-factory.ts` (+63/−0)
  - `src/secrets/__tests__/secrets.test.ts` (+16/−5)

### 2026-08-26 · GitHub device flow under envsetup's app identity + SSH keys + noreply email · 6c9d2f0

- Files:
  - `secrets.json.age` (binary)
  - `src/auth/__tests__/github-device-flow.test.ts` (+60/−0)
  - `src/auth/auth-ceremony.ts` (+65/−0)
  - `src/auth/github-device-flow.ts` (+92/−0)
  - `src/commands/auth.ts` (+19/−0)
  - `src/commands/secrets.ts` (+76/−3)
  - `src/index.ts` (+1/−0)
  - `src/items/all.ts` (+4/−0)
  - `src/items/defs/git-email.ts` (+26/−0)
  - `src/items/defs/github-auth.ts` (+8/−5)
  - `src/items/defs/ssh-keys.ts` (+77/−0)
  - `src/secrets/__tests__/age-store.test.ts` (+23/−0)
  - `src/secrets/age-store.ts` (+19/−0)

### 2026-08-26 · Commit re-encrypted secrets store; record auth+secrets as live-validated · aba1993

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+19/−7)
  - `secrets.json.age` (binary)

### 2026-08-26 · Personal fonts, dotfiles block, connect ceremony runner, doctor diffing, real sync · 879eb74

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+16/−6)
  - `src/ceremonies/handlers.ts` (+148/−0)
  - `src/commands/bootstrap.ts` (+1/−1)
  - `src/commands/connect.ts` (+50/−0)
  - `src/commands/doctor.ts` (+37/−12)
  - `src/commands/sync.ts` (+15/−3)
  - `src/index.ts` (+1/−0)
  - `src/items/all.ts` (+4/−0)
  - `src/items/chrome/chrome-config.ts` (+4/−0)
  - `src/items/defs/__tests__/dotfiles.test.ts` (+18/−0)
  - `src/items/defs/dotfiles.ts` (+47/−0)
  - `src/items/defs/personal-fonts.ts` (+38/−0)
  - `src/items/editors/editor-config.ts` (+3/−0)

### 2026-08-26 · Schema-driven per-app config screens + --defaults flag · c738ec9

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+8/−0)
  - `src/commands/bootstrap.ts` (+22/−2)
  - `src/index.ts` (+9/−1)
  - `src/ui/__tests__/config-screens.test.ts` (+11/−0)
  - `src/ui/config-screens.ts` (+101/−0)
  - `test/spikes/bootstrap-dry.exp` (+1/−1)

> **Released v0.0.1** — tag on this commit.

### 2026-08-26 · Record v0.0.1 release + verified curl bootstrap · ce333cb

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+5/−1)

### 2026-08-26 · Bump actions: checkout v7, gh-release v3 (Node 24 runtimes) · 6021675

- Files:
  - `.github/workflows/release.yml` (+2/−2)

### 2026-08-26 · Add workflow scope to device flow; auth --force re-authentication · 339207f

- Files:
  - `src/auth/auth-ceremony.ts` (+2/−2)
  - `src/auth/github-device-flow.ts` (+3/−1)
  - `src/commands/auth.ts` (+5/−2)

> **Released v0.0.2** — tag on this commit.

### 2026-08-26 · Open-items sweep: Google Sans item, real CleanShot applier from captured defaults · ec73a78

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+14/−0)
  - `src/ceremonies/handlers.ts` (+8/−19)
  - `src/items/all.ts` (+2/−0)
  - `src/items/defs/cleanshot-config.ts` (+57/−15)
  - `src/items/defs/google-sans.ts` (+42/−0)

### 2026-08-26 · Web apps: ceremony + verified rename design; drop force-install policy · 6401e80

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+20/−0)
  - `src/ceremonies/handlers.ts` (+32/−0)
  - `src/items/chrome/__tests__/chrome-pwas.test.ts` (+26/−0)
  - `src/items/chrome/chrome-pwas.ts` (+51/−34)

### 2026-08-26 · Web apps: AX-driven install + filename rename (no policy, no managed badge) · 5e499d4

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+20/−0)
  - `src/ceremonies/handlers.ts` (+18/−25)
  - `src/items/chrome/__tests__/chrome-pwas.test.ts` (+11/−21)
  - `src/items/chrome/assets/install-web-app.swift` (+184/−0)
  - `src/items/chrome/chrome-pwas.ts` (+208/−39)

### 2026-08-26 · Add BetterDisplay, Finder favorites, comprehensive dotfiles, secrets reveal · 75cde92

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+22/−0)
  - `src/ceremonies/handlers.ts` (+12/−0)
  - `src/commands/secrets.ts` (+9/−6)
  - `src/items/all.ts` (+4/−0)
  - `src/items/defs/__tests__/better-display.test.ts` (+10/−0)
  - `src/items/defs/__tests__/dotfiles.test.ts` (+7/−6)
  - `src/items/defs/better-display.ts` (+62/−0)
  - `src/items/defs/dotfiles.ts` (+30/−5)
  - `src/items/finder/__tests__/finder-favorites.test.ts` (+14/−0)
  - `src/items/finder/assets/set-favorites.swift` (+34/−0)
  - `src/items/finder/finder-favorites.ts` (+80/−0)
  - `src/secrets/secrets.ts` (+1/−0)

### 2026-08-26 · Remove dry-run; delete scratch test/spikes; document vendored clack · 5469d02

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+8/−0)
  - `src/commands/bootstrap.ts` (+3/−11)
  - `src/commands/sync.ts` (+2/−5)
  - `src/index.ts` (+0/−2)
  - `test/spikes/README.md` (+0/−5)
  - `test/spikes/bootstrap-dry.exp` (+0/−17)
  - `test/spikes/cli.ts` (+0/−8)
  - `test/spikes/cli2.ts` (+0/−11)
  - `test/spikes/drive.exp` (+0/−13)
  - `test/spikes/spike.ts` (+0/−58)
  - `test/spikes/ui-demo.exp` (+0/−22)
  - `vendor/README.md` (+35/−0)

### 2026-08-26 · Finder favorites: fix the segfault (OpaquePointer sentinel), compile-then-run · efe2d41

- Files:
  - `src/items/finder/__tests__/finder-favorites.test.ts` (+3/−1)
  - `src/items/finder/assets/set-favorites.swift` (+45/−15)
  - `src/items/finder/finder-favorites.ts` (+50/−17)

### 2026-08-26 · Record Finder favorites fix + lesson in plan · e446d74

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+13/−0)

### 2026-08-26 · Dep audit fixes (prebuilt betterdisplaycli, corepack, git dep) + permission reality · 92d716c

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+17/−0)
  - `src/ceremonies/handlers.ts` (+11/−0)
  - `src/items/defs/better-display.ts` (+19/−2)
  - `src/items/defs/git-identity.ts` (+1/−0)
  - `src/items/defs/node-lts.ts` (+4/−0)

### 2026-08-26 · Consolidate permission ceremony: all Accessibility + Screen Recording in one pass · 6bff2b6

- Files:
  - `src/items/defs/better-display.ts` (+1/−0)

### 2026-08-26 · Actually consolidate the accessibility/screen-recording ceremony (prior edit no-op'd) · c777bcc

- Files:
  - `src/ceremonies/handlers.ts` (+13/−3)

### 2026-08-26 · BetterDisplay license: precise clipboard+paste ceremony (no scriptable path) · dcb9469

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+9/−0)
  - `src/ceremonies/handlers.ts` (+18/−1)

### 2026-08-26 · secrets: list (names) + copy <key> to clipboard; confirm CleanShot auto-licenses · 264fdac

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+9/−0)
  - `src/commands/secrets.ts` (+19/−4)

### 2026-08-26 · Scrub partial key fragment; add 'secrets set' to store one secret · f3e37bf

- Files:
  - `docs/archive/ARC-001-living-plan.md` (+13/−2)
  - `src/commands/secrets.ts` (+22/−2)

### 2026-08-26 · Add BetterDisplay license to the encrypted secret store · 44895a6

- Files:
  - `secrets.json.age` (+5/−7)

### 2026-08-26 · build: add Biome, markdownlint, lefthook, git-cliff, CI + gitignore hardening · 42fc91e

- Files:
  - `.github/workflows/ci.yml` (+32/−0)
  - `.gitignore` (+7/−0)
  - `.markdownlint-cli2.jsonc` (+21/−0)
  - `CHANGELOG.md` (+65/−0)
  - `biome.json` (+54/−0)
  - `bun.lock` (+274/−0)
  - `cliff.toml` (+49/−0)
  - `lefthook.yml` (+39/−0)
  - `package.json` (+16/−3)
  - `tsconfig.json` (+3/−11)

### 2026-08-26 · feat: per-item zshrc, delta/DOCKER\_HOST, cursor/code CLI, FileChanged format hook, drift-aware detects · e5388ff

- Files:
  - `src/auth/__tests__/github-device-flow.test.ts` (+6/−2)
  - `src/auth/auth-ceremony.ts` (+18/−3)
  - `src/ceremonies/handlers.ts` (+44/−14)
  - `src/commands/auth.ts` (+4/−1)
  - `src/commands/bootstrap.ts` (+19/−6)
  - `src/commands/connect.ts` (+4/−1)
  - `src/commands/doctor.ts` (+34/−4)
  - `src/commands/secrets.ts` (+17/−5)
  - `src/index.ts` (+2/−1)
  - `src/items/__tests__/toposort.test.ts` (+7/−1)
  - `src/items/all.ts` (+104/−31)
  - `src/items/chrome/__tests__/chrome-pwas.test.ts` (+1/−1)
  - `src/items/chrome/chrome-defaults.ts` (+2/−2)
  - `src/items/chrome/chrome-pwas.ts` (+6/−2)
  - `src/items/claude-code/__tests__/claude-settings.test.ts` (+8/−2)
  - `src/items/claude-code/assets/hooks-format.ts` (+95/−0)
  - `src/items/claude-code/assets/hooks-notify.ts` (+14/−7)
  - `src/items/claude-code/assets/hooks-subagent-statusline.ts` (+6/−3)
  - `src/items/claude-code/assets/settings.template.json` (+15/−9)
  - `src/items/claude-code/assets/statusline.ts` (+1/−1)
  - `src/items/claude-code/claude-settings.ts` (+31/−7)
  - `src/items/defs/__tests__/better-display.test.ts` (+41/−2)
  - `src/items/defs/__tests__/dock.test.ts` (+15/−3)
  - `src/items/defs/__tests__/dotfiles.test.ts` (+44/−9)
  - `src/items/defs/__tests__/macos-defaults.test.ts` (+6/−2)
  - `src/items/defs/__tests__/superwhisper-config.test.ts` (+20/−0)
  - `src/items/defs/__tests__/xcode-clt.test.ts` (+2/−2)
  - `src/items/defs/better-display.ts` (+152/−19)
  - `src/items/defs/bun-runtime.ts` (+5/−0)
  - `src/items/defs/cleanshot-config.ts` (+4/−1)
  - `src/items/defs/delta-config.ts` (+48/−0)
  - `src/items/defs/dock.ts` (+6/−2)
  - `src/items/defs/dotfiles.ts` (+63/−65)
  - `src/items/defs/git-email.ts` (+8/−0)
  - `src/items/defs/git-identity.ts` (+13/−4)
  - `src/items/defs/github-auth.ts` (+3/−1)
  - `src/items/defs/homebrew.ts` (+18/−3)
  - `src/items/defs/macos-defaults.ts` (+14/−3)
  - `src/items/defs/node-lts.ts` (+0/−1)
  - `src/items/defs/podman-machine.ts` (+55/−6)
  - `src/items/defs/raycast-config.ts` (+18/−5)
  - `src/items/defs/shell-block.ts` (+69/−0)
  - `src/items/defs/ssh-keys.ts` (+10/−2)
  - `src/items/defs/superwhisper-config.ts` (+90/−25)
  - `src/items/defs/uv.ts` (+12/−3)
  - `src/items/defs/xcode-clt.ts` (+2/−1)
  - `src/items/editors/editor-config.ts` (+78/−14)
  - `src/items/factories/__tests__/brew.test.ts` (+12/−4)
  - `src/items/factories/brew.ts` (+9/−3)
  - `src/items/finder/__tests__/finder-favorites.test.ts` (+17/−11)
  - `src/items/finder/finder-favorites.ts` (+61/−11)
  - `src/items/ghostty/ghostty-config.ts` (+7/−6)
  - `src/items/ghostty/ghostty-icon.ts` (+1/−1)
  - `src/items/item.ts` (+23/−0)
  - `src/items/quick-actions/quick-actions.ts` (+9/−2)
  - `src/items/registry.ts` (+4/−1)
  - `src/items/repos/repo-factory.ts` (+61/−11)
  - `src/items/toposort.ts` (+4/−1)
  - `src/items/typora/typora-config.ts` (+10/−2)
  - `src/journal/journal.ts` (+1/−3)
  - `src/manifest/__tests__/schema.test.ts` (+5/−1)
  - `src/manifest/migrations.ts` (+33/−4)
  - `src/orchestrator/__tests__/orchestrator.test.ts` (+76/−18)
  - `src/orchestrator/orchestrator.ts` (+13/−12)
  - `src/secrets/age-store.ts` (+8/−2)
  - `src/ui/config-screens.ts` (+4/−1)

### 2026-08-26 · docs: add CLAUDE.md/AGENTS.md/CONTRIBUTING.md, refresh README + PLAN · 4bc4163

- Files:
  - `AGENTS.md` (+1/−0)
  - `CLAUDE.md` (+60/−0)
  - `CONTRIBUTING.md` (+99/−0)
  - `README.md` (+43/−4)
  - `docs/archive/ARC-001-living-plan.md` (+273/−41)
  - `docs/RESEARCH-ANA-001-clack-citty-bun.md` (+20/−2)

### 2026-08-26 · chore: add run-envsetup skill (safe smoke driver) · 8760264

- Files:
  - `.claude/skills/run-envsetup/SKILL.md` (+119/−0)
  - `.claude/skills/run-envsetup/smoke.mjs` (+71/−0)
