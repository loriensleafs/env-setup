import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import color from "picocolors";
import { run } from "../exec/run.ts";
import { buildRegistry } from "../items/all.ts";
import type { ItemContext } from "../items/item.ts";
import { loadManifest } from "../manifest/store.ts";
import { MANIFEST_VERSION, type Manifest } from "../manifest/schema.ts";
import { zshGaps } from "../items/defs/shell-block.ts";
import { homedir } from "node:os";
import { join } from "node:path";

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
  meta: { name: "doctor", description: "Diff this machine against its manifest" },
  async run() {
    p.intro("envsetup doctor");
    const manifest = await loadManifest();
    const hasManifest = manifest !== null;
    const effective = manifest ?? emptyManifest();
    const ctx: ItemContext = { manifest: effective, log: (m) => p.log.info(m), run };
    const registry = buildRegistry();
    const s = p.spinner();
    s.start("scanning");
    const detections = new Map<string, { installed: boolean; version?: string }>();
    await Promise.all(
      registry.all().map(async (item) => {
        detections.set(
          item.id,
          await item.detect(ctx).catch(() => ({ installed: false as const })),
        );
      }),
    );
    s.stop(`scanned ${detections.size} items`);

    if (!hasManifest) {
      const rows = registry.all().map((item) => {
        const d = detections.get(item.id) ?? { installed: false };
        const mark = d.installed ? color.green("✓") : color.dim("·");
        return `${mark} ${item.title}${d.version ? color.dim(` ${d.version}`) : ""}`;
      });
      p.note(rows.join("\n"), "no manifest yet — raw detection");
      p.outro("run envsetup (bootstrap) to define this machine");
      return;
    }

    // Manifest diff: drift = selected-but-missing; extras = present-but-unselected.
    const drift: string[] = [];
    const extras: string[] = [];
    let ok = 0;
    for (const item of registry.all()) {
      const selected = effective.items[item.id]?.selected ?? false;
      const d = detections.get(item.id) ?? { installed: false };
      if (selected && !d.installed) drift.push(`${color.red("✗")} ${item.title}`);
      else if (!selected && d.installed)
        extras.push(
          `${color.yellow("+")} ${item.title}${d.version ? color.dim(` ${d.version}`) : ""}`,
        );
      else if (selected && d.installed) ok++;
    }
    if (drift.length > 0) p.note(drift.join("\n"), "missing (manifest wants these)");
    if (extras.length > 0)
      p.note(extras.join("\n"), "untracked (installed but not in the manifest)");
    if (drift.length === 0 && extras.length === 0) p.log.success("machine matches its manifest");

    // Per-item ~/.zshrc validation: for every SELECTED item that declares zsh
    // needs, confirm each of its lines is present in the live ~/.zshrc.
    const zshText = await Bun.file(join(homedir(), ".zshrc"))
      .text()
      .catch(() => "");
    const shellGaps: string[] = [];
    for (const item of registry.all()) {
      if (!(effective.items[item.id]?.selected ?? false)) continue;
      const missing = zshGaps(item, zshText);
      if (missing.length > 0) {
        shellGaps.push(`${color.red("✗")} ${item.title}: ${missing.length} zsh line(s) absent`);
      }
    }
    if (shellGaps.length > 0) {
      p.note(shellGaps.join("\n"), "shell config incomplete — run `envsetup sync`");
    }

    p.outro(
      `${ok} in sync · ${drift.length} missing · ${extras.length} untracked · ${shellGaps.length} shell-gap — \`envsetup sync\` applies the manifest`,
    );
  },
});
