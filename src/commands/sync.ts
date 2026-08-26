import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { loadManifest } from "../manifest/store.ts";
import { executePlan } from "./bootstrap.ts";

export default defineCommand({
  meta: { name: "sync", description: "Apply the manifest: install/configure anything missing" },
  args: {
    "dry-run": { type: "boolean", description: "Show the plan without changing anything" },
  },
  async run({ args }) {
    p.intro("envsetup sync");
    const manifest = await loadManifest();
    if (manifest === null) {
      p.cancel("no manifest — run envsetup (bootstrap) first");
      process.exit(1);
    }
    await executePlan(manifest, { dryRun: args["dry-run"] === true });
  },
});
