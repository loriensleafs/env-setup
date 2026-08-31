#!/usr/bin/env bun
/**
 * Driver for src/items/claude-code — READ-ONLY. Builds settings.json from the
 * template into a fixture (no writes to ~/.claude), checks the embedded asset
 * paths resolve, and runs claudeSettings.detect() (what doctor does).
 */
import { run } from "../../../../../exec/run.ts";
import { ASSET_PATHS } from "../../../assets-embed.ts";
import { PLUGIN_REPO_MAP, buildSettings, claudeSettings } from "../../../claude-settings.ts";

for (const [name, path] of Object.entries(ASSET_PATHS)) {
  if (!(await Bun.file(path).exists())) throw new Error(`asset missing: ${name} → ${path}`);
}
console.log(`assets resolve: ${Object.keys(ASSET_PATHS).join(", ")} ✓`);
const template = (await Bun.file(ASSET_PATHS["settings.template.json"] as string).json()) as Record<
  string,
  unknown
>;
const settings = buildSettings({
  template,
  devDir: "~/Dev",
  selection: new Set(["repo-skills", "repo-code-review"]),
});
const mkt = (settings.extraKnownMarketplaces as Record<string, { source: { path: string } }>)
  .ACMElabs.source.path;
const plugins = Object.keys(settings.enabledPlugins as Record<string, boolean>).filter(
  (k) => k in PLUGIN_REPO_MAP,
);
console.log(`marketplace path → ${mkt}`);
console.log(
  `ACMElabs plugins kept for selection {repo-skills, repo-code-review}: ${plugins.join(", ")}`,
);
if (plugins.length !== 2) throw new Error("plugin filtering wrong");
console.log(`statusLine.command → ${(settings.statusLine as { command: string }).command}`);
const d = await claudeSettings.detect({
  manifest: { locations: { devDir: "~/Dev" }, items: {} } as never,
  log: () => {},
  run,
});
console.log(`claude-settings.detect → installed=${d.installed}${d.differs ? " differs" : ""}`);
console.log("OK");
