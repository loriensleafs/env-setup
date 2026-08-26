import { describe, expect, test } from "bun:test";
import { ManifestVersionError, migrateToLatest } from "../migrations.ts";
import { MANIFEST_VERSION } from "../schema.ts";

const current = {
  manifestVersion: MANIFEST_VERSION,
  createdAt: "2026-08-26T12:00:00Z",
  identity: { name: "P", githubUser: "l", email: "a@b" },
  locations: { devDir: "~/Dev", referenceDirName: "reference" },
  items: {},
};

describe("migrateToLatest", () => {
  test("passes through a current-version manifest", () => {
    expect(migrateToLatest(current).manifestVersion).toBe(MANIFEST_VERSION);
  });

  test("rejects future versions with upgrade guidance", () => {
    expect(() => migrateToLatest({ ...current, manifestVersion: MANIFEST_VERSION + 1 })).toThrow(
      ManifestVersionError,
    );
    expect(() => migrateToLatest({ ...current, manifestVersion: MANIFEST_VERSION + 1 })).toThrow(
      /upgrade envsetup/,
    );
  });

  test("rejects non-objects and missing versions", () => {
    expect(() => migrateToLatest(null)).toThrow(ManifestVersionError);
    expect(() => migrateToLatest({})).toThrow(ManifestVersionError);
  });

  test("rejects unmigratable old versions", () => {
    expect(() => migrateToLatest({ ...current, manifestVersion: 0 })).toThrow(/no migration/);
  });
});
