# 2026-08-27 00:59 · curl|sh interactivity root-caused; first full bootstrap failures fixed (v0.1.0–v0.1.4)

- Goal: Release v0.1.0 with reset-on-drift, then make the one-liner actually work interactively and survive Peter's first real bootstrap.
- Outcome: v0.1.0–v0.1.4. `curl … | sh` prompts work; first full bootstrap on Peter's machine surfaced four failures (embedded assets, GitHub token validation, typora nested zip, duplicated task-log lines), all fixed.
- Open at end: chrome-config fails when Chrome is running; ceremony-only items reported as 'installed'.

## Narrative

**curl|sh instant exit → freeze → OOM → fixed.** Under `curl … | sh` stdin is an exhausted pipe,
so the first prompt EOF-cancelled (v0.1.0). Attempt 1 (v0.1.1) redirected `exec … </dev/tty` in
`install.sh`: the prompt FROZE, Ctrl-C dead, 15.7 GB RSS. Two root causes found empirically:
(a) Bun cannot deliver input from a shell-redirected `/dev/tty` (bun-run and compiled, `<` and
`0<>`); (b) a 0-width PTY sends clack's erase-lines math into an infinite loop → `RangeError:
Out of memory`. Attempt 2 (v0.1.2) replaced `process.stdin` via defineProperty — still dead, and my
"INPUT-ALIVE" test was a **false positive from kernel echo** (Peter: "still not working… whats
going on???"). Fix (v0.1.3, `6529cdc`): open `/dev/tty` in-process (`src/ui/terminal.ts`) and pass
`input: promptInput()` to *every* prompt; a strong oracle (three chained prompts) validated it; a
columns/rows guard via `stty size` closed the OOM. Lesson recorded in OVERVIEW "Key empirical
facts": interactive tests need a real oracle (submit → next prompt appears).

**First full bootstrap (v0.1.4, `27e0023`)**: claude-settings ENOENT on `/$bunfs/root/assets/…`
→ assets embedded with `with { type: "file" }` (`import.meta.dir` does not exist in compiled
binaries); git-email/ssh-keys HTTP 401 → github-auth had validated `gh`'s token, not envsetup's
Keychain token → validate via `GET /user`, ssh-keys checks both key registrations; typora verify
failed → the theme zip is nested; duplicated "chrome-pwas installed" lines → taskLog re-render →
append-only spinner per step.

## Changes (one entry per commit, in order)

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

> **Released v0.1.0** — tag on this commit.

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

> **Released v0.1.1** — tag on this commit.

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

> **Released v0.1.2** — tag on this commit.

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

> **Released v0.1.3** — tag on this commit.

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

> **Released v0.1.4** — tag on this commit.
