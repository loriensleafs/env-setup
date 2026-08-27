import { MANIFEST_VERSION, manifestSchema, type Manifest } from "./schema.ts";

/**
 * One pure function per version bump: MIGRATIONS[n] takes a version-n document
 * and returns a version-(n+1) document. `migrateToLatest` chains them until the
 * doc reaches MANIFEST_VERSION. This runs AUTOMATICALLY every time a manifest is
 * loaded (see manifest/store.ts → loadManifest → migrateToLatest), so an
 * upgraded envsetup silently migrates an older user's manifest on first run —
 * the user never runs anything by hand.
 *
 * ─── HOW TO ADD A MIGRATION (do all three, in order) ────────────────────────
 * Whenever you change the manifest shape in schema.ts (add/rename/remove a
 * field, tighten a type):
 *
 *   1. In schema.ts: bump `MANIFEST_VERSION` by exactly 1 (e.g. 1 → 2) and edit
 *      the Zod `manifestSchema` to the NEW shape.
 *   2. Here: add an entry keyed by the OLD version whose function returns the
 *      NEW shape and MUST set `manifestVersion` to old+1. Migrate real user
 *      data — don't just relabel the version. Keep it a pure function (no I/O,
 *      no Date.now(); derive any timestamp from the doc or use a constant).
 *   3. Add a test in __tests__/migrations.test.ts feeding a real old-shape doc
 *      and asserting the upgraded doc parses and carries data forward.
 *
 * Example — v1 gains a required `theme` field defaulting to "system":
 *
 *   // schema.ts:  export const MANIFEST_VERSION = 2;  // was 1
 *   //             manifestSchema = z.object({ ..., theme: z.string() });
 *   1: (doc) => ({ ...doc, manifestVersion: 2, theme: "system" }),
 *
 * Migrations chain: if a user is on v1 and MANIFEST_VERSION is 4, the loop runs
 * MIGRATIONS[1] → [2] → [3] in sequence. Never delete or renumber an existing
 * entry (older manifests in the wild still need the full chain); only append.
 */
const MIGRATIONS: Record<number, (doc: Record<string, unknown>) => Record<string, unknown>> = {
  // (empty at MANIFEST_VERSION 1 — the loop below never runs until the first
  // schema bump adds MIGRATIONS[1]. This is correct, not a stub.)
};

export class ManifestVersionError extends Error {}

export function migrateToLatest(raw: unknown): Manifest {
  if (typeof raw !== "object" || raw === null) {
    throw new ManifestVersionError("manifest is not an object");
  }
  let doc = raw as Record<string, unknown>;
  const initial = doc.manifestVersion;
  if (typeof initial !== "number") {
    throw new ManifestVersionError("manifest has no numeric manifestVersion");
  }
  let version: number = initial;
  if (version > MANIFEST_VERSION) {
    throw new ManifestVersionError(
      `manifest version ${version} is newer than this envsetup understands (${MANIFEST_VERSION}); upgrade envsetup`,
    );
  }
  while (version < MANIFEST_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) {
      throw new ManifestVersionError(`no migration from manifest version ${version}`);
    }
    doc = migrate(doc);
    const next = doc.manifestVersion;
    if (typeof next !== "number" || next !== version + 1) {
      throw new ManifestVersionError(
        `migration from ${version} produced bad version ${String(next)}`,
      );
    }
    version = next;
  }
  return manifestSchema.parse(doc);
}
