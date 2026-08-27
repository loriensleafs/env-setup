import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { z } from "zod";
import { defineItem } from "../item.ts";

export const ghosttyConfigSchema = z.object({
  fontFamily: z.string().min(1).default("JetBrainsMono Nerd Font"),
  fontSize: z.number().int().min(8).max(32).default(13),
  theme: z.string().min(1).default("One Dark Two"),
  quickTerminal: z.boolean().default(true),
});
export type GhosttyConfig = z.infer<typeof ghosttyConfigSchema>;

const MARKER = "# managed by envsetup";
const CONFIG_PATH = join(homedir(), "Library/Application Support/com.mitchellh.ghostty/config");

export function renderGhosttyConfig(config: GhosttyConfig): string {
  return `${MARKER}
theme = ${config.theme}
font-family = ${config.fontFamily}
font-size = ${config.fontSize}

# Shell integration feature set (list is absolute, not additive).
shell-integration-features = cursor,title,path,sudo,ssh-env,ssh-terminfo

# Clipboard: copy on select; warn when pasting text with hidden newlines.
copy-on-select = true
clipboard-paste-protection = true

# Window: slight padding, remember size/position.
window-padding-x = 8
window-padding-y = 8
window-save-state = always

# Option acts as Alt for terminal apps' keybindings.
macos-option-as-alt = true
${config.quickTerminal ? "\n# Quick terminal over any app.\nkeybind = global:cmd+grave_accent=toggle_quick_terminal\n" : ""}`;
}

/** Writes Ghostty's config (decided defaults; docs/PLAN.md Phase A). */
export const ghosttyConfig = defineItem<GhosttyConfig>({
  id: "ghostty-config",
  title: "Ghostty configuration",
  kind: "config-only",
  deps: ["ghostty", "font-jetbrains-nf"],
  configSchema: ghosttyConfigSchema,
  defaultConfig: ghosttyConfigSchema.parse({}),
  detect: async (ctx) => {
    const file = Bun.file(CONFIG_PATH);
    if (!(await file.exists())) return { installed: false };
    // Drift-aware (like dotfiles): the file must EQUAL the freshly rendered
    // config for the effective settings — a marker-only check would miss theme/
    // font/keybind drift or a template change in a newer envsetup.
    const config = ghosttyConfigSchema.parse(ctx.manifest.items["ghostty-config"]?.config ?? {});
    return { installed: (await file.text()) === renderGhosttyConfig(config) };
  },
  configure: async (ctx, config) => {
    await mkdir(join(CONFIG_PATH, ".."), { recursive: true });
    const existing = Bun.file(CONFIG_PATH);
    if (await existing.exists()) {
      const text = await existing.text();
      if (!text.startsWith(MARKER)) {
        const backup = `${CONFIG_PATH}.backup-${Date.now()}`;
        await Bun.write(backup, text);
        ctx.log(`existing config backed up to ${backup}`);
      }
    }
    await Bun.write(CONFIG_PATH, renderGhosttyConfig(config));
  },
  verify: async () => {
    const file = Bun.file(CONFIG_PATH);
    return (await file.exists()) && (await file.text()).startsWith(MARKER);
  },
});
