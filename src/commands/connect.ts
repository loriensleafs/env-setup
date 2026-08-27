import * as p from "@clack/prompts";
import color from "picocolors";
import { defineCommand } from "citty";
import { run } from "../exec/run.ts";
import { buildRegistry } from "../items/all.ts";
import type { ItemContext } from "../items/item.ts";
import { loadManifest } from "../manifest/store.ts";
import { fallbackHandler, handlerFor } from "../ceremonies/handlers.ts";

export default defineCommand({
  meta: {
    name: "connect",
    description: "Run the attended finishing steps (sign-ins, permissions, licenses)",
  },
  async run() {
    p.intro("envsetup connect");
    const manifest = await loadManifest();
    if (manifest === null) {
      p.cancel("no manifest — run envsetup (bootstrap) first");
      process.exit(1);
    }
    const registry = buildRegistry();
    const ctx: ItemContext = { manifest, log: (m) => p.log.info(m), run };

    const pending: { id: string; title: string }[] = [];
    for (const item of registry.all()) {
      if (!(manifest.items[item.id]?.selected ?? false)) continue;
      if (!item.ceremonies?.length) continue;
      const d = await item.detect(ctx).catch(() => ({ installed: false }));
      if (!d.installed && item.install) continue; // app never made it — skip its ceremonies
      pending.push(...item.ceremonies);
    }

    if (pending.length === 0) {
      p.outro("nothing to connect — all done");
      return;
    }
    p.log.info(`${pending.length} finishing steps`);
    let done = 0;
    const skipped: string[] = [];
    for (const c of pending) {
      p.log.step(color.bold(c.title));
      const handler = handlerFor(c.id) ?? fallbackHandler(c.title);
      const ok = await handler.run({ run });
      if (ok) done++;
      else skipped.push(c.title);
    }
    if (skipped.length > 0) {
      p.note(skipped.join("\n"), "skipped — re-run `envsetup connect` anytime");
    }
    p.outro(`${done}/${pending.length} finished`);
  },
});
