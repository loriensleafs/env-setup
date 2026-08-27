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
    // Theme file absent = never configured by us.
    if (!css) return { installed: false };
    // Drift-aware: verify all three written defaults, not just the theme. The
    // theme file exists, so a mismatch is a real differ, not absence.
    for (const [key, expected] of [
      ["theme", "Vercel"],
      ["useDarkTheme", "0"],
      ["enableAutoSave", "0"],
    ] as const) {
      const r = await ctx.run(["defaults", "read", "abnerworks.Typora", key]);
      if (r.stdout.trim() !== expected) return { installed: false, differs: true };
    }
    return { installed: true };
  },
  configure: async (ctx) => {
    await mkdir(THEMES, { recursive: true });
    const zip = "/tmp/envsetup-typora-vercel.zip";
    const dl = await ctx.run(["curl", "-fsSL", "-o", zip, THEME_ZIP]);
    if (dl.exitCode !== 0) throw new Error("Vercel theme download failed");
    // The release zip nests everything under typora-vercel-theme-vX/ (verified
    // 2026-08-27 — extracting straight into THEMES left vercel.css buried and
    // verify() failing). Extract to a temp dir, then move the css + its asset
    // dir to where Typora looks.
    const tmp = "/tmp/envsetup-typora-theme";
    await ctx.run(["rm", "-rf", tmp]);
    const uz = await ctx.run(["unzip", "-o", zip, "-d", tmp]);
    if (uz.exitCode !== 0) throw new Error(`theme unzip failed: ${uz.stderr.trim()}`);
    const found = await ctx.run([
      "/bin/sh",
      "-c",
      `find ${tmp} -maxdepth 3 -name vercel.css -type f | head -1`,
    ]);
    const cssPath = found.stdout.trim();
    if (cssPath === "") throw new Error("vercel.css not found in the theme zip");
    const srcDir = cssPath.slice(0, cssPath.lastIndexOf("/"));
    await ctx.run(["cp", cssPath, `${THEMES}/vercel.css`]);
    // The css references a sibling vercel/ asset folder (fonts, icons).
    await ctx.run(["rm", "-rf", `${THEMES}/vercel`]);
    await ctx.run(["cp", "-R", `${srcDir}/vercel`, `${THEMES}/vercel`]);
    await ctx.run(["rm", "-rf", zip, tmp]);
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
