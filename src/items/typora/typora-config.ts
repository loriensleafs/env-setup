import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { defineItem } from "../item.ts";
import { getSecret, SECRET_KEYS } from "../../secrets/secrets.ts";

const THEMES = join(homedir(), "Library", "Application Support", "abnerworks.Typora", "themes");
/** Pinned per version policy (theme.typora.io/theme/Vercel → tecladochen). */
const THEME_ZIP =
  "https://github.com/tecladochen/typora-vercel-theme/releases/download/v1.0.1/typora-vercel-theme-v1.0.1.zip";

/**
 * Typora: Vercel light theme (pinned v1.0.1) + autosave off. License activation
 * is an app dialog (blobs are machine-bound — verified on Peter's machine), so
 * the key ships to the clipboard as a Stage C ceremony.
 */
export const typoraConfig = defineItem({
  id: "typora-config",
  title: "Typora configuration (Vercel theme)",
  kind: "config-only",
  deps: ["typora", "font-geist", "font-inter"],
  ceremonies: [{ id: "typora-license", title: "Enter Typora license (key on clipboard)" }],
  detect: async (ctx) => {
    const css = await Bun.file(join(THEMES, "vercel.css")).exists();
    if (!css) return { installed: false };
    // Drift-aware: verify all three written defaults, not just the theme.
    for (const [key, expected] of [
      ["theme", "Vercel"],
      ["useDarkTheme", "0"],
      ["enableAutoSave", "0"],
    ] as const) {
      const r = await ctx.run(["defaults", "read", "abnerworks.Typora", key]);
      if (r.stdout.trim() !== expected) return { installed: false };
    }
    return { installed: true };
  },
  configure: async (ctx) => {
    await mkdir(THEMES, { recursive: true });
    const zip = "/tmp/envsetup-typora-vercel.zip";
    const dl = await ctx.run(["curl", "-fsSL", "-o", zip, THEME_ZIP]);
    if (dl.exitCode !== 0) throw new Error("Vercel theme download failed");
    const uz = await ctx.run(["unzip", "-o", zip, "-d", THEMES]);
    if (uz.exitCode !== 0) throw new Error(`theme unzip failed: ${uz.stderr.trim()}`);
    await ctx.run(["rm", "-f", zip]);
    for (const [key, args] of [
      ["theme", ["-string", "Vercel"]],
      ["useDarkTheme", ["-bool", "false"]],
      ["enableAutoSave", ["-bool", "false"]],
    ] as const) {
      const r = await ctx.run(["defaults", "write", "abnerworks.Typora", key, ...args]);
      if (r.exitCode !== 0) throw new Error(`defaults write ${key} failed`);
    }
    if ((await getSecret(SECRET_KEYS.typoraLicense)) === null) {
      ctx.log("no Typora license in the secret store — ceremony will ask for manual entry");
    }
  },
  verify: async () => Bun.file(join(THEMES, "vercel.css")).exists(),
});
