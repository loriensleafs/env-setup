import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import color from "picocolors";
import { run } from "../exec/run.ts";
import { buildRegistry } from "../items/all.ts";
import type { ItemContext } from "../items/item.ts";
import { loadManifest } from "../manifest/store.ts";
import { MANIFEST_VERSION, type Manifest } from "../manifest/schema.ts";

function emptyManifest(): Manifest {
  return {
    manifestVersion: MANIFEST_VERSION,
    createdAt: new Date().toISOString(),
    identity: { name: "-", githubUser: "-", email: "-" },
    locations: { devDir: "~/Dev", referenceDirName: "reference" },
    items: {},
  };
}

export default defineCommand({
  meta: { name: "doctor", description: "Detect what's installed vs. the manifest" },
  async run() {
    p.intro("envsetup doctor");
    const manifest = (await loadManifest()) ?? emptyManifest();
    const ctx: ItemContext = { manifest, log: (m) => p.log.info(m), run };
    const registry = buildRegistry();
    const s = p.spinner();
    s.start("scanning");
    const rows: string[] = [];
    for (const item of registry.all()) {
      const d = await item.detect(ctx).catch(() => ({ installed: false as const }));
      const mark = d.installed ? color.green("✓") : color.red("✗");
      const ver = d.installed && d.version ? color.dim(` ${d.version}`) : "";
      const req = item.required ? color.dim(" (required)") : "";
      rows.push(`${mark} ${item.title}${ver}${req}`);
    }
    s.stop("scan complete");
    p.note(rows.join("\n"), "detection");
    p.outro(`${registry.all().length} items known — full diffing arrives with the manifest flow`);
  },
});
