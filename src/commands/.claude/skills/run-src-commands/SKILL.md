---
name: run-src-commands
description: Run, invoke and smoke-test src/commands — the citty subcommands (bootstrap, doctor, sync, auth, connect, secrets) and the picker's presentOption labelling — without installing anything. Use when asked to run, test or drive the commands module.
---

`src/commands/` is one file per subcommand. `bootstrap.ts` is the flagship flow (scan →
prompts → picker → config → confirm → install); `doctor.ts` is the read-only diff. Drive it with
`src/commands/.claude/skills/run-src-commands/driver.ts`: it exercises `presentOption()` (how
drift / retry / installed items are labelled in the picker), prints each subcommand's meta, and
runs `doctor --help` through the real entry. It never calls `bootstrap()`, `executePlan()` or
the `sync`/`connect`/`auth` run functions — those mutate the machine.

All paths are relative to the repo root.

## Run (agent path)

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun src/commands/.claude/skills/run-src-commands/driver.ts
```

Expected:

```text
presentOption:
  ✓ fresh install → no hint, checked
  ✓ drift → 'settings differ', unchecked
  ✓ failed last run → retry hint, checked
  ✓ installed (shown via --show-installed) → 'needs update'
  ✓ EMAIL_PENDING placeholder exported — pending-noreply-resolution

subcommand metas:
  auth: Sign in to GitHub (device flow under envsetup's app identity)
  …
  sync: Apply the manifest: install/configure anything missing

read-only through the entry:
  ✓ bun src/index.ts doctor --help exits 0

PASS
```

The one safe command here is `doctor`:

```bash
bun src/index.ts doctor            # read-only diff; exit 0
```

The full interactive bootstrap can be walked read-only (it writes nothing before "Proceed?")
with the repo-root skill: `expect .claude/skills/run-envsetup/bootstrap-walk.exp`.

## Test

```bash
bun test src/commands/__tests__    # 5 pass, 0 fail (bootstrap-presentation)
```
