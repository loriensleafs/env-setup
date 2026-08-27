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

/**
 * macOS's own screenshot shortcuts for the SAME key combos. System symbolic
 * hotkeys beat app registrations (Kap #868; CleanShot's onboarding has you
 * uncheck these), so the takeover above is dead unless these are disabled:
 * 28 = ⇧⌘3 (save), 30 = ⇧⌘4 (save), 184 = ⇧⌘5 (screenshot/recording panel —
 * parameters 53/23/1179648 verified locally). The ⌃⇧⌘ copy variants (29/31)
 * don't collide and are left alone.
 */
const SCREENSHOT_HOTKEY_IDS = [28, 30, 184];

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
    // Drift-aware: EVERY written setting + the three shortcut blobs must match.
    // `differs` = some CleanShot config exists but doesn't match our values.
    let anyPresent = false;
    let matches = true;
    const check = (present: boolean, ok: boolean) => {
      if (present) anyPresent = true;
      if (!ok) matches = false;
    };
    // License: presence only — the value is a secret, not compared.
    const lic = await ctx.run(["defaults", "read", DOMAIN, "activationKey"]);
    check(lic.exitCode === 0, lic.exitCode === 0);
    for (const [key, args] of settings(homedir())) {
      const r = await ctx.run(["defaults", "read", DOMAIN, key]);
      const present = r.exitCode === 0;
      const raw = r.stdout.trim();
      let expected: string;
      if (args[0] === "-string") expected = args[1] as string;
      else if (args[0] === "-bool") expected = args[1] === "true" ? "1" : "0";
      else expected = args.slice(1).join(","); // -array
      const actual = args[0] === "-array" ? raw.replace(/[\s()]/g, "") : raw;
      check(present, present && actual === expected);
    }
    // Shortcut blobs: `defaults read` TRUNCATES -data values (verified), so
    // compare via the exported XML plist's base64 <data> payloads instead.
    const exp = await ctx.run(["defaults", "export", DOMAIN, "-"]);
    const xml = exp.exitCode === 0 ? exp.stdout.replace(/\s/g, "") : "";
    for (const [key, json] of SHORTCUTS) {
      const b64 = Buffer.from(json, "utf8").toString("base64");
      check(
        xml.includes(`<key>${key}</key>`),
        xml.includes(`<key>${key}</key><data>${b64}</data>`),
      );
    }
    // The system screenshot shortcuts must be OFF or the takeover is dead.
    // (Not counted toward anyPresent — this is system state, not CleanShot's.)
    const hk = await ctx.run([
      "defaults",
      "read",
      "com.apple.symbolichotkeys",
      "AppleSymbolicHotKeys",
    ]);
    for (const id of SCREENSHOT_HOTKEY_IDS) {
      const disabled =
        hk.exitCode === 0 &&
        new RegExp(`[\\s{]${id}\\s*=\\s*\\{\\s*enabled\\s*=\\s*0`).test(hk.stdout);
      if (!disabled) matches = false;
    }
    return { installed: matches, ...(!matches && anyPresent ? { differs: true } : {}) };
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
    // Free ⇧⌘3/4/5 from macOS so CleanShot's registrations actually fire.
    // `defaults write -dict-add` goes through cfprefsd (safer than editing the
    // plist file directly) and preserves the other hotkey entries.
    for (const id of SCREENSHOT_HOTKEY_IDS) {
      const r = await ctx.run([
        "defaults",
        "write",
        "com.apple.symbolichotkeys",
        "AppleSymbolicHotKeys",
        "-dict-add",
        String(id),
        "<dict><key>enabled</key><false/></dict>",
      ]);
      if (r.exitCode !== 0)
        throw new Error(`disabling system hotkey ${id} failed: ${r.stderr.trim()}`);
    }
    await ctx.run([
      "/System/Library/PrivateFrameworks/SystemAdministration.framework/Resources/activateSettings",
      "-u",
    ]);
    ctx.log("licensed + configured (⇧⌘3/4/5 takeover — system shortcuts freed, ~/Screenshots)");
  },
  verify: async (ctx) =>
    (await ctx.run(["defaults", "read", DOMAIN, "exportPath"])).stdout.includes("Screenshots"),
});
