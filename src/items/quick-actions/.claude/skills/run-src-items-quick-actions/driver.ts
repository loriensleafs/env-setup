#!/usr/bin/env bun
/** Driver for src/items/quick-actions — READ-ONLY. Renders the Automator workflow XML into scratch, lints it with plutil, runs detect(). */
import { join } from "node:path";
import { ACTIONS, quickActions, workflowXml } from "../../../quick-actions.ts";

const SCRATCH = process.env.SCRATCH ?? "/tmp/envsetup-quick-actions-driver";
console.log(`ACTIONS: ${ACTIONS.map((a) => `${a.name} (${a.script})`).join(" · ")}`);
const xml = workflowXml("/Users/example/.config/envsetup/scripts/copy-path.ts");
const out = join(SCRATCH, "document.wflow");
await Bun.write(out, xml);
const lint = Bun.spawnSync(["plutil", "-lint", out]);
if (lint.exitCode !== 0) throw new Error(lint.stdout.toString());
console.log(`workflowXml → ${xml.length} bytes, plutil -lint: ${lint.stdout.toString().trim()}`);
const d = await quickActions.detect({
  manifest: {} as never,
  log: () => {},
  run: async () => ({ exitCode: 0, stdout: "", stderr: "" }),
});
console.log(`${quickActions.id}.detect (deps ${quickActions.deps}) → installed=${d.installed}`);
console.log("OK");
