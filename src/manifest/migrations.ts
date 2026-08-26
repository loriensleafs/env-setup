import { MANIFEST_VERSION, manifestSchema, type Manifest } from "./schema.ts";

/**
 * One pure function per version bump: MIGRATIONS[n] takes a version-n document
 * and returns a version-(n+1) document. Chained until MANIFEST_VERSION.
 */
const MIGRATIONS: Record<number, (doc: Record<string, unknown>) => Record<string, unknown>> = {
  // Example shape for the future:
  // 1: (doc) => ({ ...doc, manifestVersion: 2, newField: "default" }),
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
      throw new ManifestVersionError(`migration from ${version} produced bad version ${String(next)}`);
    }
    version = next;
  }
  return manifestSchema.parse(doc);
}
