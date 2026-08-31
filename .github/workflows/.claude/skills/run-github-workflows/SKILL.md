---
name: run-github-workflows
description: Inspect, reproduce, and verify ci.yml and release.yml. Use when asked to run, check, watch, lint, or debug a workflow or CI run.
---

`ci.yml` (checks on macos-14 + gitleaks on ubuntu) and `release.yml` (tag `v*` → compiled darwin binaries attached
to a GitHub release). Same driver as `/run-github`: `gh` to read, the workflow's own commands to reproduce.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path) — inspect and reproduce

Read the live state with `gh` (authenticated; `gh auth status` if not):

```bash
gh workflow list
# → ci       active  343364765
#   release  active  342875658
gh run list --workflow=ci.yml --limit 2
# → completed  success  Merge pull request #18 …  ci  main  push  …  19s
gh run list --workflow=release.yml --limit 1
# → completed  success  chore(release): v0.1.9  release  v0.1.9  push  …  26s
gh workflow view ci.yml --yaml | grep -n "runs-on\|bun run\|gitleaks\|bun test"
# → 10: runs-on: macos-14 · 22: run: bun test · 24: runs-on: ubuntu-latest · 30: uses: gitleaks/gitleaks-action@v2
```

Reproduce the `checks` job locally (same commands the workflow runs, on this Mac):

```bash
bun install && bun run check && bun test     # → Summary: 0 issues · 111 pass, 0 fail
```

Watch a PR's checks and merge once green (what the docs workflow in CONTRIBUTING does):

```bash
gh pr checks <n> --watch --interval 10
```

## What cannot be run here

- `release.yml` triggers only on a pushed `v*` tag and uploads assets — never run it to test; cut a
  release per CONTRIBUTING.md instead. `gh release view v0.1.9` shows the two darwin assets of the last one.
- The `secrets` job (gitleaks) runs on ubuntu in CI; no local gitleaks binary here. `actionlint` is not
  installed (`which actionlint` → nothing).

## Gotchas

- `gh pr checks <n> --watch` can return **"no checks reported"** for the first ~20 s after `gh pr create`
  (the run has not registered yet) — sleep and retry rather than treating it as green.
- Release uploads have flaked once ("other side closed") — re-run the failed job and verify both assets.
