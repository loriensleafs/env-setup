import { z } from "zod";
import { defineItem } from "../item.ts";
import { getSecret, SECRET_KEYS } from "../../secrets/secrets.ts";

const DOMAIN = "pro.betterdisplay.BetterDisplay";
const APP = "/Applications/BetterDisplay.app";

/**
 * BetterDisplay config is enormous and mostly PER-DISPLAY (resolutions, HiDPI,
 * brightness sync, XDR) — not meaningfully presettable without the actual
 * displays, and Peter's Highspot config is gone. So the automatable scope is
 * app-level defaults + license; per-display tuning is a guided ceremony, and
 * whatever Peter settles on can be captured later (like CleanShot).
 */
export const betterDisplaySchema = z.object({
  startAtLogin: z.boolean().default(true),
  showMenuBarItem: z.boolean().default(true),
  checkForUpdates: z.boolean().default(true),
});
export type BetterDisplayConfig = z.infer<typeof betterDisplaySchema>;

export const betterDisplay = defineItem<BetterDisplayConfig>({
  id: "better-display",
  title: "BetterDisplay",
  kind: "brew-cask",
  deps: ["homebrew"],
  configSchema: betterDisplaySchema,
  defaultConfig: betterDisplaySchema.parse({}),
  ceremonies: [
    { id: "better-display-license", title: "Activate BetterDisplay license (key on clipboard)" },
    { id: "better-display-settings", title: "Tune BetterDisplay per-display settings (guided)" },
  ],
  detect: async (ctx) => {
    const r = await ctx.run(["/opt/homebrew/bin/brew", "list", "--cask", "--versions", "betterdisplay"]);
    if (r.exitCode === 0) return { installed: true, version: r.stdout.trim().split(/\s+/)[1] };
    const plist = await ctx.run(["defaults", "read", `${APP}/Contents/Info`, "CFBundleShortVersionString"]);
    return plist.exitCode === 0
      ? { installed: true, version: `${plist.stdout.trim()} (not brew-managed)` }
      : { installed: false };
  },
  install: async (ctx) => {
    const r = await ctx.run(["/opt/homebrew/bin/brew", "install", "--cask", "betterdisplay"]);
    if (r.exitCode !== 0) throw new Error(`brew install betterdisplay failed: ${r.stderr.trim()}`);
    // The companion CLI (used for scripted display control later).
    await ctx.run(["/opt/homebrew/bin/brew", "install", "waydabber/betterdisplay/betterdisplaycli"]);
  },
  configure: async (ctx, config) => {
    for (const [key, value] of [
      ["startAtLogin", config.startAtLogin],
      ["showMenuBarItem", config.showMenuBarItem],
      ["SUEnableAutomaticChecks", config.checkForUpdates],
    ] as const) {
      await ctx.run(["defaults", "write", DOMAIN, key, "-bool", value ? "true" : "false"]);
    }
    if ((await getSecret(SECRET_KEYS.betterDisplayLicense)) === null) {
      ctx.log("no BetterDisplay license in the secret store — the ceremony will handle activation");
    }
  },
  verify: async (ctx) =>
    (await ctx.run(["defaults", "read", DOMAIN, "startAtLogin"])).exitCode === 0 ||
    (await ctx.run(["ls", APP])).exitCode === 0,
});
