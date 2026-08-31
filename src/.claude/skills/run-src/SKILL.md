---
name: run-src
description: Run, smoke-test and drive the envsetup CLI entry (src/index.ts) — help routing, --version and the read-only doctor diff. Use when asked to run src, run the CLI from source, or check the entry works.
---

`src/` is the CLI: `src/index.ts` is the citty entry that routes to `src/commands/*`. Drive it
via `src/.claude/skills/run-src/driver.ts`, which spawns `bun src/index.ts`
over its **safe** surfaces only. Bare `bun src/index.ts` and `sync` INSTALL software — never
run them to test; the full interactive TUI walk (scan → picker → config → cancel at
"Proceed?") lives in the repo-root skill `.claude/skills/run-envsetup/`.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Setup

```bash
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
    └  61 satisfied · 2 missing · 1 drifted · 0 untracked · 0 shell-gap — `envsetup sync` applies the manifest

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

- `doctor` exits 0 without a TTY; its last line is the outro quoted above (counts are this
  machine's: satisfied · missing · drifted · untracked · shell-gap, per CONTEXT.md).
