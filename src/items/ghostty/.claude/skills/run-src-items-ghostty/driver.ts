#!/usr/bin/env bun
/** Driver for src/items/ghostty — READ-ONLY. Renders the config from defaults and runs both items' detect(). */
import { run } from "../../../../../exec/run.ts";
import {
  ghosttyConfig,
  ghosttyConfigSchema,
  renderGhosttyConfig,
} from "../../../ghostty-config.ts";
import { ghosttyIcon } from "../../../ghostty-icon.ts";

const defaults = ghosttyConfigSchema.parse({});
console.log(`defaults: ${JSON.stringify(defaults)}`);
const rendered = renderGhosttyConfig(defaults);
console.log(
  `renderGhosttyConfig → ${rendered.split("\n").length} lines:\n${rendered
    .split("\n")
    .slice(0, 4)
    .map((l) => `  ${l}`)
    .join("\n")}\n  …`,
);
const ctx = { manifest: { items: {} } as never, log: () => {}, run };
for (const item of [ghosttyConfig, ghosttyIcon]) {
  const d = await item.detect(ctx);
  console.log(`${item.id}.detect → installed=${d.installed}${d.differs ? " differs" : ""}`);
}
console.log("OK");
