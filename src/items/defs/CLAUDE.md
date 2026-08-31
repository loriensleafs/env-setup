# src/items/defs — runtimes, tools, macOS and app configuration items (ADR-011, ADR-012, ANA-002, ANA-003, ANA-007)

Largest blast radius in the repo: `install()`/`configure()` here run installers, `defaults write`,
`killall Dock/Finder`, `chsh`, `curl`. `detect()` is the only safe call — and `github-auth` and
`ssh-keys` `detect()` reach the GitHub API with the Keychain token. Drive with
`bun src/items/defs/.claude/skills/run-src-items-defs/driver.ts`.

- `commit.gpgsign` is written only once the signing key exists (`git-identity`/`ssh-keys`;
  ANA-007 #3).
- A hotkey takeover disables the system's symbolic hotkey first and runs `activateSettings -u`
  (Raycast 64; CleanShot 28/30/184; ANA-007 #1).
- Per-machine values (Podman `DOCKER_HOST`) go to a sourced file under `~/.config/envsetup/`,
  never into the shell block.
- `dotfiles` is a factory over the whole registry; its `detect()` reports Drifted whenever any
  item's `zsh()` changed (`shell-block.ts`).
- `-data` blobs compare via `defaults export` base64 — `defaults read` truncates them (ANA-003).
- Machine-captured keys (BetterDisplay `menuLevel*`, CleanShot `LAVA*`, superwhisper
  `pushToTalk`) have no documentation: re-capture on app upgrades (ANA-007 "Unverifiable").
- For why each tool installs the way it does: ANA-002.
