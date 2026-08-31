# src/items/defs — runtimes, tools, macOS and app configuration items

Largest blast radius in the repo: `install()`/`configure()` here run installers, `defaults write`,
`killall Dock/Finder`, `chsh`, `curl`. `detect()` is the only safe call — and `github-auth` and
`ssh-keys` `detect()` reach the GitHub API with the Keychain token.

- `commit.gpgsign` is written only once the signing key exists (`git-identity`/`ssh-keys`;
  ANA-007 #3).
- A hotkey takeover disables the system's symbolic hotkey first and runs `activateSettings -u`
  (Raycast 64; CleanShot 28/30/184; ANA-007 #1).
- `-data` blobs compare via `defaults export` base64 — `defaults read` truncates them (ANA-003).
- Machine-captured keys (BetterDisplay `menuLevel*`, CleanShot `LAVA*`, superwhisper `pushToTalk`)
  have no documentation: re-capture on app upgrades (ANA-007 "Unverifiable").
- `dotfiles` is a factory over the whole registry; its `detect()` reports `differs` whenever any
  item's `zsh()` changed (`shell-block.ts`). Per-machine values go to a sourced file
  (Podman `DOCKER_HOST`), never into the block.
- Install methods and why: ANA-002 / ADR-011. Drive:
  `bun src/items/defs/.claude/skills/run-src-items-defs/driver.ts`.
