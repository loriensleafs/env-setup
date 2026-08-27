import { homedir } from "node:os";
import { defineItem, type ItemContext } from "../item.ts";
import { getSecret, SECRET_KEYS } from "../../secrets/secrets.ts";

const DOMAIN = "pl.maketheweb.cleanshotx";

/**
 * Captured from Peter's configured machine 2026-08-26 (CleanShot 4.8.10).
 * The app stores its license as a plain defaults key and only writes
 * changed-from-default settings — so writing these BEFORE first launch yields
 * a licensed, configured app. Shortcut takeover: ⇧⌘3/4/5 as JSON data blobs
 * (carbonModifiers 768 = cmd+shift; keys 20/21/23 = 3/4/5).
 */
const SHORTCUTS: [string, string][] = [
  ["LAVAtakeFullscreen", '{"carbonModifiers":768,"carbonKey":20}'],
  ["LAVAtakeArea", '{"carbonModifiers":768,"carbonKey":21}'],
  ["LAVAtakeAllInOne", '{"carbonModifiers":768,"carbonKey":23}'],
];

function settings(home: string): [string, string[]][] {
  return [
    ["exportPath", ["-string", `${home}/Screenshots`]],
    ["captureCursor", ["-bool", "true"]],
    ["showCountdown", ["-bool", "true"]],
    ["popupAskForDestinationWhenSaving", ["-bool", "false"]],
    ["deletePopupAfterDragging", ["-bool", "true"]],
    ["floatingOverlayShowBorder", ["-bool", "false"]],
    ["add2xRetinaSuffix", ["-bool", "false"]],
    ["transparentWindowBackground", ["-bool", "true"]],
    ["showMenubarIcon", ["-bool", "true"]],
    ["showDockIconWhenAnnotate", ["-bool", "false"]],
    ["analyticsAllowed", ["-bool", "false"]],
    // afterScreenshotActions [0,1,2,3,6] / afterVideoActions [0,2] — captured arrays
    ["afterScreenshotActions", ["-array", "0", "1", "2", "3", "6"]],
    ["afterVideoActions", ["-array", "0", "2"]],
  ];
}

async function write(ctx: ItemContext, key: string, args: string[]): Promise<void> {
  const r = await ctx.run(["defaults", "write", DOMAIN, key, ...args]);
  if (r.exitCode !== 0) throw new Error(`defaults write ${key} failed: ${r.stderr.trim()}`);
}

export const cleanshotConfig = defineItem({
  id: "cleanshot-config",
  title: "CleanShot X configuration",
  kind: "config-only",
  deps: ["cleanshot"],
  ceremonies: [
    {
      id: "cleanshot-verify",
      title: "Confirm CleanShot activated + grant screen-recording permission",
    },
  ],
  detect: async (ctx) => {
    const key = await ctx.run(["defaults", "read", DOMAIN, "activationKey"]);
    const path = await ctx.run(["defaults", "read", DOMAIN, "exportPath"]);
    return { installed: key.exitCode === 0 && path.stdout.includes("/Screenshots") };
  },
  configure: async (ctx) => {
    const license = await getSecret(SECRET_KEYS.cleanshotLicense);
    if (license !== null) {
      await write(ctx, "activationKey", ["-string", license]);
    } else {
      ctx.log("license not in unlocked secret store — activate via the app dialog");
    }
    await ctx.run(["mkdir", "-p", `${homedir()}/Screenshots`]);
    for (const [key, args] of settings(homedir())) await write(ctx, key, args);
    for (const [key, json] of SHORTCUTS) {
      const hex = Buffer.from(json, "utf8").toString("hex");
      await write(ctx, key, ["-data", hex]);
    }
    ctx.log("licensed + configured (⇧⌘3/4/5 takeover, ~/Screenshots, overlay flow)");
  },
  verify: async (ctx) =>
    (await ctx.run(["defaults", "read", DOMAIN, "exportPath"])).stdout.includes("Screenshots"),
});
