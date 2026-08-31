import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { buildRegistry } from "../items/all.ts";
import { loadManifest } from "../manifest/store.ts";
import { runConnectPhase } from "../ceremonies/connect-phase.ts";

/**
 * Re-run the attended finishing steps. The install flow (bootstrap/sync)
 * already runs them automatically; this exists to retry anything skipped.
 */
export default defineCommand({
  meta: {
    name: "connect",
    description: "Re-run the attended finishing steps (sign-ins, permissions, licenses)",
  },
  async run() {
    p.intro("envsetup connect");
    const manifest = await loadManifest();
    if (manifest === null) {
      p.cancel("no manifest — run envsetup (bootstrap) first");
      process.exit(1);
    }
    const res = await runConnectPhase(buildRegistry(), manifest);
    if (res.pending === 0) p.outro("nothing to connect — all done");
    else p.outro(`${res.done}/${res.pending} finished`);
  },
});
