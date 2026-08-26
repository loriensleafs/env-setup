import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { manifestPath } from "../paths/paths.ts";
import { migrateToLatest } from "./migrations.ts";
import { manifestSchema, type Manifest } from "./schema.ts";

export async function loadManifest(path = manifestPath()): Promise<Manifest | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;
  return migrateToLatest(await file.json());
}

export async function saveManifest(manifest: Manifest, path = manifestPath()): Promise<void> {
  manifestSchema.parse(manifest);
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, `${JSON.stringify(manifest, null, 2)}\n`);
}
