---
name: run-envsetup
description: Build, run, and drive the envsetup CLI. Use when asked to start, run, build, test, smoke-test, or screenshot envsetup, or to run its doctor/diff against the machine. envsetup is an interactive macOS setup CLI — the driver exercises only its safe read-only surfaces.
---

Drive envsetup via the smoke driver at `.claude/skills/run-envsetup/smoke.mjs` — it
launches the real CLI and checks the safe, non-interactive surfaces (`--help` routing +
the read-only `doctor` diff). **envsetup is a macOS environment-setup tool: bare
`envsetup` (bootstrap) and `sync` INSTALL software and mutate system state.** Never run
those to "test" it — the driver deliberately avoids them.

All paths below are relative to the repo root (the `<unit>` dir).

## Prerequisites

- **macOS.** envsetup drives `defaults write`, Homebrew, app installs, the Dock, Finder, etc.
  The read-only surfaces (`--help`, `doctor`) run wherever Bun runs, but item *detection*
  assumes macOS.
- **Bun** on PATH. If `bun` isn't found (`command not found: bun` / exit 127), add it:

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun --version
```

## Setup

```bash
bun install
```

`bun install` also installs git hooks (via the `prepare` → `lefthook install` script).

## Run (agent path) — the driver

The primary way to drive envsetup. Runs the actual CLI over its safe surfaces and asserts
exit codes + output; exits 0 on success:

```bash
bun .claude/skills/run-envsetup/smoke.mjs
```

Expected tail:

```text
read-only machine diff:
  ✓ doctor runs and reports a diff
  ✓ doctor outro shape (in sync · missing · untracked · shell-gap)

PASS — 8 passed, 0 failed
```

Individual safe commands the driver runs (all read-only, all exit 0):

```bash
bun run dev --help              # root: lists auth|connect|doctor|sync|secrets
bun run dev doctor --help       # per-subcommand help
bun run dev secrets --help      # lists actions: init · list · show · reveal · copy · set · unlock
bun run dev doctor              # READ-ONLY: diffs this machine vs its manifest, prints a live TUI
```

`doctor` is the richest safe interaction — it scans every item's `detect()` and renders a
clack TUI ending in `<n> in sync · <n> missing · <n> untracked · <n> shell-gap`. Capture it:

```bash
bun run dev doctor > /tmp/envsetup-doctor.txt 2>&1; echo "exit=$?"   # exit=0
```

## Build (standalone binary)

```bash
bun run compile                 # → dist/envsetup (≈62M, Bun embedded, no Node)
./dist/envsetup --help          # exit 0
./dist/envsetup doctor          # read-only, exit 0
```

## Run (human path) — interactive, MUTATES THE MACHINE

Bare `envsetup` starts the interactive bootstrap (clack prompts: identity → dev-dir →
selection → confirm → **installs everything selected**). This is the real product flow and
it changes the system. Do not run it to smoke-test.

```bash
bun run dev                     # interactive bootstrap — installs software. Human-only.
```

Other mutating/attended subcommands (not for the driver): `sync` (installs missing items),
`connect` (attended sign-ins/permissions/licenses), `auth` (GitHub device flow), and the
`secrets` actions other than `--help` (passphrase-gated).

## Test

```bash
bun test                        # 106 tests
bun run check                   # Biome + tsc + markdownlint (the CI/pre-push gate)
```

## Gotchas

- **`bun` not on PATH → exit 127.** Each shell needs `export PATH="$HOME/.bun/bin:$PATH"`.
  The smoke driver calls `bun` directly, so run it from a shell where `bun --version` works.
- **`secrets list` blocks on a passphrase prompt** (interactive, needs an initialized
  age store). The driver uses `secrets --help` instead — never `secrets list/show/reveal`.
- **No `timeout` on macOS** (it's GNU coreutils). Don't wrap commands in `timeout`; the safe
  commands self-terminate.
- **Interactive prompts need a real TTY.** envsetup uses clack (raw-mode input); piping
  stdin (`echo ... | bun run dev`) won't drive the prompts. There's no headless way to run
  the interactive bootstrap here (no tmux in this environment), which is fine — the driver
  targets the non-interactive surfaces, and bootstrap/sync are destructive anyway.
- **`doctor` is safe; `sync`/`bootstrap` are not.** `doctor` only calls each item's
  `detect()` (reads state). `sync` and bare `envsetup` call `install()`/`configure()`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `command not found: bun` / exit 127 | `export PATH="$HOME/.bun/bin:$PATH"` |
| `doctor` shows "no manifest yet — raw detection" | Expected on a machine that never ran bootstrap; still exits 0. |
| A hung `bun src/index.ts` after Ctrl-C on an interactive command | `pkill -f "src/index.ts"` |
