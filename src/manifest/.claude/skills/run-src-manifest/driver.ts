#!/usr/bin/env bun
// Direct-invocation driver for src/manifest: schema parse, migrateToLatest,
// version guard, and save/load round trip on a temp path (never ~/.config).
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ManifestVersionError, migrateToLatest } from "../../../migrations.ts";
import { MANIFEST_VERSION, type Manifest, manifestSchema } from "../../../schema.ts";
import { loadManifest, saveManifest } from "../../../store.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

console.log(`src/manifest driver — MANIFEST_VERSION ${MANIFEST_VERSION}\n`);
const fixture: Manifest = {
  manifestVersion: MANIFEST_VERSION,
  createdAt: "2026-08-30T10:00:00Z",
  identity: { name: "Driver", githubUser: "driver", email: "1+driver@users.noreply.github.com" },
  locations: { devDir: "~/Dev", referenceDirName: "reference" },
  items: { homebrew: { selected: true }, podman: { selected: true, config: { cpus: 4 } } },
};
check("manifestSchema.parse accepts the fixture", manifestSchema.safeParse(fixture).success);
check(
  "locations defaults apply",
  manifestSchema.parse({ ...fixture, locations: {} }).locations.devDir === "~/Dev",
);
check(
  "migrateToLatest is a no-op at the current version",
  migrateToLatest(fixture).manifestVersion === MANIFEST_VERSION,
);
try {
  migrateToLatest({ ...fixture, manifestVersion: MANIFEST_VERSION + 1 });
  check("newer manifest is refused", false);
} catch (e) {
  check(
    "newer manifest is refused with ManifestVersionError",
    e instanceof ManifestVersionError,
    (e as Error).message,
  );
}
const path = join(mkdtempSync(join(tmpdir(), "envsetup-manifest-")), "manifest.json");
await saveManifest(fixture, path);
const back = await loadManifest(path);
check(
  "save → load round trip",
  back?.identity.githubUser === "driver" && back.items.podman?.selected === true,
  path,
);
check("loadManifest on a missing file → null", (await loadManifest(`${path}.missing`)) === null);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
