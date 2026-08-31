---
name: run-src
description: Run, smoke-test and drive the envsetup CLI entry (src/index.ts) — help routing, --version and the read-only doctor diff. Use when asked to run src, run the CLI from source, or check the entry works.
---

`src/` is the CLI: `src/index.ts` is the citty entry that routes to `src/commands/*`. Drive it
via `.claude/skills/run-src/driver.ts` (relative to `src/`), which spawns `bun src/index.ts`
over its **safe** surfaces only. Bare `bun src/index.ts` and `sync` INSTALL software — never
run them to test; the full interactive TUI walk (scan → picker → config → cancel at
"Proceed?") lives in the repo-root skill `.claude/skills/run-envsetup/`.

All paths below are relative to the **repo root**.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

## Run (agent path)

```bash
bun src/.claude/skills/run-src/driver.ts
```

Expected:

```text
src driver — bun src/index.ts

  ✓ --help lists the subcommands (exit 0)
  ✓ --version (exit 0)
  ✓ doctor --help (exit 0)
  ✓ doctor (read-only diff of this machine) (exit 0)
    └  61 in sync · 3 missing · 0 untracked · 0 shell-gap — `envsetup sync` applies the manifest

PASS
```

The commands it runs, individually:

```bash
bun src/index.ts --help           # USAGE envsetup [OPTIONS] auth|connect|doctor|sync|secrets
bun src/index.ts doctor           # read-only; scans every item's detect(), exit 0
```

## Test

```bash
bun test                          # Ran 111 tests across 31 files
```

## Gotchas

- `bun` is not on PATH in a fresh shell (exit 127) — `export PATH="$HOME/.bun/bin:$PATH"`.
- `doctor` needs a TTY-less run to still exit 0 — it does; its last line is the summary
  quoted above (numbers reflect this machine).
