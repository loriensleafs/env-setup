# Ledger — what has been done, in order

A continuously appended record of every change that reached `main`, newest last. One line per
commit (date · sha · conventional subject), grouped by release tag. **Discipline:** every PR that
changes behavior appends its entry here (or regenerate the block below with the command in
CONTRIBUTING.md); `docs/OVERVIEW.md` "Status" and "Next up" get touched in the same PR.

Seeded 2026-08-31 from `git log` (merge commits omitted).

## Up to v0.0.1

- 2026-08-26 4d67d0a Scaffold envsetup: bun + clack + citty + zod foundation
- 2026-08-26 f323c06 Restructure: feature-first layout per research
- 2026-08-26 ce02c1b Record sibling-**tests** testing convention
- 2026-08-26 bbe66aa Core spine: paths, manifest, journal, item framework
- 2026-08-26 b31f9d2 Convert Claude statusline to pure Bun
- 2026-08-26 013fbda Drop bundled ghostty icns; Terminal icon is read from the OS at runtime
- 2026-08-26 bea943b Stage A UI: unified selection prompt + horizontal radio
- 2026-08-26 6db521f First items + live doctor detection
- 2026-08-26 5320da6 Register Group 2 apps + fonts; .app fallback detection; font-zip factory
- 2026-08-26 006aee9 Stage B orchestrator: journaled, resumable, policy-encoded engine
- 2026-08-26 8bac397 Wire bootstrap: scan → select → confirm → manifest → orchestrate
- 2026-08-26 3cbb7ec Address dry-run feedback: path prompt, navigable viewport, zod validation
- 2026-08-26 7a62d24 Rebuild unified select on clack's dynamic-group-multiselect pattern
- 2026-08-26 db68fd2 UI fixes: real tab path completion, installed items excluded, stock styling
- 2026-08-26 068c5c7 Vendor clack from main; faithful example-based group multiselect; stock path prompt
- 2026-08-26 29721d0 Everything toggleable: drop locked-on, cascade safety from registry deps
- 2026-08-26 9c37ac6 Progress UX: per-section scan spinners, taskLog-group execution, --show-installed
- 2026-08-26 f11c668 Scan via parallel stream.step per section
- 2026-08-26 d3275cc Scan: single taskLog group with transient parallel messages
- 2026-08-26 e977297 Scan: announce-then-evaluate messages, collapse to 'Ready in Xs'
- 2026-08-26 03015d4 Config-only items: defaults, ghostty config+icon, git identity, dock, quick actions
- 2026-08-26 63b4858 Rename horizontal-radio to radio-group
- 2026-08-26 d8c49e1 Chrome items + PLAN.md restructure (zero-loss, containment-verified)
- 2026-08-26 43d9474 Per-app config appliers: typora, superwhisper, cleanshot, editors, podman, raycast
- 2026-08-26 9d4ed0d Repos, generated ACMElabs marketplace, flagship claude-settings applier
- 2026-08-26 6c9d2f0 GitHub device flow under envsetup's app identity + SSH keys + noreply email
- 2026-08-26 aba1993 Commit re-encrypted secrets store; record auth+secrets as live-validated
- 2026-08-26 879eb74 Personal fonts, dotfiles block, connect ceremony runner, doctor diffing, real sync
- 2026-08-26 c738ec9 Schema-driven per-app config screens + --defaults flag
- 2026-08-26 ce333cb Record v0.0.1 release + verified curl bootstrap
- 2026-08-26 6021675 Bump actions: checkout v7, gh-release v3 (Node 24 runtimes)
- 2026-08-26 339207f Add workflow scope to device flow; auth --force re-authentication
- 2026-08-26 ec73a78 Open-items sweep: Google Sans item, real CleanShot applier from captured defaults
- 2026-08-26 6401e80 Web apps: ceremony + verified rename design; drop force-install policy
- 2026-08-26 5e499d4 Web apps: AX-driven install + filename rename (no policy, no managed badge)
- 2026-08-26 75cde92 Add BetterDisplay, Finder favorites, comprehensive dotfiles, secrets reveal
- 2026-08-26 5469d02 Remove dry-run; delete scratch test/spikes; document vendored clack
- 2026-08-26 efe2d41 Finder favorites: fix the segfault (OpaquePointer sentinel), compile-then-run
- 2026-08-26 e446d74 Record Finder favorites fix + lesson in plan
- 2026-08-26 92d716c Dep audit fixes (prebuilt betterdisplaycli, corepack, git dep) + permission reality
- 2026-08-26 6bff2b6 Consolidate permission ceremony: all Accessibility + Screen Recording in one pass
- 2026-08-26 c777bcc Actually consolidate the accessibility/screen-recording ceremony (prior edit no-op'd)
- 2026-08-26 dcb9469 BetterDisplay license: precise clipboard+paste ceremony (no scriptable path)
- 2026-08-26 264fdac secrets: list (names) + copy <key> to clipboard; confirm CleanShot auto-licenses
- 2026-08-26 f3e37bf Scrub partial key fragment; add 'secrets set' to store one secret
- 2026-08-26 44895a6 Add BetterDisplay license to the encrypted secret store
- 2026-08-26 42fc91e build: add Biome, markdownlint, lefthook, git-cliff, CI + gitignore hardening
- 2026-08-26 e5388ff feat: per-item zshrc, delta/DOCKER_HOST, cursor/code CLI, FileChanged format hook, drift-aware detects
- 2026-08-26 4bc4163 docs: add CLAUDE.md/AGENTS.md/CONTRIBUTING.md, refresh README + PLAN
- 2026-08-26 8760264 chore: add run-envsetup skill (safe smoke driver)
- 2026-08-27 8df81bd feat: reset-on-drift — drifted config re-enters the list as an opt-in reset
- 2026-08-27 6488ea5 fix: four defects found by the doc-verified compatibility research
- 2026-08-27 e940f8a docs: reset-on-drift plan + verified compatibility research appendix
- 2026-08-27 582e7bb chore(release): v0.1.0

## Since v0.1.0 (tagged 2026-08-27)

- 2026-08-27 5248192 docs: reset-on-drift in CLAUDE/README/CONTRIBUTING, post-v0.1.0 release example
- 2026-08-27 c9d133b fix: curl|sh left stdin at the exhausted pipe — prompts EOF-cancelled instantly
- 2026-08-27 73c2992 chore(release): v0.1.1

## Since v0.1.1 (tagged 2026-08-27)

- 2026-08-27 0a7257a fix: piped-install prompts froze (dead /dev/tty reads) + 0-width-terminal OOM
- 2026-08-27 ce54038 chore(release): v0.1.2

## Since v0.1.2 (tagged 2026-08-27)

- 2026-08-27 8c9a1e7 fix: thread an explicitly-opened /dev/tty into every prompt (curl|sh input)
- 2026-08-27 6529cdc chore(release): v0.1.3

## Since v0.1.3 (tagged 2026-08-27)

- 2026-08-27 03fe76b fix: four defects from the first real end-to-end bootstrap run
- 2026-08-27 27e0023 chore(release): v0.1.4

## Since v0.1.4 (tagged 2026-08-27)

- 2026-08-30 1eb01fd feat: chrome-config asks to quit Chrome, then edits and reopens it
- 2026-08-30 1bdb147 chore(release): v0.1.5

## Since v0.1.5 (tagged 2026-08-30)

- 2026-08-30 04ea640 fix: label ceremony-only items as attended steps, not 'installed'
- 2026-08-30 eab7d36 chore(release): v0.1.6

## Since v0.1.6 (tagged 2026-08-30)

- 2026-08-30 2f79bb9 feat: the one command finishes the job — auto connect phase, journal-driven retry
- 2026-08-30 7e100c5 chore(release): v0.1.7

## Since v0.1.7 (tagged 2026-08-30)

- 2026-08-30 361771b feat: render each item's config screen as one clack group
- 2026-08-30 8f923db chore(release): v0.1.8

## Since v0.1.8 (tagged 2026-08-30)

- 2026-08-30 9c6446e fix: radio prompt flows inside a clack group (state-aware frame)
- 2026-08-30 2384b88 chore(release): v0.1.9

## Since v0.1.9 (tagged 2026-08-30)

- 2026-08-30 bb46dcb docs: OVERVIEW.md — project map, status, and handoff for new sessions
