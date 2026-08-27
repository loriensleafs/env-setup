import { z } from "zod";
import { defineItem } from "../item.ts";
import { getSecret, SECRET_KEYS } from "../../secrets/secrets.ts";

const DOMAIN = "pro.betterdisplay.BetterDisplay";
const APP = "/Applications/BetterDisplay.app";

/**
 * BetterDisplay menu-bar layout. Each of the 33 menu features renders at one of
 * three levels: "less" (top menu, one click), "more" (submenu), "hide". The
 * "default" profile below was agreed with Peter (informed by his built-in +
 * 240Hz LC49G95T ultrawide): daily controls on top, occasional in submenus,
 * virtual-screen/connect noise hidden. Per-display settings (brightness values,
 * HiDPI, resolutions) are NOT presettable — they're a guided ceremony.
 */
type Level = "less" | "more" | "hide";

const TOP: string[] = [
  "Brightness",
  "Resolution",
  "RefreshRate",
  "BlueLight",
  "XDRPreset",
  "Contrast",
  "Settings",
  "Quit",
  "CheckForUpdates",
];
const SUB: string[] = [
  "ColorMode",
  "ColorProfile",
  "ColorDepth",
  "Rotation",
  "Mirror",
  "PIP",
  "DDCInput",
  "DDCAdjustments",
  "ImageAdjustments",
  "DisplayMode",
  "ManageDisplay",
  "Move",
  "Toggles",
  "Volume",
  "DisplaysAndVirtualScreens",
  "Groups",
  "Stream",
];
const HIDDEN: string[] = [
  "ConfigProtection",
  "VideoFilterWindow",
  "ManageVirtualScreen",
  "VirtualScreenConnect",
  "VirtualScreenDisconnect",
  "DisplayConnect",
  "DisplayDisconnect",
];
export const ALL_MENU_FEATURES = [...TOP, ...SUB, ...HIDDEN];

/** Always-visible essentials, kept on top even in the minimal profile. */
const MINIMAL_TOP = new Set(["Brightness", "Resolution", "Settings", "Quit"]);

export function menuLevels(profile: "default" | "minimal" | "everything"): Record<string, Level> {
  const out: Record<string, Level> = {};
  for (const f of ALL_MENU_FEATURES) {
    if (profile === "everything") {
      out[f] = HIDDEN.includes(f) ? "hide" : "less"; // keep the virtual-screen noise hidden
    } else if (profile === "minimal") {
      out[f] = MINIMAL_TOP.has(f) ? "less" : "hide";
    } else {
      out[f] = TOP.includes(f) ? "less" : SUB.includes(f) ? "more" : "hide";
    }
  }
  return out;
}

/**
 * Register (or remove) BetterDisplay as a classic login item via System Events.
 * Used because BetterDisplay opts in through SMAppService, which has no
 * `defaults` key an external process can flip. Idempotent — checks first.
 */
async function setLoginItem(
  ctx: { run: (cmd: string[]) => Promise<{ exitCode: number; stdout: string }> },
  enabled: boolean,
): Promise<void> {
  const name = "BetterDisplay";
  const list = await ctx.run([
    "osascript",
    "-e",
    'tell application "System Events" to get the name of every login item',
  ]);
  const present = list.stdout
    .split(",")
    .map((s) => s.trim())
    .includes(name);
  if (enabled && !present) {
    await ctx.run([
      "osascript",
      "-e",
      `tell application "System Events" to make login item at end with properties {path:"${APP}", hidden:true, name:"${name}"}`,
    ]);
  } else if (!enabled && present) {
    await ctx.run([
      "osascript",
      "-e",
      `tell application "System Events" to delete login item "${name}"`,
    ]);
  }
}

export const betterDisplaySchema = z.object({
  menuProfile: z.enum(["default", "minimal", "everything"]).default("default"),
  /** Registered as a login item (SMAppService app — not a `defaults` key). */
  startAtLogin: z.boolean().default(true),
  /** Show the menu-bar icon (writes `hideMenuIcon`, inverted). */
  menuBarIcon: z.boolean().default(true),
  /** Dock icon visibility (`dockIcon` string enum). Peter's choice: never. */
  dockVisibility: z.enum(["never", "auto", "always"]).default("never"),
  /** Briefly show the Dock icon on startup (`dockInsertRecentsOnStartupWhenHidden`). */
  briefDockIconOnStartup: z.boolean().default(false),
  autoUpdate: z.boolean().default(true),
  sendUsageInfo: z.boolean().default(false),
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
    { id: "accessibility-grant", title: "Grant Accessibility (batched with other apps)" },
  ],
  detect: async (ctx) => {
    const r = await ctx.run([
      "/opt/homebrew/bin/brew",
      "list",
      "--cask",
      "--versions",
      "betterdisplay",
    ]);
    if (r.exitCode === 0) return { installed: true, version: r.stdout.trim().split(/\s+/)[1] };
    const plist = await ctx.run([
      "defaults",
      "read",
      `${APP}/Contents/Info`,
      "CFBundleShortVersionString",
    ]);
    return plist.exitCode === 0
      ? { installed: true, version: `${plist.stdout.trim()} (not brew-managed)` }
      : { installed: false };
  },
  install: async (ctx) => {
    const r = await ctx.run(["/opt/homebrew/bin/brew", "install", "--cask", "betterdisplay"]);
    if (r.exitCode !== 0) throw new Error(`brew install betterdisplay failed: ${r.stderr.trim()}`);
    const zip = "/tmp/envsetup-betterdisplaycli.zip";
    const dl = await ctx.run([
      "curl",
      "-fsSL",
      "-o",
      zip,
      "https://github.com/waydabber/betterdisplaycli/releases/download/v1.0.1/betterdisplaycli-v1.0.1.zip",
    ]);
    if (dl.exitCode === 0) {
      await ctx.run(["unzip", "-o", zip, "-d", "/tmp/envsetup-bdcli"]);
      const found = await ctx.run([
        "/bin/sh",
        "-c",
        "find /tmp/envsetup-bdcli -name betterdisplaycli -type f | head -1",
      ]);
      const bin = found.stdout.trim();
      if (bin) {
        await ctx.run(["chmod", "+x", bin]);
        await ctx.run(["mv", bin, "/opt/homebrew/bin/betterdisplaycli"]);
      }
      await ctx.run(["rm", "-rf", zip, "/tmp/envsetup-bdcli"]);
    } else {
      ctx.log("betterdisplaycli download skipped (offline?) — the app works without it");
    }
  },
  configure: async (ctx, config) => {
    // Menu-bar layout (all 33 features written before first launch).
    const levels = menuLevels(config.menuProfile);
    for (const [feature, level] of Object.entries(levels)) {
      await ctx.run(["defaults", "write", DOMAIN, `menuLevel${feature}`, "-string", level]);
    }
    // Dock icon visibility (string enum: never/auto/always/show/hide).
    await ctx.run(["defaults", "write", DOMAIN, "dockIcon", "-string", config.dockVisibility]);
    // Boolean behavior. `hideMenuIcon` is inverted (show icon => hide=false).
    for (const [key, value] of [
      ["hideMenuIcon", !config.menuBarIcon],
      ["dockInsertRecentsOnStartupWhenHidden", config.briefDockIconOnStartup],
      ["SUEnableAutomaticChecks", config.autoUpdate],
      ["SUAutomaticallyUpdate", config.autoUpdate],
      ["SUSendProfileInfo", config.sendUsageInfo],
    ] as const) {
      await ctx.run(["defaults", "write", DOMAIN, key, "-bool", value ? "true" : "false"]);
    }
    // Start at login: BetterDisplay is an SMAppService app, so `defaults` can't
    // set it. Register/unregister a classic login item via System Events instead.
    await setLoginItem(ctx, config.startAtLogin);
    if ((await getSecret(SECRET_KEYS.betterDisplayLicense)) === null) {
      ctx.log("no BetterDisplay license in the store — the ceremony handles activation");
    }
    ctx.log(`menu layout: ${config.menuProfile} (9 top / 17 submenu / 7 hidden by default)`);
  },
  verify: async (ctx) =>
    (await ctx.run(["defaults", "read", DOMAIN, "menuLevelBrightness"])).exitCode === 0 ||
    (await ctx.run(["ls", APP])).exitCode === 0,
});
