import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { defineItem } from "../item.ts";
import { expandHome } from "../repos/repo-factory.ts";

const CLAUDE_DIR = join(homedir(), ".claude");

// Template + hook payloads ship inside the item's assets dir; resolved
// relative to this source file (works under bun run; compiled binary embeds
// via Bun.file on the bundled path).
const ASSETS = join(import.meta.dir, "assets");

/** Plugin-name → repo-item id (selection-aware settings, Peter's rule). */
export const PLUGIN_REPO_MAP: Record<string, string> = {
  "ask-user-question@ACMElabs": "repo-ask-user-question",
  "code-review@ACMElabs": "repo-code-review",
  "code-simplifier@ACMElabs": "repo-code-simplifier",
  "skills@ACMElabs": "repo-skills",
};

export interface BuildSettingsInput {
  template: Record<string, unknown>;
  devDir: string;
  /** Selected item ids from the manifest. */
  selection: Set<string>;
}

/**
 * Builds the target settings.json from the authoritative Desktop-derived
 * template: marketplace path templated onto this machine's devDir, ACMElabs
 * plugins filtered to the repos actually selected, statusline command pointed
 * at the pure-bun port. Everything else passes through verbatim
 * (docs/PLAN.md: Desktop file is authoritative; hooks INCLUDED).
 */
export function buildSettings(input: BuildSettingsInput): Record<string, unknown> {
  const settings = structuredClone(input.template);
  const marketplaces = settings.extraKnownMarketplaces as
    | Record<string, { source?: { path?: string } }>
    | undefined;
  const acme = marketplaces?.ACMElabs;
  if (acme?.source) {
    acme.source.path = join(expandHome(input.devDir), "ACMElabs", ".claude-plugin", "marketplace.json");
  }
  const plugins = settings.enabledPlugins as Record<string, boolean> | undefined;
  if (plugins) {
    for (const [pluginKey, repoItemId] of Object.entries(PLUGIN_REPO_MAP)) {
      if (!input.selection.has(repoItemId)) delete plugins[pluginKey];
    }
  }
  (settings.statusLine as Record<string, unknown> | undefined) &&
    ((settings.statusLine as Record<string, unknown>).command = "bun ~/.claude/statusline.ts");
  return settings;
}

export const claudeSettings = defineItem({
  id: "claude-settings",
  title: "Claude Code settings + hooks + statusline",
  kind: "config-only",
  deps: ["bun", "acmelabs-marketplace"],
  ceremonies: [{ id: "claude-login", title: "Sign in to Claude Code" }],
  detect: async () => {
    const settings = Bun.file(join(CLAUDE_DIR, "settings.json"));
    const statusline = Bun.file(join(CLAUDE_DIR, "statusline.ts"));
    if (!(await settings.exists()) || !(await statusline.exists())) return { installed: false };
    try {
      const current = (await settings.json()) as Record<string, unknown>;
      const line = (current.statusLine as Record<string, unknown> | undefined)?.command;
      return { installed: line === "bun ~/.claude/statusline.ts" };
    } catch {
      return { installed: false };
    }
  },
  configure: async (ctx) => {
    const template = (await Bun.file(join(ASSETS, "settings.template.json")).json()) as Record<string, unknown>;
    const selection = new Set(
      Object.entries(ctx.manifest.items)
        .filter(([, s]) => s.selected)
        .map(([id]) => id),
    );
    const settings = buildSettings({
      template,
      devDir: ctx.manifest.locations.devDir,
      selection,
    });
    const settingsPath = join(CLAUDE_DIR, "settings.json");
    const existing = Bun.file(settingsPath);
    if (await existing.exists()) {
      const backup = `${settingsPath}.backup-${Date.now()}`;
      await Bun.write(backup, await existing.text());
      ctx.log(`existing settings backed up to ${backup}`);
    }
    await mkdir(join(CLAUDE_DIR, "hooks"), { recursive: true });
    await Bun.write(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
    await Bun.write(
      join(CLAUDE_DIR, "hooks", "notify.ts"),
      await Bun.file(join(ASSETS, "hooks-notify.ts")).text(),
    );
    await Bun.write(
      join(CLAUDE_DIR, "hooks", "subagent-statusline.ts"),
      await Bun.file(join(ASSETS, "hooks-subagent-statusline.ts")).text(),
    );
    await Bun.write(
      join(CLAUDE_DIR, "statusline.ts"),
      await Bun.file(join(ASSETS, "statusline.ts")).text(),
    );
    ctx.log("settings, hooks and statusline in place — sign-in happens in the connect phase");
  },
  verify: async () => Bun.file(join(CLAUDE_DIR, "settings.json")).exists(),
});
