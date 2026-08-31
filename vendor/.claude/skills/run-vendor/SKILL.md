---
name: run-vendor
description: Verify the vendored @clack tarballs are what package.json resolves and still carry completeOnTab. Use when asked to check, verify, run, or update the vendored clack packages.
---

`vendor/` holds `@clack/core` and `@clack/prompts` built from clack `main` (2026-08-15) as tarballs
(ADR-003) — pinned in `package.json` with an `overrides` entry. "Running" it means proving the install
resolves to these tarballs and the reason they exist (`completeOnTab`) is still true.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
tar tzf vendor/clack-core-1.4.3-main-20260815.tgz | head -5
# → package/package.json  package/LICENSE  package/README.md  package/dist/index.d.mts  package/dist/index.mjs
bun pm ls | grep -i clack
# → ├── @clack/core@./vendor/clack-core-1.4.3-main-20260815.tgz
#   ├── @clack/prompts@./vendor/clack-prompts-1.7.0-main-20260815.tgz
grep -c completeOnTab node_modules/@clack/core/dist/index.mjs     # → 1  (the feature npm lacks)
```

The prompts themselves are exercised by `/run-envsetup` (`bootstrap-walk.exp` — the path prompt shows the
`Tab: complete` footer and completes) and `/run-src-ui` (`demo-walk.exp`).

## Updating / swapping to npm

`vendor/README.md` has the exact steps and the release signal to watch (`@clack/core` > 1.4.3 with
`completeOnTab`). Until then: never swap to npm (CLAUDE.md hard rule).

## Gotchas

- Without the `overrides` entry Bun nests the published `@clack/core@1.4.3` under prompts and the types
  break — keep both the dependency and the override pointing at the tarball.
