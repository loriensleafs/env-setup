---
name: run-src-manifest
description: Run, invoke and smoke-test src/manifest — the Zod-versioned manifest schema, migrations and store — on a temp file. Use when asked to run, test, validate or drive the manifest module or a migration.
---

`src/manifest/`: `schema.ts` (`manifestSchema`, `MANIFEST_VERSION`), `migrations.ts`
(`migrateToLatest` chains `MIGRATIONS[n]`; the file header is the recipe for adding one),
`store.ts` (`loadManifest` migrates on load; `saveManifest`). Drive it with
`src/manifest/.claude/skills/run-src-manifest/driver.ts` — parse a fixture, migrate, refuse a
newer version, and save/load round-trip on a **temp** path (never `~/.config/envsetup`).

All paths are relative to the repo root.

## Run (agent path)

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun src/manifest/.claude/skills/run-src-manifest/driver.ts
```

Expected:

```text
src/manifest driver — MANIFEST_VERSION 1

  ✓ manifestSchema.parse accepts the fixture
  ✓ locations defaults apply
  ✓ migrateToLatest is a no-op at the current version
  ✓ newer manifest is refused with ManifestVersionError — manifest version 2 is newer than this envsetup understands (1); upgrade envsetup
  ✓ save → load round trip — /var/folders/…/envsetup-manifest-XXXX/manifest.json
  ✓ loadManifest on a missing file → null

PASS
```

## Direct invocation (the REAL manifest, read-only)

```bash
bun -e 'import {loadManifest} from "./src/manifest/store.ts"; const m = await loadManifest(); console.log(m?.manifestVersion, Object.keys(m?.items ?? {}).length, "items")'
```

## Test

```bash
bun test src/manifest/__tests__    # 10 pass, 0 fail (migrations, schema, store)
```
