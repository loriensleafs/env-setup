# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.6] - 2026-08-31

### Bug Fixes
- Label ceremony-only items as attended steps, not 'installed' (04ea640)

### Other
- Merge pull request #9 from loriensleafs/fix/deferred-ceremony-label (9912742)

## [0.1.5] - 2026-08-31

### Features
- Chrome-config asks to quit Chrome, then edits and reopens it (1eb01fd)

### Other
- Merge pull request #8 from loriensleafs/feat/ask-quit-chrome (b3ba734)

## [0.1.4] - 2026-08-27

### Bug Fixes
- Four defects from the first real end-to-end bootstrap run (03fe76b)

### Other
- Merge pull request #7 from loriensleafs/fix/first-real-run-defects (80b2729)

## [0.1.3] - 2026-08-27

### Bug Fixes
- Thread an explicitly-opened /dev/tty into every prompt (curl|sh input) (8c9a1e7)

### Other
- Merge pull request #6 from loriensleafs/fix/thread-prompt-input (ecd9560)

## [0.1.2] - 2026-08-27

### Bug Fixes
- Piped-install prompts froze (dead /dev/tty reads) + 0-width-terminal OOM (0a7257a)

### Other
- Merge pull request #5 from loriensleafs/fix/tty-self-heal (5661d93)

## [0.1.1] - 2026-08-27

### Bug Fixes
- Curl|sh left stdin at the exhausted pipe — prompts EOF-cancelled instantly (c9d133b)

### Documentation
- Reset-on-drift in CLAUDE/README/CONTRIBUTING, post-v0.1.0 release example (5248192)

### Other
- Merge pull request #3 from loriensleafs/docs/refresh-agent-docs (8a75e8a)
- Merge pull request #4 from loriensleafs/fix/curl-pipe-stdin (1be2ff7)

## [0.1.0] - 2026-08-27

### Bug Fixes
- Four defects found by the doc-verified compatibility research (6488ea5)

### Build & CI
- Add Biome, markdownlint, lefthook, git-cliff, CI + gitignore hardening (42fc91e)

### Documentation
- Add CLAUDE.md/AGENTS.md/CONTRIBUTING.md, refresh README + PLAN (4bc4163)
- Reset-on-drift plan + verified compatibility research appendix (e940f8a)

### Features
- Per-item zshrc, delta/DOCKER_HOST, cursor/code CLI, FileChanged format hook, drift-aware detects (e5388ff)
- Reset-on-drift — drifted config re-enters the list as an opt-in reset (8df81bd)

### Miscellaneous
- Add run-envsetup skill (safe smoke driver) (8760264)

### Other
- Open-items sweep: Google Sans item, real CleanShot applier from captured defaults (ec73a78)
- Web apps: ceremony + verified rename design; drop force-install policy (6401e80)
- Web apps: AX-driven install + filename rename (no policy, no managed badge) (5e499d4)
- Add BetterDisplay, Finder favorites, comprehensive dotfiles, secrets reveal (75cde92)
- Remove dry-run; delete scratch test/spikes; document vendored clack (5469d02)
- Finder favorites: fix the segfault (OpaquePointer sentinel), compile-then-run (efe2d41)
- Record Finder favorites fix + lesson in plan (e446d74)
- Dep audit fixes (prebuilt betterdisplaycli, corepack, git dep) + permission reality (92d716c)
- Consolidate permission ceremony: all Accessibility + Screen Recording in one pass (6bff2b6)
- Actually consolidate the accessibility/screen-recording ceremony (prior edit no-op'd) (c777bcc)
- BetterDisplay license: precise clipboard+paste ceremony (no scriptable path) (dcb9469)
- List (names) + copy <key> to clipboard; confirm CleanShot auto-licenses (264fdac)
- Scrub partial key fragment; add 'secrets set' to store one secret (f3e37bf)
- Add BetterDisplay license to the encrypted secret store (44895a6)
- Merge pull request #1 from loriensleafs/release/v0.1.0 (42061a3)
- Merge pull request #2 from loriensleafs/feat/config-conflict-consent (4de90c3)

## [0.0.2] - 2026-08-26

### Other
- Record v0.0.1 release + verified curl bootstrap (ce333cb)
- Bump actions: checkout v7, gh-release v3 (Node 24 runtimes) (6021675)
- Add workflow scope to device flow; auth --force re-authentication (339207f)

## [0.0.1] - 2026-08-26

### Other
- Scaffold envsetup: bun + clack + citty + zod foundation (4d67d0a)
- Feature-first layout per research (f323c06)
- Record sibling-__tests__ testing convention (ce02c1b)
- Core spine: paths, manifest, journal, item framework (bbe66aa)
- Convert Claude statusline to pure Bun (b31f9d2)
- Drop bundled ghostty icns; Terminal icon is read from the OS at runtime (013fbda)
- Stage A UI: unified selection prompt + horizontal radio (bea943b)
- First items + live doctor detection (6db521f)
- Register Group 2 apps + fonts; .app fallback detection; font-zip factory (5320da6)
- Stage B orchestrator: journaled, resumable, policy-encoded engine (006aee9)
- Wire bootstrap: scan → select → confirm → manifest → orchestrate (8bac397)
- Address dry-run feedback: path prompt, navigable viewport, zod validation (3cbb7ec)
- Rebuild unified select on clack's dynamic-group-multiselect pattern (7a62d24)
- UI fixes: real tab path completion, installed items excluded, stock styling (db68fd2)
- Vendor clack from main; faithful example-based group multiselect; stock path prompt (068c5c7)
- Everything toggleable: drop locked-on, cascade safety from registry deps (29721d0)
- Progress UX: per-section scan spinners, taskLog-group execution, --show-installed (9c37ac6)
- Scan via parallel stream.step per section (f11c668)
- Single taskLog group with transient parallel messages (d3275cc)
- Announce-then-evaluate messages, collapse to 'Ready in Xs' (e977297)
- Config-only items: defaults, ghostty config+icon, git identity, dock, quick actions (03015d4)
- Rename horizontal-radio to radio-group (63b4858)
- Chrome items + PLAN.md restructure (zero-loss, containment-verified) (d8c49e1)
- Per-app config appliers: typora, superwhisper, cleanshot, editors, podman, raycast (43d9474)
- Repos, generated ACMElabs marketplace, flagship claude-settings applier (9d4ed0d)
- GitHub device flow under envsetup's app identity + SSH keys + noreply email (6c9d2f0)
- Commit re-encrypted secrets store; record auth+secrets as live-validated (aba1993)
- Personal fonts, dotfiles block, connect ceremony runner, doctor diffing, real sync (879eb74)
- Schema-driven per-app config screens + --defaults flag (c738ec9)


