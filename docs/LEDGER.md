# Ledger — what has been done, in order

The append-only record of every change that reached `main`, oldest first, newest last. It is the
**rehydration mechanism** for a new session: `docs/OVERVIEW.md` says where the project *is*
("Status") and what is *next* ("Next up"); this file says exactly what was *done*, in what order,
what each change did to **every file it touched** — code, docs, config, CI, scripts, assets — so an
agent can open the right files or `git show <sha>` instead of re-deriving history from the code.

## How to read it

1. Read OVERVIEW "Status" and "Next up" first — they are the summary; this is the detail.
2. Then read the **last section** here ("Since v<latest>"): everything that happened after the
   latest release — what is on `main` but not yet shipped. Each entry's `Summary` says what
   changed, `Why` says the motive, the per-file lines say where and what in each file, `Notes`
   carry the gotchas. Those entries are the evidence behind "Status".
3. When taking a "Next up" item, search this file for the files or keywords it involves, read
   those entries (their per-file lines and Notes), and `git show <sha>` only when the exact diff
   matters.
4. Headings are release boundaries: "## Since vX.Y.Z" holds the commits made **after** the vX.Y.Z
   tag. The section under the newest heading is the unreleased work.

## How to keep it up to date

- **Continuously, after every commit** — not at the end of the PR, never "later". Commit, then run
  `bun run ledger` (`scripts/ledger.ts`): it appends an entry skeleton per commit not yet listed —
  `Summary` / `Why` placeholders and one line per touched file with its +/− line counts. Fill in
  every `_(fill in)_`: the Summary, the Why, and for each file a short phrase of what changed in
  it. Add `Notes` when a future reader must know something (a gotcha, a follow-up, what was
  verified and how, a decision made on the spot). `bun run ledger --check` fails while anything
  is missing or unfilled. Commit as `docs(ledger): …` in the same PR — such commits are skipped by
  the script, so they never need an entry of their own.
- `Files` means **every** file the commit touched, whatever kind: source, tests, docs (this file,
  OVERVIEW, PLAN…), config (`package.json`, `biome.json`, `lefthook.yml`), CI workflows, scripts,
  assets. The script lists them all from git; never trim the list by hand.
- A release (`chore(release): vX.Y.Z` commit + tag) gets a new "## Since vX.Y.Z" heading; the
  script inserts it automatically after the tagged commit, so run it once more after tagging.
- Never rewrite or reorder old entries; correct a mistake with a new entry. Merge PRs with merge
  commits (not squash) so the shas here stay valid.
- Update OVERVIEW "Status" / "Next up" (and the PLAN.md decision section, if a decision moved) in
  the same step, citing the entry's sha, whenever the picture changed.

## Entry template

```markdown
### YYYY-MM-DD · type(scope): subject · sha

- Summary: one or two lines — what this change does as a whole
- Why: one line — the problem or request that caused it (name who asked if it was Peter)
- Files:
  - `src/thing.ts` (+12/−3) — what changed in this file
  - `docs/OVERVIEW.md` (+4/−1) — what changed in this file
  - `.github/workflows/ci.yml` (+2/−0) — what changed in this file
- Notes: optional — gotchas, follow-ups, what was verified and how
```

Entries up to 2026-08-30 were generated from `git log` and carry only the file list with line
counts; their commit messages (`git show -s <sha>`) hold the summary and why.

## Up to v0.0.1

### 2026-08-26 · Scaffold envsetup: bun + clack + citty + zod foundation · 4d67d0a

- Files:
  - `.github/workflows/release.yml` (+24/−0)
  - `.gitignore` (+5/−0)
  - `README.md` (+15/−0)
  - `bun.lock` (+108/−0)
  - `docs/PLAN.md` (+529/−0)
  - `docs/RESEARCH-clack-citty-bun.md` (+186/−0)
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
  - `docs/PLAN.md` (+11/−0)
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
  - `docs/PLAN.md` (+6/−0)

### 2026-08-26 · Core spine: paths, manifest, journal, item framework · bbe66aa

- Files:
  - `bun.lock` (+0/−5)
  - `docs/PLAN.md` (+16/−0)
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
  - `docs/PLAN.md` (+8/−0)
  - `src/items/claude-code/assets/settings.template.json` (+6/−6)
  - `src/items/claude-code/assets/statusline.sh` (+0/−113)
  - `src/items/claude-code/assets/statusline.ts` (+95/−0)

### 2026-08-26 · Drop bundled ghostty icns; Terminal icon is read from the OS at runtime · 013fbda

- Files:
  - `docs/PLAN.md` (+3/−1)
  - `src/items/ghostty/assets/ghostty-custom.icns` (binary)

### 2026-08-26 · Stage A UI: unified selection prompt + horizontal radio · bea943b

- Files:
  - `bun.lock` (+3/−0)
  - `docs/PLAN.md` (+13/−0)
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
  - `docs/PLAN.md` (+15/−0)
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
  - `docs/PLAN.md` (+13/−0)
  - `src/items/all.ts` (+50/−1)
  - `src/items/factories/__tests__/brew.test.ts` (+26/−0)
  - `src/items/factories/brew.ts` (+19/−1)
  - `src/items/factories/font-zip.ts` (+39/−0)

### 2026-08-26 · Stage B orchestrator: journaled, resumable, policy-encoded engine · 006aee9

- Files:
  - `docs/PLAN.md` (+12/−0)
  - `src/orchestrator/__tests__/orchestrator.test.ts` (+221/−0)
  - `src/orchestrator/orchestrator.ts` (+174/−0)

### 2026-08-26 · Wire bootstrap: scan → select → confirm → manifest → orchestrate · 8bac397

- Files:
  - `docs/PLAN.md` (+14/−0)
  - `src/commands/bootstrap.ts` (+205/−6)
  - `src/index.ts` (+5/−2)
  - `test/spikes/bootstrap-dry.exp` (+17/−0)

### 2026-08-26 · Address dry-run feedback: path prompt, navigable viewport, zod validation · 3cbb7ec

- Files:
  - `docs/PLAN.md` (+12/−0)
  - `src/commands/bootstrap.ts` (+42/−7)
  - `src/ui/__tests__/unified-select-state.test.ts` (+15/−12)
  - `src/ui/unified-select-state.ts` (+4/−2)
  - `src/ui/unified-select.ts` (+12/−2)

### 2026-08-26 · Rebuild unified select on clack's dynamic-group-multiselect pattern · 7a62d24

- Files:
  - `docs/PLAN.md` (+19/−0)
  - `src/commands/bootstrap.ts` (+8/−12)
  - `src/ui/__tests__/unified-select-state.test.ts` (+73/−97)
  - `src/ui/demo.ts` (+27/−23)
  - `src/ui/horizontal-radio.ts` (+2/−3)
  - `src/ui/theme.ts` (+0/−18)
  - `src/ui/unified-select-state.ts` (+57/−85)
  - `src/ui/unified-select.ts` (+172/−71)

### 2026-08-26 · UI fixes: real tab path completion, installed items excluded, stock styling · db68fd2

- Files:
  - `docs/PLAN.md` (+16/−0)
  - `src/commands/bootstrap.ts` (+10/−5)
  - `src/ui/demo.ts` (+1/−2)
  - `src/ui/path-prompt.ts` (+117/−0)
  - `src/ui/unified-select.ts` (+9/−2)

### 2026-08-26 · Vendor clack from main; faithful example-based group multiselect; stock path prompt · 068c5c7

- Files:
  - `bun.lock` (+7/−4)
  - `docs/PLAN.md` (+18/−0)
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
  - `docs/PLAN.md` (+14/−0)
  - `src/commands/bootstrap.ts` (+22/−4)
  - `src/ui/__tests__/group-multi-select.test.ts` (+8/−8)
  - `src/ui/demo.ts` (+2/−2)
  - `src/ui/group-multi-select.ts` (+11/−28)

### 2026-08-26 · Progress UX: per-section scan spinners, taskLog-group execution, --show-installed · 9c37ac6

- Files:
  - `docs/PLAN.md` (+12/−0)
  - `src/commands/bootstrap.ts` (+47/−27)
  - `src/index.ts` (+5/−1)

### 2026-08-26 · Scan via parallel stream.step per section · f11c668

- Files:
  - `docs/PLAN.md` (+5/−4)
  - `src/commands/bootstrap.ts` (+22/−13)

### 2026-08-26 · Scan: single taskLog group with transient parallel messages · d3275cc

- Files:
  - `bun.lock` (+6/−1)
  - `docs/PLAN.md` (+7/−1)
  - `package.json` (+2/−1)
  - `src/commands/bootstrap.ts` (+18/−25)

### 2026-08-26 · Scan: announce-then-evaluate messages, collapse to 'Ready in Xs' · e977297

- Files:
  - `docs/PLAN.md` (+7/−1)
  - `src/commands/bootstrap.ts` (+17/−19)

### 2026-08-26 · Config-only items: defaults, ghostty config+icon, git identity, dock, quick actions · 03015d4

- Files:
  - `docs/PLAN.md` (+20/−0)
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
  - `docs/PLAN.md` (+274/−267)
  - `src/items/all.ts` (+4/−0)
  - `src/items/chrome/__tests__/chrome-defaults.test.ts` (+18/−0)
  - `src/items/chrome/chrome-config.ts` (+88/−0)
  - `src/items/chrome/chrome-defaults.ts` (+107/−0)
  - `src/items/chrome/chrome-pwas.ts` (+55/−0)

### 2026-08-26 · Per-app config appliers: typora, superwhisper, cleanshot, editors, podman, raycast · 43d9474

- Files:
  - `docs/PLAN.md` (+21/−6)
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
  - `docs/PLAN.md` (+20/−7)
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
  - `docs/PLAN.md` (+19/−7)
  - `secrets.json.age` (binary)

### 2026-08-26 · Personal fonts, dotfiles block, connect ceremony runner, doctor diffing, real sync · 879eb74

- Files:
  - `docs/PLAN.md` (+16/−6)
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
  - `docs/PLAN.md` (+8/−0)
  - `src/commands/bootstrap.ts` (+22/−2)
  - `src/index.ts` (+9/−1)
  - `src/ui/__tests__/config-screens.test.ts` (+11/−0)
  - `src/ui/config-screens.ts` (+101/−0)
  - `test/spikes/bootstrap-dry.exp` (+1/−1)

## Since v0.0.1 (tagged 2026-08-26)

### 2026-08-26 · Record v0.0.1 release + verified curl bootstrap · ce333cb

- Files:
  - `docs/PLAN.md` (+5/−1)

### 2026-08-26 · Bump actions: checkout v7, gh-release v3 (Node 24 runtimes) · 6021675

- Files:
  - `.github/workflows/release.yml` (+2/−2)

### 2026-08-26 · Add workflow scope to device flow; auth --force re-authentication · 339207f

- Files:
  - `src/auth/auth-ceremony.ts` (+2/−2)
  - `src/auth/github-device-flow.ts` (+3/−1)
  - `src/commands/auth.ts` (+5/−2)

## Since v0.0.2 (tagged 2026-08-26)

### 2026-08-26 · Open-items sweep: Google Sans item, real CleanShot applier from captured defaults · ec73a78

- Files:
  - `docs/PLAN.md` (+14/−0)
  - `src/ceremonies/handlers.ts` (+8/−19)
  - `src/items/all.ts` (+2/−0)
  - `src/items/defs/cleanshot-config.ts` (+57/−15)
  - `src/items/defs/google-sans.ts` (+42/−0)

### 2026-08-26 · Web apps: ceremony + verified rename design; drop force-install policy · 6401e80

- Files:
  - `docs/PLAN.md` (+20/−0)
  - `src/ceremonies/handlers.ts` (+32/−0)
  - `src/items/chrome/__tests__/chrome-pwas.test.ts` (+26/−0)
  - `src/items/chrome/chrome-pwas.ts` (+51/−34)

### 2026-08-26 · Web apps: AX-driven install + filename rename (no policy, no managed badge) · 5e499d4

- Files:
  - `docs/PLAN.md` (+20/−0)
  - `src/ceremonies/handlers.ts` (+18/−25)
  - `src/items/chrome/__tests__/chrome-pwas.test.ts` (+11/−21)
  - `src/items/chrome/assets/install-web-app.swift` (+184/−0)
  - `src/items/chrome/chrome-pwas.ts` (+208/−39)

### 2026-08-26 · Add BetterDisplay, Finder favorites, comprehensive dotfiles, secrets reveal · 75cde92

- Files:
  - `docs/PLAN.md` (+22/−0)
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
  - `docs/PLAN.md` (+8/−0)
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
  - `docs/PLAN.md` (+13/−0)

### 2026-08-26 · Dep audit fixes (prebuilt betterdisplaycli, corepack, git dep) + permission reality · 92d716c

- Files:
  - `docs/PLAN.md` (+17/−0)
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
  - `docs/PLAN.md` (+9/−0)
  - `src/ceremonies/handlers.ts` (+18/−1)

### 2026-08-26 · secrets: list (names) + copy <key> to clipboard; confirm CleanShot auto-licenses · 264fdac

- Files:
  - `docs/PLAN.md` (+9/−0)
  - `src/commands/secrets.ts` (+19/−4)

### 2026-08-26 · Scrub partial key fragment; add 'secrets set' to store one secret · f3e37bf

- Files:
  - `docs/PLAN.md` (+13/−2)
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
  - `docs/PLAN.md` (+273/−41)
  - `docs/RESEARCH-clack-citty-bun.md` (+20/−2)

### 2026-08-26 · chore: add run-envsetup skill (safe smoke driver) · 8760264

- Files:
  - `.claude/skills/run-envsetup/SKILL.md` (+119/−0)
  - `.claude/skills/run-envsetup/smoke.mjs` (+71/−0)

### 2026-08-27 · feat: reset-on-drift — drifted config re-enters the list as an opt-in reset · 8df81bd

- Files:
  - `src/commands/__tests__/bootstrap-presentation.test.ts` (+24/−0)
  - `src/commands/bootstrap.ts` (+20/−4)
  - `src/commands/doctor.ts` (+10/−4)
  - `src/items/chrome/chrome-pwas.ts` (+19/−6)
  - `src/items/claude-code/claude-settings.ts` (+48/−15)
  - `src/items/defs/better-display.ts` (+55/−12)
  - `src/items/defs/delta-config.ts` (+18/−13)
  - `src/items/defs/podman-machine.ts` (+18/−2)
  - `src/items/defs/superwhisper-config.ts` (+14/−7)
  - `src/items/ghostty/ghostty-config.ts` (+7/−3)
  - `src/items/item.ts` (+9/−0)
  - `src/items/repos/acmelabs-marketplace.ts` (+17/−3)
  - `src/items/typora/typora-config.ts` (+4/−2)

### 2026-08-27 · fix: four defects found by the doc-verified compatibility research · 6488ea5

- Files:
  - `src/ceremonies/handlers.ts` (+1/−1)
  - `src/items/defs/cleanshot-config.ts` (+79/−4)
  - `src/items/defs/git-identity.ts` (+19/−4)
  - `src/items/defs/ssh-keys.ts` (+4/−0)
  - `src/items/editors/__tests__/editor-config.test.ts` (+7/−2)
  - `src/items/editors/editor-config.ts` (+23/−6)

### 2026-08-27 · docs: reset-on-drift plan + verified compatibility research appendix · e940f8a

- Files:
  - `docs/CONFIG-COMPAT-PLAN.md` (+112/−0)
  - `docs/PLAN.md` (+62/−0)

### 2026-08-27 · chore(release): v0.1.0 · 582e7bb

- Files:
  - `CHANGELOG.md` (+20/−1)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.0 (tagged 2026-08-27)

### 2026-08-27 · docs: reset-on-drift in CLAUDE/README/CONTRIBUTING, post-v0.1.0 release example · 5248192

- Files:
  - `CLAUDE.md` (+8/−1)
  - `CONTRIBUTING.md` (+15/−8)
  - `README.md` (+6/−0)

### 2026-08-27 · fix: curl|sh left stdin at the exhausted pipe — prompts EOF-cancelled instantly · c9d133b

- Files:
  - `install.sh` (+6/−0)
  - `src/commands/bootstrap.ts` (+12/−0)

### 2026-08-27 · chore(release): v0.1.1 · 73c2992

- Files:
  - `CHANGELOG.md` (+12/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.1 (tagged 2026-08-27)

### 2026-08-27 · fix: piped-install prompts froze (dead /dev/tty reads) + 0-width-terminal OOM · 0a7257a

- Files:
  - `install.sh` (+3/−6)
  - `src/commands/bootstrap.ts` (+7/−7)
  - `src/index.ts` (+51/−1)

### 2026-08-27 · chore(release): v0.1.2 · ce54038

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.2 (tagged 2026-08-27)

### 2026-08-27 · fix: thread an explicitly-opened /dev/tty into every prompt (curl|sh input) · 8c9a1e7

- Files:
  - `docs/PLAN.md` (+14/−0)
  - `src/ceremonies/handlers.ts` (+2/−1)
  - `src/commands/bootstrap.ts` (+15/−3)
  - `src/commands/secrets.ts` (+4/−3)
  - `src/index.ts` (+10/−29)
  - `src/ui/config-screens.ts` (+5/−0)
  - `src/ui/group-multi-select.ts` (+3/−0)
  - `src/ui/radio-group.ts` (+3/−0)
  - `src/ui/terminal.ts` (+41/−0)

### 2026-08-27 · chore(release): v0.1.3 · 6529cdc

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.3 (tagged 2026-08-27)

### 2026-08-27 · fix: four defects from the first real end-to-end bootstrap run · 03fe76b

- Files:
  - `src/commands/bootstrap.ts` (+26/−13)
  - `src/items/claude-code/assets-embed.ts` (+25/−0)
  - `src/items/claude-code/claude-settings.ts` (+10/−11)
  - `src/items/defs/github-auth.ts` (+19/−5)
  - `src/items/defs/ssh-keys.ts` (+25/−2)
  - `src/items/typora/typora-config.ts` (+20/−2)

### 2026-08-27 · chore(release): v0.1.4 · 27e0023

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.4 (tagged 2026-08-27)

### 2026-08-30 · feat: chrome-config asks to quit Chrome, then edits and reopens it · 1eb01fd

- Files:
  - `src/commands/bootstrap.ts` (+20/−1)
  - `src/items/chrome/chrome-config.ts` (+25/−2)
  - `src/items/item.ts` (+6/−0)
  - `src/orchestrator/orchestrator.ts` (+8/−1)

### 2026-08-30 · chore(release): v0.1.5 · 1bdb147

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.5 (tagged 2026-08-30)

### 2026-08-30 · fix: label ceremony-only items as attended steps, not 'installed' · 04ea640

- Files:
  - `src/commands/bootstrap.ts` (+10/−1)
  - `src/orchestrator/orchestrator.ts` (+13/−0)

### 2026-08-30 · chore(release): v0.1.6 · eab7d36

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.6 (tagged 2026-08-30)

### 2026-08-30 · feat: the one command finishes the job — auto connect phase, journal-driven retry · 2f79bb9

- Files:
  - `README.md` (+3/−3)
  - `src/ceremonies/connect-phase.ts` (+67/−0)
  - `src/commands/__tests__/bootstrap-presentation.test.ts` (+6/−0)
  - `src/commands/bootstrap.ts` (+35/−16)
  - `src/commands/connect.ts` (+9/−35)

### 2026-08-30 · chore(release): v0.1.7 · 7e100c5

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.7 (tagged 2026-08-30)

### 2026-08-30 · feat: render each item's config screen as one clack group · 361771b

- Files:
  - `src/ui/config-screens.ts` (+51/−38)

### 2026-08-30 · chore(release): v0.1.8 · 8f923db

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.8 (tagged 2026-08-30)

### 2026-08-30 · fix: radio prompt flows inside a clack group (state-aware frame) · 9c6446e

- Files:
  - `src/ui/radio-group.ts` (+24/−8)

### 2026-08-30 · chore(release): v0.1.9 · 2384b88

- Files:
  - `CHANGELOG.md` (+8/−0)
  - `package.json` (+1/−1)
  - `src/index.ts` (+1/−1)

## Since v0.1.9 (tagged 2026-08-30)

### 2026-08-30 · docs: OVERVIEW.md — project map, status, and handoff for new sessions · bb46dcb

- Summary: First handoff doc: project map, doc table, hard rules, architecture, hard-won empirical facts, status, next-up designs.
- Why: Peter asked (2026-08-30, at 99% context) for an overview/PRD-style doc pointing to the other docs so a fresh session can resume without re-deriving the project.
- Files:
  - `CLAUDE.md` (+2/−1) — "Start here: docs/OVERVIEW.md" pointer
  - `docs/OVERVIEW.md` (+130/−0) — new — the whole handoff, incl. the visual-grouping design and curl|sh / PTY facts

### 2026-08-30 · docs: add LEDGER.md and the update discipline; record docs-restructure plan · 7439bec

- Summary: First ledger (one line per commit from git log) plus the discipline to keep it; the PRD/DECISIONS/LEDGER/research restructure recorded as a plan.
- Why: Peter asked for a continuously updated ledger of everything done, and whether PLAN.md / CONFIG-COMPAT-PLAN.md should be reworked into a PRD.
- Files:
  - `CLAUDE.md` (+2/−1) — pointer to the ledger
  - `CONTRIBUTING.md` (+9/−1) — "Record it" step with a git-log regeneration command
  - `docs/LEDGER.md` (+115/−0) — new — seeded from git history under "Since vX" headings
  - `docs/OVERVIEW.md` (+13/−3) — doc-map row; Next-up 2 = docs restructure that retires PLAN.md

### 2026-08-30 · docs: ledger with files touched + bun run ledger; startup pointers for agents · ee5e336

- Summary: Ledger becomes a rehydration mechanism: generated entries with files touched, read/maintain instructions, entry template; agents pointed at OVERVIEW → LEDGER on startup.
- Why: Peter: the one-line ledger was not complete enough to rehydrate a session — needs a template, maintenance rules, how to read it against OVERVIEW, files per change, and startup pointers in CLAUDE.md/README.
- Files:
  - `CLAUDE.md` (+14/−4) — "Session start / session end" checklist replaces the start-here paragraph; `bun run ledger` in commands
  - `CONTRIBUTING.md` (+8/−9) — intro points at OVERVIEW/LEDGER; step 5 uses `bun run ledger`
  - `README.md` (+5/−3) — "Working on it" pointer to OVERVIEW → LEDGER
  - `docs/LEDGER.md` (+335/−79) — header rewritten (read / maintain / template); body regenerated with files per commit
  - `docs/OVERVIEW.md` (+14/−2) — Status references the unreleased ledger section; Next-up 1 points at `wip/visual-grouping`; resume checklist
  - `package.json` (+1/−0) — `ledger` script
  - `scripts/ledger.ts` (+92/−0) — new — append-only generator, skips docs(ledger) commits, escapes `_` in subjects
- Notes: The visual-grouping patch found uncommitted in the working tree was parked on local branch `wip/visual-grouping`, unverified.
