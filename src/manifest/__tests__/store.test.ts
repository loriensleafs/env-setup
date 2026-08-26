import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadManifest, saveManifest } from "../store.ts";
import { MANIFEST_VERSION, type Manifest } from "../schema.ts";

const manifest: Manifest = {
  manifestVersion: MANIFEST_VERSION,
  createdAt: "2026-08-26T12:00:00Z",
  identity: { name: "P", githubUser: "l", email: "a@b" },
  locations: { devDir: "~/Dev", referenceDirName: "reference" },
  items: { bun: { selected: true, version: "1.4.0" } },
};

describe("manifest store", () => {
  test("round-trips through disk (creating parent dirs)", async () => {
    const path = join(tmpdir(), `envsetup-test-${Date.now()}`, "deep", "manifest.json");
    await saveManifest(manifest, path);
    const loaded = await loadManifest(path);
    expect(loaded).toEqual(manifest);
  });

  test("returns null when no manifest exists", async () => {
    expect(await loadManifest(join(tmpdir(), `envsetup-none-${Date.now()}.json`))).toBeNull();
  });
});
