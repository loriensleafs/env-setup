import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { defineItem } from "../item.ts";
import { expandHome } from "../repos/repo-factory.ts";
import { ASSET_PATHS } from "./assets-embed.ts";

const CLAUDE_DIR = join(homedir(), ".claude");

// Template + hook payloads are EMBEDDED via file-type imports (assets-embed.ts)
// so they exist inside the compiled binary too (import.meta.dir does not).

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
 * (docs/plan/PRD-001-envsetup.md Claude Code + docs/decisions/ADR-013-claude-code-format-hook-installed-by-cli.md: template is authoritative; hooks INCLUDED).
 */
export function buildSettings(input: BuildSettingsInput): Record<string, unknown> {
  const settings = structuredClone(input.template);
  const marketplaces = settings.extraKnownMarketplaces as
    | Record<string, { source?: { path?: string } }>
    | undefined;
  const acme = marketplaces?.ACMElabs;
  if (acme?.source) {
    acme.source.path = join(
      expandHome(input.devDir),
      "ACMElabs",
      ".claude-plugin",
      "marketplace.json",
    );
  }
  const plugins = settings.enabledPlugins as Record<string, boolean> | undefined;
  if (plugins) {
    for (const [pluginKey, repoItemId] of Object.entries(PLUGIN_REPO_MAP)) {
      if (!input.selection.has(repoItemId)) delete plugins[pluginKey];
    }
  }
  const statusLine = settings.statusLine as Record<string, unknown> | undefined;
  if (statusLine) statusLine.command = "bun ~/.claude/statusline.ts";
  return settings;
}

/** Key-order-independent JSON serialization, for deep equality. */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v !== null && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const body = Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(v) ?? "undefined";
}

export const claudeSettings = defineItem({
  id: "claude-settings",
  title: "Claude Code settings + hooks + statusline",
  kind: "config-only",
  deps: ["bun", "acmelabs-marketplace", "terminal-notifier"],
  ceremonies: [{ id: "claude-login", title: "Sign in to Claude Code" }],
  detect: async (ctx) => {
    const settingsFile = Bun.file(join(CLAUDE_DIR, "settings.json"));
    // No settings.json = never configured.
    if (!(await settingsFile.exists())) return { installed: false };
    // Drift-aware: settings.json must equal what we'd build for this manifest
    // (key order ignored), and every deployed hook/statusline must match the
    // shipped asset. Anything else is a differ — the user opts in to reset.
    let current: Record<string, unknown>;
    try {
      current = (await settingsFile.json()) as Record<string, unknown>;
    } catch {
      return { installed: false, differs: true };
    }
    const template = (await Bun.file(ASSET_PATHS["settings.template.json"]).json()) as Record<
      string,
      unknown
    >;
    const selection = new Set(
      Object.entries(ctx.manifest.items)
        .filter(([, s]) => s.selected)
        .map(([id]) => id),
    );
    const expected = buildSettings({ template, devDir: ctx.manifest.locations.devDir, selection });
    if (canonical(current) !== canonical(expected)) return { installed: false, differs: true };
    for (const [target, asset] of [
      ["hooks/notify.ts", "hooks-notify.ts"],
      ["hooks/subagent-statusline.ts", "hooks-subagent-statusline.ts"],
      ["hooks/format.ts", "hooks-format.ts"],
      ["statusline.ts", "statusline.ts"],
    ] as const) {
      const deployed = Bun.file(join(CLAUDE_DIR, target));
      if (!(await deployed.exists())) return { installed: false, differs: true };
      if ((await deployed.text()) !== (await Bun.file(ASSET_PATHS[asset]).text())) {
        return { installed: false, differs: true };
      }
    }
    return { installed: true };
  },
  configure: async (ctx) => {
    const template = (await Bun.file(ASSET_PATHS["settings.template.json"]).json()) as Record<
      string,
      unknown
    >;
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
      await Bun.file(ASSET_PATHS["hooks-notify.ts"]).text(),
    );
    await Bun.write(
      join(CLAUDE_DIR, "hooks", "subagent-statusline.ts"),
      await Bun.file(ASSET_PATHS["hooks-subagent-statusline.ts"]).text(),
    );
    // FileChanged formatter: auto-formats any changed file with each project's
    // own Biome / markdownlint config (found via $CLAUDE_PROJECT_DIR). Global
    // hook, per-project config — inert in projects without a matching config.
    await Bun.write(
      join(CLAUDE_DIR, "hooks", "format.ts"),
      await Bun.file(ASSET_PATHS["hooks-format.ts"]).text(),
    );
    await Bun.write(
      join(CLAUDE_DIR, "statusline.ts"),
      await Bun.file(ASSET_PATHS["statusline.ts"]).text(),
    );
    ctx.log(
      "settings, hooks (notify + format) and statusline in place — sign-in happens in the connect phase",
    );
  },
  verify: async () => Bun.file(join(CLAUDE_DIR, "settings.json")).exists(),
});
